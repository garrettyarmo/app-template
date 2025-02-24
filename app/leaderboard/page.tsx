/**
 * @file page.tsx
 * @description
 * This server page displays the Leaderboard, using the getLeaderboardAction from
 * '@/actions/db/leaderboard-actions' to fetch aggregated data. We parse an optional
 * "days" query param, typed locally to avoid collisions with Next's "PageProps" type.
 *
 * Key points:
 * - We define a local interface "LeaderboardPageProps" to accept { searchParams } as a plain object.
 * - We do NOT import or rely on Next's default "PageProps" to avoid the mismatch "Promise<any>" type.
 * - The aggregator logic is the same as previous code, but with an updated, conflict-free type signature.
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
 * A local interface for the page props to avoid any conflict with
 * custom or default Next.js "PageProps." This file no longer references
 * Next's "PageProps," preventing the "Promise<any>" mismatch issue.
 */
interface LeaderboardPageProps {
  /**
   * searchParams is an optional object shaped like { days?: string }.
   * If present, we parse "days" from the query string as an integer.
   */
  searchParams?: {
    days?: string
  }
}

/**
 * LeaderboardPage
 *
 * A Next.js 13/15 server component that displays user performance data.
 * We parse ?days=7 if provided, and fetch aggregator results.
 *
 * @param {LeaderboardPageProps} props - The local page props,
 *   containing searchParams for the query string.
 * @returns A React node representing the leaderboard UI.
 */
export default async function LeaderboardPage({
  searchParams
}: LeaderboardPageProps) {
  // Safely parse the "?days=7" query param, if present
  let daysParam: number | undefined
  if (searchParams?.days) {
    const parsed = parseInt(searchParams.days, 10)
    if (isNaN(parsed) || parsed < 1) {
      // If invalid, redirect to base route
      return redirect("/leaderboard")
    }
    daysParam = parsed
  }

  // Fetch aggregator result
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
