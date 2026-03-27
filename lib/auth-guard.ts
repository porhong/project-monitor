import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function requireAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthenticated")
  if (session.user.role !== "admin") throw new Error("Forbidden: admin role required")
}
