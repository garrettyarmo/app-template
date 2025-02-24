/**
 * @file nba-picks-actions.ts
 * @description
 * This file contains server actions (CRUD) for managing NBA picks in the `nbaPicksTable`.
 * The table schema is defined in `@/db/schema/nba-picks-schema`.
 *
 * Available actions:
 * 1) createNbaPickAction
 * 2) getNbaPicksAction
 * 3) updateNbaPickAction
 * 4) deleteNbaPickAction
 *
 * Each action:
 * - uses Drizzle ORM to interact with the database
 * - returns a Promise of ActionState<T> indicating success or failure
 * - logs errors to the console for debugging
 *
 * @dependencies
 * - Drizzle ORM: for database interactions
 * - `nbaPicksTable` from "@/db/schema/nba-picks-schema"
 * - `ActionState` from "@/types"
 * - `eq` from "drizzle-orm" for constructing queries
 *
 * @notes
 * - If you want to filter picks by date or other criteria, you could extend `getNbaPicksAction`.
 * - Use environment variables for any external integrations or keys if needed.
 */

"use server"

import { db } from "@/db/db"
import { nbaPicksTable, InsertNbaPick, SelectNbaPick } from "@/db/schema/nba-picks-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

/**
 * Creates a new NBA pick in the database.
 *
 * @param pick - The data required to create a new NBA pick, matching InsertNbaPick.
 * @returns A Promise resolving to an ActionState object containing the created pick on success.
 * @example
 * ```ts
 * const result = await createNbaPickAction({
 *   gameId: "nba-game-123",
 *   spreadPick: "Lakers -3.5",
 *   explanation: "The Lakers have been strong on home court..."
 * })
 * ```
 */
export async function createNbaPickAction(
  pick: InsertNbaPick
): Promise<ActionState<SelectNbaPick>> {
  try {
    const [newPick] = await db
      .insert(nbaPicksTable)
      .values(pick)
      .returning()

    return {
      isSuccess: true,
      message: "NBA pick created successfully",
      data: newPick
    }
  } catch (error) {
    console.error("Error creating NBA pick:", error)
    return { isSuccess: false, message: "Failed to create NBA pick" }
  }
}

/**
 * Retrieves NBA picks from the database.
 *
 * @returns A Promise resolving to an ActionState object containing an array of picks on success.
 * @example
 * ```ts
 * const result = await getNbaPicksAction()
 * if (result.isSuccess) {
 *   console.log("All picks:", result.data)
 * }
 * ```
 */
export async function getNbaPicksAction(): Promise<ActionState<SelectNbaPick[]>> {
  try {
    // If you need filtering by date or game, add query conditions here
    const picks = await db.select().from(nbaPicksTable)
    return {
      isSuccess: true,
      message: "NBA picks retrieved successfully",
      data: picks
    }
  } catch (error) {
    console.error("Error retrieving NBA picks:", error)
    return { isSuccess: false, message: "Failed to retrieve NBA picks" }
  }
}

/**
 * Updates an existing NBA pick in the database.
 *
 * @param id - The UUID string of the NBA pick to update.
 * @param data - A Partial<InsertNbaPick> object containing the fields to update.
 * @returns A Promise resolving to an ActionState object containing the updated pick on success.
 * @example
 * ```ts
 * const result = await updateNbaPickAction("some-uuid", {
 *   spreadPick: "Warriors -4.5"
 * })
 * ```
 */
export async function updateNbaPickAction(
  id: string,
  data: Partial<InsertNbaPick>
): Promise<ActionState<SelectNbaPick>> {
  try {
    const [updatedPick] = await db
      .update(nbaPicksTable)
      .set(data)
      .where(eq(nbaPicksTable.id, id))
      .returning()

    if (!updatedPick) {
      return { isSuccess: false, message: "NBA pick not found to update" }
    }

    return {
      isSuccess: true,
      message: "NBA pick updated successfully",
      data: updatedPick
    }
  } catch (error) {
    console.error("Error updating NBA pick:", error)
    return { isSuccess: false, message: "Failed to update NBA pick" }
  }
}

/**
 * Deletes an NBA pick from the database.
 *
 * @param id - The UUID string of the NBA pick to delete.
 * @returns A Promise resolving to an ActionState<void> indicating success or failure.
 * @example
 * ```ts
 * const result = await deleteNbaPickAction("some-uuid")
 * ```
 */
export async function deleteNbaPickAction(id: string): Promise<ActionState<void>> {
  try {
    const result = await db
      .delete(nbaPicksTable)
      .where(eq(nbaPicksTable.id, id))
      .returning()

    if (result.length === 0) {
      return { isSuccess: false, message: "NBA pick not found to delete" }
    }

    return {
      isSuccess: true,
      message: "NBA pick deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting NBA pick:", error)
    return { isSuccess: false, message: "Failed to delete NBA pick" }
  }
}
