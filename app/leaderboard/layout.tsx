/**
 * @file layout.tsx
 * @description
 * Provides a layout for /leaderboard route, including the site Header.
 *
 * Key Features:
 * - Imports the global header from @/components/header
 * - Renders any nested pages below the header
 * - Ensures consistent layout and styling for the Leaderboard page
 *
 * @notes
 * - This ensures that the user sees the same top nav as the rest of the site
 * - "use server" is declared since layout files in Next.js App Router are typically server components
 */

"use server"

import Header from "@/components/header"

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
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  )
}
