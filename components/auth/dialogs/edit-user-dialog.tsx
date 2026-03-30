"use client"

import { useState, useTransition } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { setUserRole } from "@/app/admin/users/actions"
import type { UserRole } from "@/lib/auth"

interface EditUserDialogProps {
  userId: string
  userName: string
  currentRole: UserRole
  currentUserRole: UserRole
  isSelf: boolean
}

export function EditUserDialog({
  userId,
  userName,
  currentRole,
  currentUserRole,
  isSelf,
}: EditUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<UserRole>(currentRole)
  const [isPending, startTransition] = useTransition()
  const roleId = `edit-user-role-${userId}`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const result = await setUserRole(userId, role)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`"${userName}" is now ${role}`)
        setOpen(false)
      }
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              disabled={isSelf}
            >
              <Pencil className="size-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono">Edit Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Changing role for <span className="font-medium text-foreground">{userName}</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={roleId} className="font-mono text-xs">
                  Role
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id={roleId}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {currentUserRole === "super-admin" && (
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending || role === currentRole}>
                  {isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </TooltipTrigger>
      {isSelf && <TooltipContent>Cannot edit your own role</TooltipContent>}
    </Tooltip>
  )
}
