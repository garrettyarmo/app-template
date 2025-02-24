/**
 * @description
 * This client component displays a single AI-generated NBA pick in a "card" format.
 *
 * Responsibilities:
 * - Renders the pick’s gameId, spreadPick, explanation, and timestamps if desired.
 * - Provides a simple visual layout for each pick.
 *
 * Interfaces/Types:
 * - PickCardProps: Expects a 'pick' prop of type `SelectNbaPick`.
 *
 * Dependencies:
 * - React for client component
 * - Tailwind for styling
 * - `SelectNbaPick` from "@/db/schema/nba-picks-schema" for type-checking
 *
 * Usage:
 *   import PickCard from "./pick-card"
 *   <PickCard pick={somePick} />
 *
 * Notes:
 * - We keep it minimal but can expand with additional info like confidence rating or more data fields.
 */

"use client"

import { SelectNbaPick } from "@/db/schema/nba-picks-schema"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

/**
 * Props for the PickCard component.
 */
interface PickCardProps {
  /**
   * The NBA pick to display in the card.
   */
  pick: SelectNbaPick
}

/**
 * PickCard
 * @param {PickCardProps} props - The props object containing a single pick.
 * @returns JSX.Element
 *
 * @description
 * Renders a card that displays information about an AI-generated NBA pick,
 * including the gameId, the selected side/spread, and the explanation (if provided).
 */
export default function PickCard({ pick }: PickCardProps) {
  const { gameId, spreadPick, explanation, createdAt } = pick

  // We can format the createdAt date nicely for display
  const createdDate = new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="truncate">Game: {gameId}</CardTitle>
        <CardDescription>Created: {createdDate}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <div className="mb-2 font-semibold">Pick: {spreadPick}</div>

        {explanation ? (
          <p className="text-muted-foreground text-sm">
            Explanation: {explanation}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No explanation provided.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
