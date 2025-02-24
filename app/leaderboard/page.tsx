/**
 * @file page.tsx
 * @description
 * A Next.js 13 App Router server component that displays the Leaderboard page.
 *
 * This file fetches leaderboard data (by days) from a server action,
 * then renders a table of user performance.
 *
 * Key Features:
 * 1. Type `searchParams` as a simple object (not a Promise).
 * 2. Aggregate data via getLeaderboardAction from @/actions/db/leaderboard-actions.
 * 3. Validate "days" param to handle invalid or missing queries.
 * 4. Display table or a fallback if there's no data.
 *
 * @notes
 * - We separate layout concerns into layout.tsx, which simply returns children.
 * - This approach resolves compile errors about mismatched searchParams types.
 * - The function is marked async so we can fetch data from server actions (DB).
 */

"use server"

import { Suspense } from "react"
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
 * Type definition for the searchParams passed to this server page.
 * Next.js provides them as a plain object.
 * In this example, we only care about "days" for optional filtering.
 */
interface LeaderboardSearchParams {
  days?: string
}

/**
 * The server page that renders the leaderboard.
 *
 * @param {object} props The page props passed by Next.js
 * @param {LeaderboardSearchParams} props.searchParams
 *   The object containing query params from the URL, e.g. ?days=7
 *
 * @returns A React node for the UI
 */
export default async function LeaderboardPage({
  searchParams
}: {
  searchParams?: LeaderboardSearchParams
}) {
  // Safely parse the "?days=7" query param, if present
  let daysParam: number | undefined
  if (searchParams?.days) {
    // parse as integer
    const parsed = parseInt(searchParams.days, 10)
    if (isNaN(parsed) || parsed < 1) {
      // redirect to the base route if invalid
      return redirect("/leaderboard")
    }
    daysParam = parsed
  }

  // fetch aggregator result
  const leaderboardResult = await getLeaderboardAction(daysParam)
  if (!leaderboardResult.isSuccess) {
    // If the aggregator action fails, show an error
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Leaderboard</h1>
        <p className="text-destructive">{leaderboardResult.message}</p>
      </div>
    )
  }

  // Data is an array of user performance stats
  const data = leaderboardResult.data
  const currentFilter = daysParam ? `${daysParam} Days` : "All Time"

  return (
    <Suspense fallback={<div className="p-4">Loading leaderboard...</div>}>
      <div className="p-8">
        <h1 className="mb-4 text-center text-2xl font-bold">Leaderboard</h1>

        {/* Filter Links */}
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
