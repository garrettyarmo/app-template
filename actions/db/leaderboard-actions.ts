/**
 * @file leaderboard-actions.ts
 * @description
 * Provides a server action for generating and retrieving leaderboard data.
 *
 * The primary function is `getLeaderboardAction(days?)`, which retrieves
 * aggregated picks from the `user_picks` table using raw SQL.
 *
 * Type Fix:
 * - We define a union type `DrizzleResult` representing the possible return
 *   from `db.execute(...)`. Drizzle can return a single result object or an array.
 * - This eliminates the “Property 'rows' does not exist on type 'never'.” error.
 *
 * @dependencies
 * - drizzle-orm for raw SQL execution
 * - userPicks table from "@/db/schema/user-picks-schema"
 * - ActionState from "@/types" for typed success/failure states
 */

"use server"

import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import { ActionState } from "@/types"

/**
 * If we do `await db.execute(sql.raw(...))`, Drizzle can return:
 * - a single object with a `.rows` array (for single statements)
 * - or an array of objects if multiple statements are in the raw query
 *
 * We define these as a union for TypeScript:
 */
type SingleDrizzleResult = {
  rows?: any[]
  command?: string
  // Possibly other fields, but we're concerned primarily with .rows
}

type MultiDrizzleResult = SingleDrizzleResult[]

type DrizzleResult = SingleDrizzleResult | MultiDrizzleResult

/**
 * Each row from the leaderboard query is shaped like:
 * {
 *   user_id: string
 *   total_picks: string
 *   total_wins: string
 *   total_losses: string
 *   total_pushes: string
 * }
 * We'll parse them into numbers and compute a simple ratio (winPercentage).
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
 * Aggregates user picks from `user_picks` by userId, counting total picks, wins, losses, pushes, etc.
 *
 * @param {number} [days] If provided, filter to picks in the past X days
 * @returns Promise<ActionState<LeaderboardEntry[]>>
 */
export async function getLeaderboardAction(
  days?: number
): Promise<ActionState<LeaderboardEntry[]>> {
  try {
    // 1. Build raw SQL
    let query = `
      SELECT
        user_id,
        COUNT(*) AS total_picks,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS total_wins,
        SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) AS total_losses,
        SUM(CASE WHEN result = 'push' THEN 1 ELSE 0 END) AS total_pushes
      FROM user_picks
    `
    // If days passed, filter on created_at
    if (days && days > 0) {
      query += ` WHERE created_at > NOW() - INTERVAL '${days} days' `
    }
    // Group + sort
    query += `
      GROUP BY user_id
      ORDER BY total_wins DESC
    `

    // 2. Execute the query, cast to our union type
    const result = (await db.execute(sql.raw(query))) as DrizzleResult

    // 3. Extract rawRows from result
    let rawRows: any[] = []

    // If it's an array, we assume multiple statements. Use first item if it exists
    if (Array.isArray(result)) {
      if (result.length > 0 && result[0].rows && Array.isArray(result[0].rows)) {
        rawRows = result[0].rows
      }
    } else {
      // Single result scenario
      if (result.rows && Array.isArray(result.rows)) {
        rawRows = result.rows
      }
    }

    // 4. Map the raw rows to typed data
    const data = rawRows.map(row => {
      const totalPicks = parseInt(row.total_picks, 10)
      const totalWins = parseInt(row.total_wins, 10)
      const totalLosses = parseInt(row.total_losses, 10)
      const totalPushes = parseInt(row.total_pushes, 10)

      const ratio = totalPicks > 0 ? totalWins / totalPicks : 0

      return {
        userId: row.user_id,
        totalPicks,
        totalWins,
        totalLosses,
        totalPushes,
        winPercentage: ratio
      } as LeaderboardEntry
    })

    return {
      isSuccess: true,
      message: "Leaderboard data retrieved successfully",
      data
    }
  } catch (error) {
    console.error("Error retrieving leaderboard data:", error)
    return {
      isSuccess: false,
      message: "Failed to retrieve leaderboard data"
    }
  }
}
