import path from "path"
import BetterSQLite3 from "better-sqlite3"
import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
import { ac, superAdmin, adminRole, visitor } from "@/lib/permissions"

// During `next build`, 7 workers evaluate this module in parallel and all try
// to write to the same SQLite file (Better Auth runs CREATE TABLE IF NOT EXISTS
// at init time). Use an in-memory DB for the build phase — workers don't serve
// real requests so they never need the persisted data.
const isBuilding = process.env.NEXT_PHASE === "phase-production-build"
const dbPath = isBuilding ? ":memory:" : path.join(process.cwd(), "data", "app.db")

const sqlite = new BetterSQLite3(dbPath)

// Set busy_timeout BEFORE any write pragma so retries kick in immediately.
// WAL mode lets multiple readers coexist with a single writer at runtime.
sqlite.pragma("busy_timeout = 5000")
sqlite.pragma("journal_mode = WAL")

export const auth = betterAuth({
  database: sqlite,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      ac,
      roles: {
        visitor,
        admin: adminRole,
        "super-admin": superAdmin,
      },
      defaultRole: "visitor",
      adminRoles: ["super-admin"],
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
export type UserRole = "super-admin" | "admin" | "visitor"
