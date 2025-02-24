/**
 * @file leaderboard-actions.ts
 * @description
 * Provides a server action for generating and retrieving leaderboard data.
 *
 * The primary action here is `getLeaderboardAction`, which aggregates user picks from the
 * `user_picks` table to produce a basic leaderboard. We can optionally filter by a timeframe
 * (e.g., the last 7 days), then calculate total picks, total wins, total losses, total pushes,
 * and a simple win percentage for each user.
 *
 * Key Functions:
 * - getLeaderboardAction(days?: number): Retrieves leaderboard data with optional timeframe.
 *
 * @dependencies
 * - Drizzle: We use `db.execute(sql.raw(...))` to run a raw SQL query for grouping/aggregation.
 * - userPicksTable from "@/db/schema/user-picks-schema"
 * - ActionState from "@/types" to ensure consistent server action return type.
 *
 * @notes
 * - This approach uses a raw SQL query to leverage GROUP BY and sum logic. We parse numeric
 *   fields into `number` in TypeScript before returning the data. Alternatively, we could
 *   retrieve all picks and do JavaScript-based aggregation, but that is less efficient for
 *   large data sets.
 * - The `days` parameter is optional; if provided, it adds a `WHERE created_at > now() - interval 'X days'`
 *   to filter picks within that timeframe.
 * - The query sorts by total wins descending by default, as an example approach.
 * - In real usage, you might want to join with `profilesTable` to retrieve a username or membership status,
 *   or fetch from Clerk directly. This is a bare-bones aggregator for demonstration.
 * - Be mindful of user privacy, ensuring you only display relevant data.
 */

"use server"

import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import { ActionState } from "@/types"

/**
 * Represents a single row of aggregated leaderboard data, including
 * the user's ID, total picks, total wins, total losses, total pushes,
 * and a simple winPercentage (wins / totalPicks).
 */
export interface LeaderboardEntry {
  userId: string
  totalPicks: number
  totalWins: number
  totalLosses: number
  totalPushes: number
  winPercentage: number
}

/**
 * getLeaderboardAction
 * @description
 * Aggregates user picks to form a leaderboard. By default, calculates all-time results.
 * Optionally filters to picks within the last X days if `days` is provided.
 *
 * @param {number} [days] - (Optional) If provided, only picks created in the past `days` days are included.
 * @returns {Promise<ActionState<LeaderboardEntry[]>>} Returns an action state with the leaderboard data or an error message.
 *
 * Example usage:
 * ```ts
 * const result = await getLeaderboardAction(7)
 * if (result.isSuccess) {
 *   console.log(result.data) // array of LeaderboardEntry
 * }
 * ```
 */
export async function getLeaderboardAction(
  days?: number
): Promise<ActionState<LeaderboardEntry[]>> {
  try {
    // Construct the base SQL query
    let query = `
      SELECT
        user_id,
        COUNT(*) AS total_picks,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS total_wins,
        SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) AS total_losses,
        SUM(CASE WHEN result = 'push' THEN 1 ELSE 0 END) AS total_pushes
      FROM user_picks
    `

    // If we want to filter by a timeframe
    if (days) {
      query += ` WHERE created_at > now() - interval '${days} day' `
    }

    // Group by user and sort by total wins desc as an example
    query += `
      GROUP BY user_id
      ORDER BY total_wins DESC;
    `

    // Execute the raw SQL. We cast the result to an object with .rows
    const result = await db.execute(sql.raw(query))
    type Row = {
      user_id: string
      total_picks: string
      total_wins: string
      total_losses: string
      total_pushes: string
    }

    // Using a type assertion to handle the shape of drizzle's return
    const { rows } = result as unknown as { rows: Row[] }

    // Convert each row's numeric columns to numbers and compute a simple winPercentage
    const data = rows.map(row => {
      const totalPicks = parseInt(row.total_picks, 10)
      const totalWins = parseInt(row.total_wins, 10)
      const totalLosses = parseInt(row.total_losses, 10)
      const totalPushes = parseInt(row.total_pushes, 10)

      return {
        userId: row.user_id,
        totalPicks,
        totalWins,
        totalLosses,
        totalPushes,
        winPercentage: totalPicks > 0 ? totalWins / totalPicks : 0
      }
    })

    return {
      isSuccess: true,
      message: "Leaderboard data retrieved successfully",
      data
    }
  } catch (error) {
    console.error("Error retrieving leaderboard data:", error)
    return { isSuccess: false, message: "Failed to retrieve leaderboard data" }
  }
}
