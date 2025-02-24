/**
 * @description
 * Provides server actions (CRUD) for managing user picks in the `userPicksTable`.
 *
 * This table stores all user-generated picks for NBA (and future sports). Each record
 * tracks which user made the pick, the game chosen, the side/spread, and the pick result.
 *
 * Key Functions:
 * - createUserPickAction(pick): Creates a new user pick
 * - getUserPicksAction(userId): Retrieves all picks for a given user
 * - updateUserPickAction(id, data): Updates a user pick record
 * - deleteUserPickAction(id): Deletes a user pick record
 *
 * @dependencies
 * - Drizzle ORM: for database interactions
 * - userPicksTable from "@/db/schema/user-picks-schema"
 * - ActionState from "@/types" for returning typed success/failure states
 * - eq from "drizzle-orm" for constructing queries
 *
 * @notes
 * - Each function returns a Promise that resolves to an ActionState<T>.
 * - `ActionState` is defined as:
 *     type ActionState<T> =
 *       | { isSuccess: true; message: string; data: T }
 *       | { isSuccess: false; message: string; data?: never }
 * - We log any caught errors and return a structured response to the calling code.
 */

"use server"

import { db } from "@/db/db"
import {
  userPicksTable,
  InsertUserPick,
  SelectUserPick
} from "@/db/schema/user-picks-schema"
import { eq } from "drizzle-orm"
import { ActionState } from "@/types"

/**
 * Creates a new user pick in the database.
 *
 * @function createUserPickAction
 * @async
 * @param {InsertUserPick} pick - The data required to create a new user pick, matching InsertUserPick schema.
 * @returns {Promise<ActionState<SelectUserPick>>} - A Promise resolving to an ActionState containing the created user pick on success, or an error message on failure.
 * @example
 * ```ts
 * const result = await createUserPickAction({
 *   userId: "user_123",
 *   gameId: "nba_game_456",
 *   pick: "Lakers -3.5",
 *   result: null
 * })
 * if (result.isSuccess) {
 *   console.log("Created user pick:", result.data)
 * }
 * ```
 */
export async function createUserPickAction(
  pick: InsertUserPick
): Promise<ActionState<SelectUserPick>> {
  try {
    // Insert the new pick and return the created row
    const [newPick] = await db.insert(userPicksTable).values(pick).returning()

    return {
      isSuccess: true,
      message: "User pick created successfully",
      data: newPick
    }
  } catch (error) {
    console.error("Error creating user pick:", error)
    return { isSuccess: false, message: "Failed to create user pick" }
  }
}

/**
 * Retrieves all user picks from the database for a given user.
 *
 * @function getUserPicksAction
 * @async
 * @param {string} userId - The user's unique ID for whom picks will be retrieved.
 * @returns {Promise<ActionState<SelectUserPick[]>>} - A Promise resolving to an ActionState containing an array of picks on success, or an error message on failure.
 * @example
 * ```ts
 * const result = await getUserPicksAction("user_123")
 * if (result.isSuccess) {
 *   console.log("All user picks:", result.data)
 * }
 * ```
 */
export async function getUserPicksAction(
  userId: string
): Promise<ActionState<SelectUserPick[]>> {
  try {
    // Query all picks where userId matches
    const picks = await db.select().from(userPicksTable).where(eq(userPicksTable.userId, userId))

    return {
      isSuccess: true,
      message: "User picks retrieved successfully",
      data: picks
    }
  } catch (error) {
    console.error("Error retrieving user picks:", error)
    return { isSuccess: false, message: "Failed to retrieve user picks" }
  }
}

/**
 * Updates an existing user pick in the database by ID.
 *
 * @function updateUserPickAction
 * @async
 * @param {string} id - The UUID string of the user pick to update.
 * @param {Partial<InsertUserPick>} data - An object containing the fields to update.
 * @returns {Promise<ActionState<SelectUserPick>>} - A Promise resolving to an ActionState containing the updated pick on success, or an error message on failure.
 * @example
 * ```ts
 * const result = await updateUserPickAction("uuid_of_existing_pick", { result: "win" })
 * if (result.isSuccess) {
 *   console.log("Updated pick:", result.data)
 * }
 * ```
 */
export async function updateUserPickAction(
  id: string,
  data: Partial<InsertUserPick>
): Promise<ActionState<SelectUserPick>> {
  try {
    // Update the pick with the provided partial data
    const [updatedPick] = await db
      .update(userPicksTable)
      .set(data)
      .where(eq(userPicksTable.id, id))
      .returning()

    if (!updatedPick) {
      return {
        isSuccess: false,
        message: "User pick not found or no update performed"
      }
    }

    return {
      isSuccess: true,
      message: "User pick updated successfully",
      data: updatedPick
    }
  } catch (error) {
    console.error("Error updating user pick:", error)
    return { isSuccess: false, message: "Failed to update user pick" }
  }
}

/**
 * Deletes a user pick from the database by ID.
 *
 * @function deleteUserPickAction
 * @async
 * @param {string} id - The UUID of the user pick to delete.
 * @returns {Promise<ActionState<void>>} - A Promise resolving to an ActionState indicating success or failure.
 * @example
 * ```ts
 * const result = await deleteUserPickAction("uuid_of_pick_to_delete")
 * if (result.isSuccess) {
 *   console.log("User pick deleted!")
 * }
 * ```
 */
export async function deleteUserPickAction(id: string): Promise<ActionState<void>> {
  try {
    const result = await db
      .delete(userPicksTable)
      .where(eq(userPicksTable.id, id))
      .returning()

    if (result.length === 0) {
      return { isSuccess: false, message: "User pick not found to delete" }
    }

    return {
      isSuccess: true,
      message: "User pick deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting user pick:", error)
    return { isSuccess: false, message: "Failed to delete user pick" }
  }
}
