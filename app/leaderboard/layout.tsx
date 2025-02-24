/**
 * @file layout.tsx
 * @description
 * Provides a layout for /leaderboard route, including the new site Header.
 *
 * Key Features:
 * - Imports the global header from @/components/header.
 * - Renders /leaderboard content below the header.
 * - Ensures consistent user experience across the site.
 *
 * @notes
 * - This layout ensures that the user sees the same top nav on the leaderboard page.
 * - Additional sidebar or other structures could be added here if needed.
 */

"use server"

import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getLeaderboardAction } from "@/actions/db/leaderboard-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

/**
 * Instead of naming a type 'SearchParams', define a quick inline interface,
 * or rename your type to avoid overshadowing Next's usage.
 */

interface LeaderboardPageProps {
  searchParams?: {
    days?: string
  }
}

export default async function LeaderboardPage({
  searchParams
}: LeaderboardPageProps) {
  // parse ?days=7 if present
  const daysParam = searchParams?.days
    ? parseInt(searchParams.days, 10)
    : undefined

  // if daysParam is invalid, optionally redirect or fallback
  if (daysParam !== undefined && (isNaN(daysParam) || daysParam < 1)) {
    return redirect("/leaderboard")
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
          {/* Link for "All Time" */}
          <a
            href="/leaderboard"
            className={`hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1 text-sm font-medium ${
              !daysParam ? "underline" : ""
            }`}
          >
            All Time
          </a>

          {/* Link for "Last 7 Days" */}
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
