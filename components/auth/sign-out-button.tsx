"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
      router.push("/sign-in")
      router.refresh()
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isPending}
      className="gap-1.5 font-mono text-xs tracking-wide"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? "Signing out…" : "Sign Out"}
    </Button>
  )
}
