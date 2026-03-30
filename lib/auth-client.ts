import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { ac, superAdmin, adminRole, visitor } from "@/lib/permissions"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [
    adminClient({
      ac,
      roles: {
        visitor,
        admin: adminRole,
        "super-admin": superAdmin,
      },
    }),
  ],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
