"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { upsertEntries } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ModuleEntryRow } from "@/components/project-monitor/module-entry-row"
import { ImportEntriesPanel } from "@/components/project-monitor/dialogs/import-entries-panel"
import { Trash2 } from "lucide-react"
import type { Module, ModuleEntry, Version } from "@/lib/types"

interface EditVersionDialogProps {
  version: Version
  modules: Module[]
  projectId: string
}

export function EditVersionDialog({ version, modules, projectId }: EditVersionDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual")
  const [moduleEntriesMap, setModuleEntriesMap] = useState<Map<string, ModuleEntry>>(new Map())

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      const entriesMap = new Map<string, ModuleEntry>()
      version.entries.forEach((entry) => {
        entriesMap.set(entry.moduleId, entry)
      })
      setModuleEntriesMap(entriesMap)
      setActiveTab("manual")
    } else {
      setModuleEntriesMap(new Map())
    }
    setOpen(isOpen)
  }

  function handleCheckboxChange(moduleId: string, checked: boolean) {
    setModuleEntriesMap((prev) => {
      const newMap = new Map(prev)
      if (checked) {
        const entry = newMap.get(moduleId) ?? {
          moduleId,
          moduleSize: 1,
          status: "not-started" as const,
          description: "",
        }
        newMap.set(moduleId, entry)
      } else {
        newMap.delete(moduleId)
      }
      return newMap
    })
  }

  function handleEntryChange(moduleId: string, updated: ModuleEntry) {
    setModuleEntriesMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(moduleId, updated)
      return newMap
    })
  }

  function handleImportApply(imported: Map<string, ModuleEntry>) {
    setModuleEntriesMap((prev) => {
      const newMap = new Map(prev)
      imported.forEach((entry, moduleId) => newMap.set(moduleId, entry))
      return newMap
    })
    setActiveTab("manual")
  }

  function handleSave() {
    const entriesToSave = Array.from(moduleEntriesMap.values())
    startTransition(async () => {
      await upsertEntries(projectId, version.id, entriesToSave)
      toast.success(`Version "${version.name}" updated`)
      setOpen(false)
      router.refresh()
    })
  }

  const includedCount = moduleEntriesMap.size

  const moduleList = modules.map((mod) => ({
    module: mod,
    entry: moduleEntriesMap.get(mod.id),
    isIncluded: moduleEntriesMap.has(mod.id),
  }))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Manage Modules
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[min(90dvh,calc(100dvh-2rem))] min-h-0 w-[min(100%-2rem,56rem)] max-w-none flex-col gap-4 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Manage Modules for &ldquo;{version.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "manual" | "import")}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="manual" className="flex-1">
              Manual
              {includedCount > 0 && (
                <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {includedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1">
              Import JSON
            </TabsTrigger>
          </TabsList>

          {/* Manual tab */}
          <TabsContent
            value="manual"
            className="mt-4 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <p className="pb-5 shrink-0 text-sm text-muted-foreground">
              Check modules to include in this version and set their progress and status.
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-3 py-1">
                {moduleList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No modules in this project yet. Add modules first.
                  </p>
                ) : (
                  moduleList.map(({ module, entry, isIncluded }) => (
                    <div key={module.id} className="flex flex-col gap-3 rounded-md border p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={isIncluded}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(module.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <label
                              htmlFor={`module-${module.id}`}
                              className="cursor-pointer font-semibold"
                            >
                              {module.name}
                            </label>
                            {isIncluded && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0"
                                onClick={() => handleCheckboxChange(module.id, false)}
                                title="Remove from version"
                              >
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                          {module.description && (
                            <p className="text-xs text-muted-foreground">{module.description}</p>
                          )}
                          {isIncluded && entry && (
                            <div className="border-t pt-3">
                              <ModuleEntryRow
                                moduleName={module.name}
                                entry={entry}
                                onChange={(updated) => handleEntryChange(module.id, updated)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Import JSON tab */}
          <TabsContent
            value="import"
            className="mt-4 min-h-0 flex-1 overflow-y-auto data-[state=inactive]:hidden"
          >
            <ImportEntriesPanel modules={modules} onApply={handleImportApply} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : `Save (${includedCount} module${includedCount === 1 ? "" : "s"})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
