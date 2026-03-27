import "server-only"
import path from "path"
import fs from "fs"
import BetterSQLite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import * as schema from "./schema"

const DB_PATH = path.join(process.cwd(), "data", "app.db")
const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle")

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Singleton to survive Next.js hot reloads in development
const globalForDb = globalThis as unknown as {
  _sqlite: BetterSQLite3.Database | undefined
}

const sqlite = globalForDb._sqlite ?? new BetterSQLite3(DB_PATH)

if (process.env.NODE_ENV !== "production") {
  globalForDb._sqlite = sqlite
}

export const db = drizzle(sqlite, { schema })

// Run pending migrations automatically on startup
migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
