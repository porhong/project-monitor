"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createModule } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateModuleDialogProps {
  projectId: string
  projectName: string
}

export function CreateModuleDialog({ projectId, projectName }: CreateModuleDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    startTransition(async () => {
      await createModule(projectId, trimmed, description.trim() || undefined)
      toast.success(`Module "${trimmed}" added`)
      setName("")
      setDescription("")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add Module
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Module to {projectName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="module-name">Name</Label>
            <Input
              id="module-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Authentication"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="module-desc">Description (optional)</Label>
            <Textarea
              id="module-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this module do?"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
