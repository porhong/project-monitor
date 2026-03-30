"use client"

import { useState, useTransition } from "react"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUser } from "@/app/admin/users/actions"
import type { UserRole } from "@/lib/auth"

interface CreateUserDialogProps {
  currentUserRole: UserRole
}

export function CreateUserDialog({ currentUserRole }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<UserRole>("visitor")
  const roleId = "create-user-role"

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const email = data.get("email") as string
    const name = data.get("name") as string
    const password = data.get("password") as string

    startTransition(async () => {
      const result = await createUser({ email, name, password, role })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`User "${name}" created`)
        setOpen(false)
        form.reset()
        setRole("visitor")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 font-mono text-xs tracking-wide">
          <UserPlus className="size-3.5" />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="font-mono text-xs">
              Full Name
            </Label>
            <Input id="name" name="name" required placeholder="Jane Doe" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="font-mono text-xs">
              Email
            </Label>
            <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="font-mono text-xs">
              Password
            </Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
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
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
