/**
 * @file layout.tsx
 * @description
 * A proper layout file for the /leaderboard route.
 * Next.js expects a layout to simply return React nodes for its children.
 *
 * Key Features:
 * - Declares itself as a server component using "use server" at the top.
 * - Returns the children it wraps in the /leaderboard route.
 *
 * @dependencies
 * - React for JSX usage
 * - This file does not import aggregator logic or searchParams; that logic belongs in page.tsx.
 *
 * @notes
 * - This fixes the compile error that occurred due to Next.js expecting a layout signature.
 * - If you want a custom header or common elements for all /leaderboard sub-routes, you can place them here.
 */

"use server"
import React from "react"

interface LeaderboardLayoutProps {
  children: React.ReactNode
}

/**
 * The layout for /leaderboard route.
 *
 * This simply wraps any child pages under /leaderboard with a container or common UI elements
 * if needed. For now, we only return {children}.
 *
 * @param {LeaderboardLayoutProps} props
 * @returns React JSX
 */
export default async function LeaderboardLayout({
  children
}: LeaderboardLayoutProps) {
  return <div className="min-h-screen w-full">{children}</div>
}
