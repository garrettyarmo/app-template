/**
 * @file layout.tsx
 * @description
 * This server component wraps the /picks route with a shared Header for navigation and branding.
 *
 * Key Features:
 * - Imports the global header from @/components/header.
 * - Renders children (the actual AI Picks page content).
 * - Ensures a consistent layout with the header at the top.
 *
 * @notes
 * - Because this is a Next.js App Router layout file, it needs to be a server component
 *   (indicated by "use server") unless you specifically want client-side logic.
 * - The <Header> is a client component, so it must be nested in the server layout.
 */

"use server"

import Header from "@/components/header"

interface PicksLayoutProps {
  children: React.ReactNode
}

/**
 * The layout for /picks
 * Wraps the AI Picks page with our global <Header>.
 */
export default async function PicksLayout({ children }: PicksLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  )
}
