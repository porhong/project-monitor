"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteModule } from "@/app/actions"

interface DeleteModuleButtonProps {
  projectId: string
  moduleId: string
  moduleName: string
}

export function DeleteModuleButton({ projectId, moduleId, moduleName }: DeleteModuleButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDeleteModule() {
    if (!window.confirm(`Delete module "${moduleName}"? This will remove it from all versions.`)) return
    startTransition(async () => {
      await deleteModule(projectId, moduleId)
      toast.success(`Module "${moduleName}" deleted`)
      router.refresh()
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={handleDeleteModule}
      title="Delete module"
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
