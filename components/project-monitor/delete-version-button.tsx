"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteVersion } from "@/app/actions"

interface DeleteVersionButtonProps {
  projectId: string
  versionId: string
  versionName: string
  isAdmin: boolean
}

export function DeleteVersionButton({ projectId, versionId, versionName, isAdmin }: DeleteVersionButtonProps) {
  if (!isAdmin) return null
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDeleteVersion() {
    if (!window.confirm(`Delete version "${versionName}"?`)) return
    startTransition(async () => {
      await deleteVersion(projectId, versionId)
      toast.success(`Version "${versionName}" deleted`)
      router.refresh()
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={handleDeleteVersion}
      title="Delete version"
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
