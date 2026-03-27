import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-seed-secret")
  if (!secret || secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await request.json()
  if (typeof body !== "object" || body === null || typeof (body as Record<string, unknown>)["email"] !== "string") {
    return NextResponse.json({ error: "Missing email in body" }, { status: 400 })
  }
  const email = (body as Record<string, string>)["email"]

  const { users } = await auth.api.listUsers({ query: { limit: 1000 } })
  const user = users.find((u) => u.email === email)
  if (!user) {
    return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 })
  }

  await auth.api.setRole({ body: { userId: user.id, role: "admin" }, headers: request.headers })

  return NextResponse.json({ success: true, message: `User ${email} promoted to admin` })
}
