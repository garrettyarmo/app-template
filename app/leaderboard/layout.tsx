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

import Header from "@/components/header"

interface LeaderboardLayoutProps {
  children: React.ReactNode
}

/**
 * The layout for /leaderboard
 * Renders a shared header and then the leaderboard content below.
 */
export default async function LeaderboardLayout({
  children
}: LeaderboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  )
}
