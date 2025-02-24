/**
 * @file ai-picks-actions.ts
 * @description
 * Provides a server action to generate daily NBA picks via an LLM (e.g. OpenAI).
 *
 * The main function here is `generateNbaPicksAction`, which does the following:
 * 1. Fetches upcoming NBA game data and odds from an external API (placeholder).
 * 2. Composes a prompt to an LLM (OpenAI, etc.) to produce recommended spreads & explanations.
 * 3. Inserts the AI-generated picks into `nbaPicksTable`.
 *
 * @dependencies
 * - Drizzle ORM for interacting with `nbaPicksTable`.
 * - Potential usage of fetch or an external HTTP client for the sports data API calls.
 * - OpenAI or any other LLM library for generating picks (not installed in this template).
 *
 * @notes
 * - Production usage might include more robust error handling, logging, retries.
 * - Actual scheduling can be done via cron or Next.js scheduled routes.
 * - We store picks in the `nbaPicksTable`. Each pick includes:
 *   - gameId: The external ID for the NBA game
 *   - spreadPick: The chosen side/spread
 *   - explanation: LLM textual rationale
 *   - createdAt, updatedAt: Timestamps
 * - This file is a skeleton. Adjust to integrate with real APIs and your own environment variables.
 */

"use server"

import { db } from "@/db/db"
import { nbaPicksTable, InsertNbaPick, SelectNbaPick } from "@/db/schema/nba-picks-schema"
import { ActionState } from "@/types"

/**
 * Helper type for partial game/odds data from an external API.
 * In a production app, you would adjust these fields to match the real JSON schema from your sports data API.
 */
interface ExternalGameData {
  gameId: string
  homeTeam: string
  awayTeam: string
  odds: {
    homeSpread: number
    awaySpread: number
  }
  // Additional fields as needed.
}

/**
 * Generates AI-based NBA picks and stores them in the database.
 *
 * @async
 * @function generateNbaPicksAction
 * @param {string} phase - A string indicating "early" or "final" run.
 *   This can be used to vary the model's logic or the timestamp in the DB records.
 * @returns {Promise<ActionState<SelectNbaPick[]>>}
 *   An ActionState object containing either the newly created picks or an error.
 *
 * @description
 * 1. Fetch upcoming NBA games from an external sports data API (mocked logic).
 * 2. For each game, call an LLM (mocked logic) to get a recommended spread pick & explanation.
 * 3. Insert those picks into `nbaPicksTable`.
 * 4. Return the inserted picks so we can display them in the UI or logs.
 *
 * @example
 * ```ts
 * const result = await generateNbaPicksAction("early")
 * if (result.isSuccess) {
 *   console.log("Generated picks: ", result.data)
 * }
 * ```
 *
 * @notes
 * - The `phase` parameter can help us store different sets of picks. For instance:
 *   - "early" might be a preliminary pass in the morning,
 *   - "final" might be a pass closer to game time.
 * - For real usage, install & configure the external library for LLM calls (e.g., openai).
 * - For real usage, fetch data from your sports data provider, using environment variables:
 *   e.g., fetch("https://some-sports-api.com/v1/odds", { headers: { 'X-API-Key': process.env.ODDS_API_KEY }})
 */
export async function generateNbaPicksAction(
  phase: "early" | "final" = "early"
): Promise<ActionState<SelectNbaPick[]>> {
  try {
    // 1. Fetch upcoming NBA games from an external sports data API
    // For the sake of this skeleton, we simulate with a local placeholder
    const exampleGames: ExternalGameData[] = await mockFetchUpcomingNbaGames()

    // 2. For each game, call an LLM to get recommended spread & explanation
    // We'll just mock it for now. A real integration might do:
    // const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    // const openai = new OpenAIApi(configuration);
    // const completion = await openai.createChatCompletion(...);

    const picksToInsert: InsertNbaPick[] = []
    for (const game of exampleGames) {
      // In reality, you'd pass game + odds to the LLM
      const { recommendedSpread, aiExplanation } = await mockGeneratePickWithLLM(
        game,
        phase
      )

      // Create a record to insert into nbaPicksTable
      picksToInsert.push({
        gameId: game.gameId,
        spreadPick: recommendedSpread,
        explanation: aiExplanation
        // createdAt, updatedAt automatically set by DB defaults
      })
    }

    // 3. Insert all picks in one transaction
    const inserted = await db.insert(nbaPicksTable).values(picksToInsert).returning()

    return {
      isSuccess: true,
      message: "AI picks generated and stored successfully",
      data: inserted
    }
  } catch (error) {
    console.error("Error generating NBA picks:", error)
    return {
      isSuccess: false,
      message: "Failed to generate NBA picks"
    }
  }
}

/**
 * Mock fetch to represent pulling upcoming NBA game data from an external API.
 * In production, replace with actual fetch(...) calls to your sports data provider.
 *
 * @private
 * @function mockFetchUpcomingNbaGames
 * @returns {Promise<ExternalGameData[]>}
 *   A promise that resolves with an array of game data from an external source.
 */
async function mockFetchUpcomingNbaGames(): Promise<ExternalGameData[]> {
  // In real usage, you'd do:
  // const response = await fetch("https://the-odds-api.com/v4/.../odds", { headers: { 'X-API-Key': process.env.ODDS_API_KEY }})
  // const data = await response.json();

  // For now, return mock data
  return [
    {
      gameId: "game-1001",
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      odds: {
        homeSpread: -2.5,
        awaySpread: 2.5
      }
    },
    {
      gameId: "game-1002",
      homeTeam: "Celtics",
      awayTeam: "Nets",
      odds: {
        homeSpread: -5.5,
        awaySpread: 5.5
      }
    }
  ]
}

/**
 * Mock function to represent generating picks from an LLM.
 * In production, replace this with actual calls to OpenAI or your chosen model.
 *
 * @private
 * @function mockGeneratePickWithLLM
 * @param {ExternalGameData} game - The game/odds data.
 * @param {string} phase - "early" or "final" to vary logic or system prompts.
 * @returns {Promise<{ recommendedSpread: string; aiExplanation: string }>}
 *   A promise that resolves with a recommended spread pick and a text explanation.
 */
async function mockGeneratePickWithLLM(
  game: ExternalGameData,
  phase: string
): Promise<{ recommendedSpread: string; aiExplanation: string }> {
  // In real usage, you'd do something like:
  // const completion = await openai.createChatCompletion({
  //   model: "gpt-4",
  //   messages: [
  //     { role: "system", content: "You are a sports betting AI..." },
  //     { role: "user", content: `Game: ${game.homeTeam} vs. ${game.awayTeam}, odds: ${game.odds.homeSpread} / ${game.odds.awaySpread}, phase: ${phase}` }
  //   ]
  // });
  // const output = completion.data.choices[0].message?.content.trim() || "No pick"
  // Then parse out the recommended spread & explanation
  // For this skeleton, we just mock it:

  return {
    recommendedSpread: `${game.homeTeam} ${game.odds.homeSpread}`, // naive approach
    aiExplanation: `AI picks the ${game.homeTeam} to cover ${game.odds.homeSpread} because it's the ${phase} run.`
  }
}
