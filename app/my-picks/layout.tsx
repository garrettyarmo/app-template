/**
 * @file layout.tsx
 * @description
 * Provides a layout for /my-picks route, including the new site Header.
 *
 * Key Features:
 * - Imports the global header from @/components/header.
 * - Renders any nested pages (e.g. /my-picks/page.tsx) below the header.
 * - Ensures consistent layout and styling for the My Picks page.
 *
 * @notes
 * - This ensures that the user sees the same top nav as the rest of the site.
 * - "use server" is declared since layout files in Next.js App Router are typically server components.
 */

"use server"

import Header from "@/components/header"

interface MyPicksLayoutProps {
  children: React.ReactNode
}

/**
 * The layout for /my-picks
 * Renders the shared header and then any child pages or components below it.
 */
export default async function MyPicksLayout({ children }: MyPicksLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  )
}
