import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { CreateUserDialog } from "@/components/auth/dialogs/create-user-dialog"
import { UsersTable } from "@/components/auth/users-table"

export const metadata = { title: "User Management — Project Monitor" }

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/sign-in")
  if (session.user.role !== "super-admin") redirect("/")

  const { users } = await auth.api.listUsers({
    query: { limit: 1000 },
    headers: await headers(),
  })

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Users className="size-5" />
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {users.length} {users.length === 1 ? "user" : "users"} registered
            </p>
          </div>
        </div>
        <CreateUserDialog currentUserRole="super-admin" />
      </div>

      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ?? "visitor",
          banned: u.banned ?? false,
          createdAt: u.createdAt,
        }))}
        currentUserId={session.user.id}
        currentUserRole="super-admin"
      />
    </div>
  )
}
