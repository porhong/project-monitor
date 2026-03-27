"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateModule } from "@/app/actions"
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
import { Pencil } from "lucide-react"
import type { Module } from "@/lib/types"

interface EditModuleDialogProps {
  projectId: string
  module: Module
}

export function EditModuleDialog({ projectId, module }: EditModuleDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(module.name)
  const [description, setDescription] = useState(module.description ?? "")

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    startTransition(async () => {
      await updateModule(projectId, module.id, trimmed, description.trim() || undefined)
      toast.success(`Module "${trimmed}" updated`)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
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
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
