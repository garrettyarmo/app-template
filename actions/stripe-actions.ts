/**
 * @file actions/stripe-actions.ts
 * @description
 * This server action file integrates with Stripe to manage user subscription status.
 * 
 * Key Exports:
 * - updateStripeCustomer(userId: string, subscriptionId: string, customerId: string):
 *     Updates the user's Stripe Customer ID and Subscription ID in the `profilesTable`.
 * - manageSubscriptionStatusChange(subscriptionId: string, customerId: string, productId: string):
 *     Retrieves the relevant Stripe objects, checks product metadata for membership type
 *     (e.g., "free", "pro"), and sets the user's membership accordingly if the subscription
 *     is active/trialing or canceled. 
 * 
 * Flow:
 * 1) When a Stripe checkout session completes, we call updateStripeCustomer(...) to store the
 *    user’s Stripe IDs in the profile record.
 * 2) Then we call manageSubscriptionStatusChange(...) to interpret the subscription status and
 *    set membership = "pro" if active, otherwise revert to "free".
 * 3) The membership gating logic is enforced throughout the app—for example, in routes where
 *    we check if (profile.membership === "pro").
 * 
 * @dependencies
 * - `@/actions/db/profiles-actions` for updating the DB
 * - `@/lib/stripe` for the Stripe client instance
 * - `drizzle-orm` types for DB interactions
 * - Type definitions from `@/types/server-action-types.ts`
 * 
 * @notes
 * - We rely on each Stripe product to have `product.metadata.membership` = "pro" or "free".
 *   If it’s not "free" or "pro", we throw an error.
 * - Subscriptions with statuses like "canceled", "incomplete", "past_due", etc., revert membership to "free".
 * - Additional subscription statuses (e.g., "trialing") set membership to the product’s metadata
 *   (usually "pro").
 * - Thorough error handling is included, with logs for debug.
 */

import { updateProfileAction, updateProfileByStripeCustomerIdAction } from "@/actions/db/profiles-actions"
import { SelectProfile } from "@/db/schema"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"
import type { MembershipStatus } from "@/db/schema/profiles-schema"

/**
 * Helper function that converts a Stripe subscription status + known membership
 * into a final membership value. 
 * 
 * @param {Stripe.Subscription.Status} status - The subscription’s status from Stripe.
 * @param {MembershipStatus} membership - The membership from Stripe product metadata ("free" or "pro").
 * @returns {MembershipStatus} The final membership for the user.
 * 
 * @notes
 * - If the subscription is active or trialing, we keep membership as indicated by the product metadata.
 * - If the subscription is canceled, incomplete, expired, paused, or unpaid, we revert membership to "free".
 */
const getMembershipStatus = (
  status: Stripe.Subscription.Status,
  membership: MembershipStatus
): MembershipStatus => {
  switch (status) {
    case "active":
    case "trialing":
      // Keep membership as indicated by the product's metadata
      return membership

    // If subscription is canceled or delinquent, revert to free
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      return "free"

    default:
      return "free"
  }
}

/**
 * Helper function to retrieve a Stripe subscription by ID, expanding the default payment method.
 * 
 * @param {string} subscriptionId - The ID of the subscription in Stripe.
 * @returns {Promise<Stripe.Subscription>} The retrieved subscription object.
 * @throws If the subscription retrieval fails, the error is thrown to the caller.
 */
const getSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"]
  })
}

/**
 * @function updateStripeCustomer
 * @description
 *   - After a user completes the Stripe checkout session, we store the Stripe
 *     customer ID and subscription ID in the `profiles` table for future reference.
 * 
 * @param {string} userId        - The user's ID from Clerk
 * @param {string} subscriptionId - The Stripe subscription ID
 * @param {string} customerId     - The Stripe customer ID
 * 
 * @returns {Promise<SelectProfile>}
 *   - Resolves with the updated profile from DB if successful
 *   - Throws an error if userId, subscriptionId, or customerId is missing
 * 
 * @example
 * const profile = await updateStripeCustomer("user_abc", "sub_123", "cus_xyz")
 */
export const updateStripeCustomer = async (
  userId: string,
  subscriptionId: string,
  customerId: string
): Promise<SelectProfile> => {
  try {
    if (!userId || !subscriptionId || !customerId) {
      throw new Error("Missing required parameters for updateStripeCustomer")
    }

    const subscription = await getSubscription(subscriptionId)
    if (!subscription) {
      throw new Error("Failed to retrieve subscription from Stripe.")
    }

    // Update the user’s profile with these Stripe details
    const result = await updateProfileAction(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id
    })
    if (!result.isSuccess) {
      throw new Error("Failed to update customer profile in DB.")
    }

    return result.data
  } catch (error) {
    console.error("Error in updateStripeCustomer:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update Stripe customer")
  }
}

/**
 * @function manageSubscriptionStatusChange
 * @description
 *   - Called when a Stripe webhook indicates that a subscription has been updated or deleted.
 *   - Looks up the subscription, determines membership from metadata, then sets "pro" or "free".
 * 
 * @param {string} subscriptionId - The Stripe subscription ID
 * @param {string} customerId     - The Stripe customer ID
 * @param {string} productId      - The Stripe product ID for the subscription item
 * 
 * @returns {Promise<MembershipStatus>} - The final membership that was set in the user’s profile
 * 
 * @example
 * // e.g. in a webhook
 * await manageSubscriptionStatusChange("sub_123", "cus_abc", "prod_XXX")
 */
export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
): Promise<MembershipStatus> => {
  try {
    if (!subscriptionId || !customerId || !productId) {
      throw new Error("Missing required parameters for manageSubscriptionStatusChange")
    }

    const subscription = await getSubscription(subscriptionId)
    if (!subscription) {
      throw new Error("Failed to retrieve subscription from Stripe.")
    }

    // We expect product metadata to include membership = "free" or "pro"
    const product = await stripe.products.retrieve(productId)
    if (!product || !product.metadata) {
      throw new Error("Failed to retrieve product or product metadata from Stripe.")
    }

    const membership = product.metadata.membership as MembershipStatus

    // If the product’s membership is not recognized, throw an error
    if (!["free", "pro"].includes(membership)) {
      throw new Error(
        `Invalid membership type in product metadata: ${membership}`
      )
    }

    // Convert the subscription status to either "pro" or "free"
    const membershipStatus = getMembershipStatus(subscription.status, membership)

    // Update the user’s profile in DB by referencing the stripeCustomerId
    const updateResult = await updateProfileByStripeCustomerIdAction(
      customerId,
      {
        stripeSubscriptionId: subscription.id,
        membership: membershipStatus
      }
    )

    if (!updateResult.isSuccess) {
      throw new Error("Failed to update subscription status in DB.")
    }

    return membershipStatus
  } catch (error) {
    console.error("Error in manageSubscriptionStatusChange:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update subscription status")
  }
}
