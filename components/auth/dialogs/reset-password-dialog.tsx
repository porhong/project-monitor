"use client"

import { useState, useTransition } from "react"
import { KeyRound } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { changeUserPassword } from "@/app/admin/users/actions"

interface ResetPasswordDialogProps {
  userId: string
  userName: string
}

export function ResetPasswordDialog({ userId, userName }: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const newPassword = data.get("newPassword") as string
    const confirm = data.get("confirm") as string

    if (newPassword !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    startTransition(async () => {
      const result = await changeUserPassword(userId, newPassword)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Password reset for "${userName}"`)
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
            >
              <KeyRound className="size-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono">Reset Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Set a new password for{" "}
                <span className="font-medium text-foreground">{userName}</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword" className="font-mono text-xs">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm" className="font-mono text-xs">
                  Confirm Password
                </Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
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
                  {isPending ? "Saving…" : "Reset"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </TooltipTrigger>
      <TooltipContent>Reset password</TooltipContent>
    </Tooltip>
  )
}
