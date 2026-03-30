import "server-only"
import path from "path"
import fs from "fs"
import BetterSQLite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import * as schema from "./schema"

// During `next build`, 7 workers evaluate this module in parallel and all try
// to write to the same SQLite file. Use an in-memory DB for the build phase —
// workers don't serve real requests so they never need the persisted data.
const isBuilding = process.env.NEXT_PHASE === "phase-production-build"

const DB_PATH = path.join(process.cwd(), "data", "app.db")
const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle")

// Ensure data directory exists (only matters at runtime)
if (!isBuilding) {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Singleton to survive Next.js hot reloads in development
const globalForDb = globalThis as unknown as {
  _sqlite: BetterSQLite3.Database | undefined
}

const sqlite = globalForDb._sqlite ?? new BetterSQLite3(isBuilding ? ":memory:" : DB_PATH)

// Set busy_timeout BEFORE any write pragma so retries kick in immediately.
// WAL mode lets multiple readers coexist with a single writer at runtime.
sqlite.pragma("busy_timeout = 5000")
sqlite.pragma("journal_mode = WAL")

if (process.env.NODE_ENV !== "production") {
  globalForDb._sqlite = sqlite
}

export const db = drizzle(sqlite, { schema })

// Always run migrations. During build each worker uses its own :memory: DB so
// there is no file-lock race. At runtime this runs once on server start-up
// (instrumentation.ts) against the real file DB.
migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
