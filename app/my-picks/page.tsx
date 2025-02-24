/**
 * @file page.tsx
 * @description
 * This server page handles displaying and creating user picks for NBA games (and potentially other sports).
 *
 * Workflow:
 * 1) Check if user is authenticated via Clerk (otherwise redirect to /login).
 * 2) Ensure user has a profile (redirect to /signup if none).
 * 3) Fetch existing user picks from the database.
 * 4) Render a client component (picks-form.tsx) which allows adding new picks and displays them.
 *
 * @dependencies
 * - auth from "@clerk/nextjs/server" to get current user ID
 * - getProfileByUserIdAction from "@/actions/db/profiles-actions" to ensure user profile
 * - getUserPicksAction from "@/actions/db/user-picks-actions" to retrieve the user's picks
 * - redirect from "next/navigation" for any authentication or sign-up redirects
 * - PicksForm from "./_components/picks-form" for UI to display & create picks
 *
 * @notes
 * - If the user isn't logged in, we redirect to /login.
 * - If no profile is found, we redirect to /signup.
 * - The membership gating is not enforced here; free or pro user can create picks.
 * - We explicitly define the type for `existingPicks` to avoid TypeScript's implicit any[] error.
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getUserPicksAction } from "@/actions/db/user-picks-actions"
import { redirect } from "next/navigation"
import PicksForm from "@/app/my-picks/_components/picks-form"
import type { SelectUserPick } from "@/db/schema/user-picks-schema"

export default async function MyPicksPage() {
  // 1) Retrieve the current user from Clerk
  const { userId } = await auth()
  if (!userId) {
    // If not logged in, redirect to /login
    return redirect("/login")
  }

  // 2) Ensure the user has a profile
  const profileResult = await getProfileByUserIdAction(userId)
  if (!profileResult.isSuccess || !profileResult.data) {
    // If no profile found, redirect to /signup
    return redirect("/signup")
  }

  // 3) Fetch user picks
  let existingPicks: SelectUserPick[] = []

  const picksResult = await getUserPicksAction(userId)
  if (picksResult.isSuccess && picksResult.data) {
    existingPicks = picksResult.data
  }

  // 4) Render the client component that handles display and creation
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">My Picks</h1>
      <PicksForm userId={userId} initialPicks={existingPicks} />
    </div>
  )
}
