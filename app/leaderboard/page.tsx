/**
 * @file page.tsx
 * @description
 * A Next.js server component for displaying the Leaderboard page, with proper types for `searchParams`.
 *
 * Key Changes to Fix Type Error:
 * - Removed the custom interface `LeaderboardPageProps`.
 * - Instead, we directly type the `searchParams` param as an object with optional `days` string.
 * - This aligns with Next.js App Router standards, fixing the “Type 'Promise<any>'” mismatch.
 *
 * Usage:
 * - /leaderboard => All-time
 * - /leaderboard?days=7 => Last 7 days
 */

"use server"

import { Suspense } from "react"
import { getLeaderboardAction } from "@/actions/db/leaderboard-actions"
import { redirect } from "next/navigation"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table"

// Adjust this type for your actual searchParams usage.
// If you have more query params, add them here.
type SearchParams = {
  days?: string
}

export default async function LeaderboardPage({
  searchParams
}: {
  searchParams?: SearchParams
}) {
  // Safely parse the "?days=7" query param, if present
  const daysParam = searchParams?.days
    ? parseInt(searchParams.days, 10)
    : undefined

  if (daysParam !== undefined && (isNaN(daysParam) || daysParam < 1)) {
    return redirect("/leaderboard") // or handle invalid param with fallback
  }

  const leaderboardResult = await getLeaderboardAction(daysParam)

  if (!leaderboardResult.isSuccess) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Leaderboard</h1>
        <p className="text-destructive">{leaderboardResult.message}</p>
      </div>
    )
  }

  const data = leaderboardResult.data
  const currentFilter = daysParam ? `${daysParam} Days` : "All Time"

  return (
    <Suspense fallback={<div className="p-4">Loading leaderboard...</div>}>
      <div className="p-8">
        <h1 className="mb-4 text-center text-2xl font-bold">Leaderboard</h1>

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
