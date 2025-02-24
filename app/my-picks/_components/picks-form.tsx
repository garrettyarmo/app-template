/**
 * @file picks-form.tsx
 * @description
 * This client component renders a form for creating new user picks and displays existing picks in a list.
 *
 * Responsibilities:
 * 1. Accepts the user's `userId` and an array of existing picks (`initialPicks`).
 * 2. Handles local state for `gameId` and `pick` inputs via React hooks.
 * 3. Calls the `createUserPickAction` server action to create new picks.
 * 4. Renders a list of all picks (with gameId, pick, and result).
 * 5. Shows basic error handling or fallback if the server action fails.
 *
 * @dependencies
 * - React for client-side state and event handling
 * - createUserPickAction (server action) to persist new picks
 * - Input, Button, etc. from Shadcn UI for consistent styling
 * - Drizzle types for user picks if needed (though optional at the client side)
 *
 * @notes
 * - We store the user's picks in local state (`picks`) to immediately update the UI once a new pick is created.
 * - On form submission, we gather `gameId` and `pick`, call the server action, and handle success or error states.
 * - The `result` field is initially `null` (or undefined) upon creation. We let the server default it to null.
 *   The actual result is updated after a game finishes, typically via a scheduled job or a separate action.
 * - We do minimal input validation here (only checking for non-empty fields). Extend as needed.
 * - The plan says membership gating is not strictly required for user picks, so all valid users can create picks.
 */

"use client"

import * as React from "react"
import { createUserPickAction } from "@/actions/db/user-picks-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectUserPick } from "@/db/schema/user-picks-schema"
import { useState } from "react"
import { toast } from "@/lib/hooks/use-toast"

interface PicksFormProps {
  userId: string
  initialPicks: SelectUserPick[]
}

export default function PicksForm({ userId, initialPicks }: PicksFormProps) {
  /**
   * Local component state for the form fields
   */
  const [gameId, setGameId] = useState("")
  const [userPick, setUserPick] = useState("")
  /**
   * Track a loading state while waiting for the server action
   */
  const [isCreating, setIsCreating] = useState(false)
  /**
   * Local copy of all picks, combining initialPicks with newly created picks
   */
  const [picks, setPicks] = useState<SelectUserPick[]>(initialPicks)

  /**
   * Simple form submission to create a new pick
   */
  async function handleCreatePick(e: React.FormEvent) {
    e.preventDefault()
    // Basic validation
    if (!gameId.trim() || !userPick.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter game ID and pick."
      })
      return
    }

    setIsCreating(true)

    try {
      const result = await createUserPickAction({
        userId,
        gameId,
        pick: userPick
        // result is omitted, defaulting to null
      })

      if (result.isSuccess) {
        // Insert the newly created pick at the front
        setPicks(prev => [result.data, ...prev])
        // Clear the form
        setGameId("")
        setUserPick("")
        toast({
          title: "Pick created",
          description: `Created pick for game: ${result.data.gameId}`
        })
      } else {
        // Possibly show error message
        toast({
          title: "Error creating pick",
          description: result.message
        })
      }
    } catch (error: any) {
      console.error("Create pick error:", error)
      toast({
        title: "Error",
        description: "An error occurred creating the pick."
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form to add a new pick */}
      <form onSubmit={handleCreatePick} className="flex flex-col gap-4">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="gameIdInput">
              Game ID
            </label>
            <Input
              id="gameIdInput"
              placeholder="e.g., nba-12345"
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="pickInput">
              Your Pick
            </label>
            <Input
              id="pickInput"
              placeholder='e.g., "Lakers -3.5"'
              value={userPick}
              onChange={e => setUserPick(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          disabled={isCreating}
          className="mt-2 w-fit"
        >
          {isCreating ? "Creating..." : "Create Pick"}
        </Button>
      </form>

      {/* List of existing picks */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-semibold">Existing Picks</h2>

        {picks.length === 0 ? (
          <p className="text-sm italic">No picks yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="px-3 py-2 text-left">Game ID</th>
                  <th className="px-3 py-2 text-left">Pick</th>
                  <th className="px-3 py-2 text-left">Result</th>
                  <th className="px-3 py-2 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {picks.map(pick => (
                  <tr key={pick.id} className="border-b">
                    <td className="px-3 py-2">{pick.gameId}</td>
                    <td className="px-3 py-2">{pick.pick}</td>
                    <td className="px-3 py-2">
                      {pick.result ? pick.result : <em>pending</em>}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(pick.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
