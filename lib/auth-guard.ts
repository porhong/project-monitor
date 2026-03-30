import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function requireSuperAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthenticated")
  if (session.user.role !== "super-admin") throw new Error("Forbidden: super-admin role required")
}

export async function requireAdminOrSuperAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthenticated")
  const role = session.user.role
  if (role !== "admin" && role !== "super-admin")
    throw new Error("Forbidden: admin or super-admin role required")
}
