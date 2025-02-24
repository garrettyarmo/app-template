/**
 * @file page.tsx
 * @description
 * This server page displays the Leaderboard, using the getLeaderboardAction from
 * "@/actions/db/leaderboard-actions" to fetch aggregated data. We parse an optional
 * "days" query param, typed locally to avoid collisions with Next's typical "PageProps".
 *
 * Key Points to Fix the Compile Error:
 * - We removed the custom "LeaderboardPageProps" interface that conflicted with Next 15.1's
 *   built-in PageProps type requirements.
 * - Instead, we inline the type for the function parameter, letting Next handle it gracefully.
 * - This prevents the mismatch "Type '{ days?: string }' is not assignable to 'Promise<any>'" error.
 *
 * Flow of Logic:
 * 1. We parse `days` from searchParams if present, ensuring it's a valid integer > 0 or
 *    redirecting if it's invalid.
 * 2. We fetch leaderboard data from getLeaderboardAction(...).
 * 3. We display the results in a simple table. If there's no data, we note it with a small message.
 * 4. Users can click "All Time" or "Last 7 Days" to filter results accordingly.
 *
 * Example Usage:
 *  - Access /leaderboard => shows all-time ranking
 *  - Access /leaderboard?days=7 => shows last 7 days of picks
 *
 * @dependencies
 * - getLeaderboardAction from "@/actions/db/leaderboard-actions" for DB aggregation
 * - "redirect" from "next/navigation" to handle any invalid query param scenario
 * - The table UI components from "@/components/ui/table" for rendering
 *
 * @notes
 * - We use React Suspense for demonstration. However, the fetch is direct in the server component.
 * - This approach is typical in Next.js 13+ server components with dynamic route search params.
 */

"use server"

import React, { Suspense } from "react"
import { redirect } from "next/navigation"

import { getLeaderboardAction } from "@/actions/db/leaderboard-actions"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table"

/**
 * LeaderboardPage
 *
 * Server component that displays aggregated pick data for user picks.
 * We parse `searchParams?.days` as a potential integer to filter data
 * over the last N days. If invalid, we redirect back to /leaderboard.
 *
 * The resulting data is shown in a table with columns for userId, picks,
 * wins, losses, pushes, etc.
 *
 * @param {{ searchParams?: { days?: string } }}
 *   The parameter object automatically provided by Next.js for search queries.
 */
export default async function LeaderboardPage({
  searchParams
}: {
  searchParams?: { days?: string }
}) {
  // Safely parse the "?days=7" query param, if present
  let daysParam: number | undefined = undefined
  if (searchParams?.days) {
    const parsed = parseInt(searchParams.days, 10)
    if (isNaN(parsed) || parsed < 1) {
      // If invalid, redirect to base route
      return redirect("/leaderboard")
    }
    daysParam = parsed
  }

  // Fetch aggregator result for the specified timeframe
  const leaderboardResult = await getLeaderboardAction(daysParam)

  // If the aggregator call fails, display an error message
  if (!leaderboardResult.isSuccess) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Leaderboard</h1>
        <p className="text-destructive">{leaderboardResult.message}</p>
      </div>
    )
  }

  // The aggregator returned data on success
  const data = leaderboardResult.data
  const currentFilter = daysParam ? `${daysParam} Days` : "All Time"

  return (
    <Suspense fallback={<div className="p-4">Loading leaderboard...</div>}>
      <div className="p-8">
        <h1 className="mb-4 text-center text-2xl font-bold">Leaderboard</h1>

        {/* Simple filter links: All Time vs Last 7 Days */}
        <div className="mb-6 flex justify-center gap-4">
          <a
            href="/leaderboard"
            className={`hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1 text-sm font-medium ${
              !daysParam ? "underline" : ""
            }`}
          >
            All Time
          </a>
          <a
            href="/leaderboard?days=7"
            className={`hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1 text-sm font-medium ${
              daysParam === 7 ? "underline" : ""
            }`}
          >
            Last 7 Days
          </a>
        </div>

        <div className="text-muted-foreground mb-4 text-center text-sm">
          Currently viewing: <span className="font-bold">{currentFilter}</span>
        </div>

        {data.length === 0 ? (
          <div className="mt-4 text-center text-sm italic">
            No leaderboard data available.
          </div>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Total Picks</TableHead>
                <TableHead>Wins</TableHead>
                <TableHead>Losses</TableHead>
                <TableHead>Pushes</TableHead>
                <TableHead>Win %</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((entry, idx) => (
                <TableRow key={`${entry.userId}_${idx}`}>
                  <TableCell>{entry.userId}</TableCell>
                  <TableCell>{entry.totalPicks}</TableCell>
                  <TableCell>{entry.totalWins}</TableCell>
                  <TableCell>{entry.totalLosses}</TableCell>
                  <TableCell>{entry.totalPushes}</TableCell>
                  <TableCell>
                    {(entry.winPercentage * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Suspense>
  )
}
