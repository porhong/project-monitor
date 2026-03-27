import path from "path"
import BetterSQLite3 from "better-sqlite3"
import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"

const sqlite = new BetterSQLite3(path.join(process.cwd(), "data", "app.db"))

export const auth = betterAuth({
  database: sqlite,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin({ defaultRole: "visitor", adminRoles: ["admin"] })],
})

export type Session = typeof auth.$Infer.Session
export type UserRole = "admin" | "visitor"
