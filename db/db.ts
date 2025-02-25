/**
 * @file db.ts
 * @description
 * Establishes a connection to the PostgreSQL database and configures
 * Drizzle ORM with the defined tables in the `schema` object.
 *
 * Key exports:
 * - db: the Drizzle connection instance
 * - schema: the object containing references to each table
 *
 * @notes
 * - We import environment variables from .env.local.
 * - We rely on drizzle-orm to map the schema for our remaining tables.
 * - The `user_picks` table is now removed, so references to `userPicksTable` have been deleted.
 */

import { config } from "dotenv"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

// Import the table schemas
import {
  profilesTable,
  todosTable,
  nbaPicksTable
  // userPicksTable has been removed
} from "@/db/schema"

config({ path: ".env.local" })

/**
 * The schema object, referencing only existing tables.
 */
const schema = {
  profiles: profilesTable,
  todos: todosTable,
  nbaPicks: nbaPicksTable
  // userPicks: userPicksTable is removed
}

/**
 * Create the Postgres client, referencing the DATABASE_URL from .env.local.
 */
const client = postgres(process.env.DATABASE_URL!)

/**
 * Export the Drizzle ORM instance, referencing our updated schema.
 */
export const db = drizzle(client, { schema })
