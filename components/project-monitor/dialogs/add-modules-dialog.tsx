"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Module } from "@/lib/types"

interface AddModulesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableModules: Module[]
  // Maps moduleId -> true for selected modules
  initialSelected: Set<string>
  onConfirm: (selectedModules: Module[]) => void
}

export function AddModulesDialog({
  open,
  onOpenChange,
  availableModules,
  initialSelected,
  onConfirm,
}: AddModulesDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelected))

  function toggleModule(moduleId: string) {
    const newSet = new Set(selectedIds)
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId)
    } else {
      newSet.add(moduleId)
    }
    setSelectedIds(newSet)
  }

  function handleConfirm() {
    const selectedModules = availableModules.filter((mod) => selectedIds.has(mod.id))
    onConfirm(selectedModules)
    setSelectedIds(new Set(initialSelected))
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setSelectedIds(new Set(initialSelected))
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Modules to Version</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Select modules from the project to include in this version.
        </p>
        {availableModules.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            All modules are already added to this version.
          </p>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-2 py-2">
              {availableModules.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    id={`add-module-${mod.id}`}
                    checked={selectedIds.has(mod.id)}
                    onCheckedChange={() => toggleModule(mod.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={`add-module-${mod.id}`}
                      className="cursor-pointer font-medium"
                    >
                      {mod.name}
                    </label>
                    {mod.description && (
                      <p className="text-xs text-muted-foreground">{mod.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            Add {selectedIds.size > 0 && `${selectedIds.size} module${selectedIds.size === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
