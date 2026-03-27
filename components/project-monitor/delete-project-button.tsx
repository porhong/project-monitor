"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteProject } from "@/app/actions"

interface DeleteProjectButtonProps {
  projectId: string
  projectName: string
  isAdmin: boolean
}

export function DeleteProjectButton({ projectId, projectName, isAdmin }: DeleteProjectButtonProps) {
  if (!isAdmin) return null
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDeleteProject() {
    if (!window.confirm(`Delete project "${projectName}"?`)) return
    startTransition(async () => {
      await deleteProject(projectId)
      toast.success(`Project "${projectName}" deleted`)
      router.push("/")
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={handleDeleteProject}
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
