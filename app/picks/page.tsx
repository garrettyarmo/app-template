/**
 * @description
 * This server page displays the AI-generated NBA picks to "pro" members.
 * If the user is "free", we show a paywall or subscribe CTA.
 *
 * Behavior Outline:
 * 1. Retrieve current user from Clerk (via auth()).
 * 2. If no user is logged in, redirect to /login.
 * 3. Fetch the user's profile (getProfileByUserIdAction). If not found, redirect to /signup.
 * 4. Check membership status:
 *    - If "free", show an upsell/prompt to subscribe for full access.
 *    - If "pro", call getNbaPicksAction to get all AI picks from the database.
 * 5. Render a grid or list of picks in a card layout (PickCard) if membership=pro.
 *
 * Key Files/Dependencies:
 * - @clerk/nextjs/server for auth
 * - @/actions/db/profiles-actions for retrieving user profile
 * - @/actions/db/nba-picks-actions for retrieving NBA picks
 * - @/app/picks/_components/pick-card for rendering each pick
 *
 * Notes/Edge Cases:
 * - We redirect if not logged in or no profile record.
 * - If membership=free, user can see a CTA to subscribe. We do not fetch picks.
 * - This is step 9 of the implementation plan ("Create 'AI Picks' page").
 */

"use server"

import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getNbaPicksAction } from "@/actions/db/nba-picks-actions"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PickCard from "@/app/picks/_components/pick-card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * page.tsx
 * @description
 * Server component that handles membership gating for AI picks.
 *
 * Usage:
 * Accessed at /picks
 *
 * Implementation:
 * 1. Check if user is signed in. If not, redirect("/login").
 * 2. Check membership from the user’s profile. If free => show paywall. If pro => fetch and display picks.
 */
export default async function AiPicksPage() {
  const { userId } = await auth()

  // If no user is logged in, redirect to /login
  if (!userId) {
    return redirect("/login")
  }

  // Attempt to get the profile for the current user
  const profileResult = await getProfileByUserIdAction(userId)
  if (!profileResult.isSuccess || !profileResult.data) {
    // If no profile found, maybe user hasn't completed signup
    return redirect("/signup")
  }

  const profile = profileResult.data

  // If membership=free, show paywall
  if (profile.membership === "free") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">AI Picks (Pro Access Required)</h1>

        <p className="max-w-md">
          Upgrade your membership to Pro to unlock full access to our
          AI-generated NBA picks. Our model analyzes recent performance,
          injuries, and odds to provide the most informed picks.
        </p>

        <a
          href="/pricing"
          className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Subscribe Now
        </a>
      </div>
    )
  }

  // If membership=pro, fetch picks from the database
  const picksResult = await getNbaPicksAction()
  // If something fails, show fallback UI or message
  if (!picksResult.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold">Failed to load AI picks</h2>
        <p>{picksResult.message}</p>
      </div>
    )
  }

  // At this point, picksResult.data is an array of picks
  const picks = picksResult.data

  // We wrap in <Suspense> if we wanted some additional lazy logic, but here it's straightforward.
  // We'll still demonstrate the usage:
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="mb-4 h-8 w-1/3" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <div className="p-8">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Today's NBA AI Picks
        </h1>

        {picks.length === 0 ? (
          <div className="text-center">
            <p>No picks found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {picks.map(pick => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        )}
      </div>
    </Suspense>
  )
}
