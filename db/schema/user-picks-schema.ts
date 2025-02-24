/**
 * @file user-picks-schema.ts
 * @description
 * This file defines the Drizzle schema for the userPicksTable. It stores the picks
 * that users make for NBA games (and potentially other sports in the future).
 *
 * Key fields:
 * - id: Primary key (UUID)
 * - userId: The user's ID, referencing profilesTable.userId
 * - gameId: Identifier for the NBA game or event
 * - pick: The chosen team or side, e.g. "Lakers -3.5"
 * - result: Enum or text indicating outcome, e.g. "win", "loss", "push", or null if not decided
 * - createdAt, updatedAt: Timestamps for creation and last update
 *
 * @notes
 * - userId is a text field referencing profilesTable.userId. Currently not using onDelete cascade,
 *   so we keep picks historically if a user is removed.
 * - result allows null if the game isn't concluded yet.
 * - We rely on Drizzle to generate types for InsertUserPick and SelectUserPick.
 */

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { profilesTable } from "@/db/schema/profiles-schema"

/**
 * If we want an enum for result:
 *   "win", "loss", "push"
 * But let's keep it as text for simplicity, or we can do:
 * const pickResultEnum = pgEnum("pick_result", ["win","loss","push"])
 * Then define the column as pickResultEnum...
 *
 * For now, let's use text and allow null.
 */

// OPTIONAL: Example of an enum if you prefer a typed approach for result
// export const pickResultEnum = pgEnum("pick_result", ["win","loss","push"])

export const userPicksTable = pgTable("user_picks", {
  /**
   * Primary key, auto-generated UUID.
   */
  id: uuid("id").defaultRandom().primaryKey(),

  /**
   * The user's ID, referencing the profiles table's primary key.
   * We do not specify onDelete: "cascade" so user picks remain historically
   * if a user is deleted. Adjust as you see fit.
   */
  userId: text("user_id")
    .notNull()
    // .references(() => profilesTable.userId, { onDelete: "cascade" }) // If you want
    .references(() => profilesTable.userId), // no cascade

  /**
   * Identifier for the game, e.g. "nba:12345" or just "12345" from an external API
   */
  gameId: text("game_id").notNull(),

  /**
   * The chosen side/spread, e.g. "Lakers -3.5"
   */
  pick: text("pick").notNull(),

  /**
   * The outcome of the pick: "win", "loss", "push", or null if not yet decided.
   * We store as text for flexibility. If you prefer an enum, you can do so.
   */
  result: text("result"), // can be null

  /**
   * Creation timestamp, defaults to now.
   */
  createdAt: timestamp("created_at").defaultNow().notNull(),

  /**
   * Last update timestamp, automatically updated on changes.
   */
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * InsertUserPick represents the shape of data needed to create a new user pick record.
 */
export type InsertUserPick = typeof userPicksTable.$inferInsert

/**
 * SelectUserPick represents the shape of data when reading from userPicksTable.
 */
export type SelectUserPick = typeof userPicksTable.$inferSelect
