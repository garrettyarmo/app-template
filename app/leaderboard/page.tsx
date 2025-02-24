/**
 * @file page.tsx
 * @description
 * This server page displays the user leaderboard, showing total picks, total wins, total losses, etc.
 *
 * Features:
 * 1. Supports an optional "days" query param (e.g., ?days=7) to filter picks in the last X days.
 * 2. Calls getLeaderboardAction from @/actions/db/leaderboard-actions to fetch aggregated data.
 * 3. Renders a table using the Shadcn table components.
 * 4. Provides two simple filter links: "All Time" and "Last 7 Days".
 *
 * Behavior:
 * - If ?days=7 is present, calls getLeaderboardAction(7).
 * - Otherwise, calls getLeaderboardAction() for all-time results.
 * - Each row shows userId, total picks, total wins, total losses, total pushes, and a basic win percentage.
 *
 * @dependencies
 * - getLeaderboardAction from "@/actions/db/leaderboard-actions"
 * - Table components from "@/components/ui/table"
 *
 * @notes
 * - This page does NOT require authentication; it’s open to all users. If you want gating, add login checks.
 * - In production, you might join userId to user profile to display a username. For now, we just show userId.
 * - The data set might be small or large depending on usage. For large data sets, consider pagination or limiting.
 *
 * Edge Cases & Error Handling:
 * - If the action fails, we show a fallback error message.
 * - If there's no data, we display "No leaderboard data available."
 *
 * Example Usage:
 * - /leaderboard         -> fetch all-time
 * - /leaderboard?days=7  -> fetch last 7 days
 */

"use server"

import { Suspense } from "react"
import { getLeaderboardAction } from "@/actions/db/leaderboard-actions"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table"
import { redirect } from "next/navigation"

interface LeaderboardPageProps {
  searchParams: {
    days?: string
  }
}

export default async function LeaderboardPage({
  searchParams
}: LeaderboardPageProps) {
  // Attempt to parse "days" from query string
  const daysParam = searchParams.days
    ? parseInt(searchParams.days, 10)
    : undefined

  // Validate that days is a positive number if provided
  if (daysParam !== undefined && (isNaN(daysParam) || daysParam < 1)) {
    // If invalid, redirect to a safe default (all-time)
    return redirect("/leaderboard")
  }

  // Fetch leaderboard data from our server action
  const leaderboardResult = await getLeaderboardAction(daysParam)

  if (!leaderboardResult.isSuccess) {
    // If for some reason the call fails, show a fallback
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Leaderboard</h1>
        <p className="text-destructive">
          Failed to load leaderboard data: {leaderboardResult.message}
        </p>
      </div>
    )
  }

  const leaderboardData = leaderboardResult.data

  // A simple UI allowing user to switch between "All Time" and "Last 7 Days"
  // We'll highlight the current selection for convenience
  const currentFilter = daysParam ? `${daysParam} Days` : "All Time"

  return (
    <Suspense fallback={<div className="p-4">Loading leaderboard...</div>}>
      <div className="p-8">
        <h1 className="mb-4 text-center text-2xl font-bold">Leaderboard</h1>

        <div className="mb-6 flex justify-center gap-4">
          {/* Link to all-time */}
          <a
            href="/leaderboard"
            className={`hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1 text-sm font-medium ${
              !daysParam ? "underline" : ""
            }`}
          >
            All Time
          </a>

          {/* Link to last 7 days */}
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

        {/* If no data, show a message */}
        {leaderboardData.length === 0 ? (
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
              {leaderboardData.map((entry, idx) => (
                <TableRow key={`${entry.userId}_${idx}`}>
                  <TableCell>{entry.userId}</TableCell>
                  <TableCell>{entry.totalPicks}</TableCell>
                  <TableCell>{entry.totalWins}</TableCell>
                  <TableCell>{entry.totalLosses}</TableCell>
                  <TableCell>{entry.totalPushes}</TableCell>
                  <TableCell>
                    {isNaN(entry.winPercentage)
                      ? "0"
                      : (entry.winPercentage * 100).toFixed(1)}
                    %
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
