/*
<ai_context>
Exports the database schema for the app.
</ai_context>
*/

/**
 * @file index.ts
 * @description
 * Aggregates and exports all Drizzle ORM table schemas from this directory.
 *
 * @notes
 * - Make sure every schema file is exported here
 *   so that the entire schema can be used in db/db.ts
 */

export * from "./profiles-schema"
export * from "./todos-schema"
export * from "./nba-picks-schema" // <-- New export for NBA picks table
