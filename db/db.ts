/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

/**
 * @file db.ts
 * @description
 * This file establishes a connection to the PostgreSQL database and configures
 * Drizzle ORM with all defined tables in the `schema` object.
 *
 * Key exports:
 * - db: the Drizzle connection instance
 * - schema: the object containing references to each table
 *
 * @notes
 * - We import environment variables from .env.local.
 * - `drizzle` is used here with the Postgres client, referencing the tables in `schema`.
 */

import { config } from "dotenv"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

// Import the table schemas
import { profilesTable, todosTable, nbaPicksTable } from "@/db/schema"

config({ path: ".env.local" })

/**
 * The schema object.  Map each table to a key for organization:
 */
const schema = {
  profiles: profilesTable,
  todos: todosTable,
  nbaPicks: nbaPicksTable
}

/**
 * The Postgres client, referencing your DATABASE_URL from .env.local
 */
const client = postgres(process.env.DATABASE_URL!)

/**
 * The Drizzle ORM instance, which we export for direct usage in server actions, etc.
 */
export const db = drizzle(client, { schema })
