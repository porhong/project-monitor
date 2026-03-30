"use client"

import { useTransition } from "react"
import { ShieldBan, ShieldCheck, LogOut, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EditUserDialog } from "@/components/auth/dialogs/edit-user-dialog"
import { ResetPasswordDialog } from "@/components/auth/dialogs/reset-password-dialog"
import { banUser, unbanUser, revokeUserSessions, deleteUser } from "@/app/admin/users/actions"
import type { UserRole } from "@/lib/auth"

interface User {
  id: string
  name: string
  email: string
  role: string
  banned: boolean | null
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
  currentUserId: string
  currentUserRole: UserRole
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

function RoleBadge({ role }: { role: string }) {
  if (role === "super-admin") {
    return (
      <Badge className="bg-violet-600 font-mono text-xs text-white hover:bg-violet-600">
        super-admin
      </Badge>
    )
  }
  if (role === "admin") {
    return (
      <Badge variant="default" className="font-mono text-xs">
        admin
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="font-mono text-xs">
      {role}
    </Badge>
  )
}

function UserRow({
  user,
  currentUserId,
  currentUserRole,
}: {
  user: User
  currentUserId: string
  currentUserRole: UserRole
}) {
  const [isPending, startTransition] = useTransition()
  const isSelf = user.id === currentUserId
  const isBanned = user.banned === true

  function handleBanToggle() {
    startTransition(async () => {
      const result = isBanned ? await unbanUser(user.id) : await banUser(user.id)
      if (result.error) toast.error(result.error)
      else toast.success(isBanned ? `"${user.name}" unbanned` : `"${user.name}" banned`)
    })
  }

  function handleRevokeSessions() {
    startTransition(async () => {
      const result = await revokeUserSessions(user.id)
      if (result.error) toast.error(result.error)
      else toast.success(`Sessions revoked for "${user.name}"`)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id)
      if (result.error) toast.error(result.error)
      else toast.success(`"${user.name}" deleted`)
    })
  }

  return (
    <TableRow className={isBanned ? "opacity-50" : undefined}>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="font-mono text-sm text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        {isBanned ? (
          <Badge variant="destructive" className="font-mono text-xs">
            banned
          </Badge>
        ) : (
          <Badge variant="outline" className="font-mono text-xs text-emerald-500">
            active
          </Badge>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-0.5">
          {/* Edit role */}
          <EditUserDialog
            userId={user.id}
            userName={user.name}
            currentRole={(user.role as UserRole) ?? "visitor"}
            currentUserRole={currentUserRole}
            isSelf={isSelf}
          />

          {/* Reset password */}
          <ResetPasswordDialog userId={user.id} userName={user.name} />

          {/* Ban / Unban */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                disabled={isPending || isSelf}
                onClick={handleBanToggle}
              >
                {isBanned ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <ShieldBan className="size-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isBanned ? "Unban user" : "Ban user"}</TooltipContent>
          </Tooltip>

          {/* Revoke sessions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                disabled={isPending}
                onClick={handleRevokeSessions}
              >
                <LogOut className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Revoke all sessions</TooltipContent>
          </Tooltip>

          {/* Delete */}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    disabled={isPending || isSelf}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              {isSelf && <TooltipContent>Cannot delete yourself</TooltipContent>}
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  <span className="font-medium text-foreground">{user.name}</span> (
                  {user.email}) and all their sessions. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function UsersTable({ users, currentUserId, currentUserRole }: UsersTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-mono text-xs">Name</TableHead>
            <TableHead className="font-mono text-xs">Email</TableHead>
            <TableHead className="font-mono text-xs">Role</TableHead>
            <TableHead className="font-mono text-xs">Status</TableHead>
            <TableHead className="font-mono text-xs">Created</TableHead>
            <TableHead className="font-mono text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
