/**
 * @file profiles-schema.ts
 * @description
 * This file defines the Drizzle schema for the `profiles` table, which holds user profile data.
 *
 * Key fields:
 * - userId: The primary key, matching the user's unique ID from Clerk.
 * - membership: The user's membership tier, using an enum of ["free", "pro"].
 * - stripeCustomerId, stripeSubscriptionId: If the user is a paying customer,
 *   store the Stripe data here.
 * - createdAt, updatedAt: Timestamps for record creation and update.
 *
 * Additional exports:
 * - membershipEnum: The Drizzle-defined PG enum for membership statuses.
 * - MembershipStatus: A TypeScript type alias for membership values, allowing
 *   "free" or "pro".
 *
 * @dependencies
 * - drizzle-orm/pg-core for table & column definitions.
 * - This table is added to db/db.ts's schema object under "profiles".
 *
 * @notes
 * - If you want to add new membership tiers, update membershipEnum and MembershipStatus.
 * - The `updatedAt` column uses .$onUpdate(...) so that Drizzle sets it to new Date()
 *   whenever the row is updated.
 */

import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

/**
 * @constant membershipEnum
 * @description
 * Defines a PostgreSQL enum named "membership" with possible values: "free" or "pro".
 */
export const membershipEnum = pgEnum("membership", ["free", "pro"])

/**
 * @typedef MembershipStatus
 * @description
 * A union type (like "free" | "pro") that matches the membershipEnum's values.
 * This helps us do type-safe comparisons in server actions, etc.
 */
export type MembershipStatus = (typeof membershipEnum.enumValues)[number]

/**
 * The profiles table, storing user-level metadata in conjunction with Clerk.
 *
 * Columns:
 * - userId: The unique user ID (primary key).
 * - membership: The user's current membership tier, referencing membershipEnum.
 * - stripeCustomerId: The Stripe Customer ID if the user has one.
 * - stripeSubscriptionId: The Stripe Subscription ID if the user has one.
 * - createdAt: Timestamp at record creation.
 * - updatedAt: Timestamp at last update, auto-updated by Drizzle.
 */
export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),

  membership: membershipEnum("membership").notNull().default("free"),

  stripeCustomerId: text("stripe_customer_id"),

  stripeSubscriptionId: text("stripe_subscription_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * InsertProfile type is used to create new profile records.
 */
export type InsertProfile = typeof profilesTable.$inferInsert

/**
 * SelectProfile type is used to select/fetch profile records from the DB.
 */
export type SelectProfile = typeof profilesTable.$inferSelect
