"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteVersion } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditVersionDialog } from "@/components/project-monitor/dialogs/edit-version-dialog"
import { CreateVersionDialog } from "@/components/project-monitor/dialogs/create-version-dialog"
import type { Module, Version } from "@/lib/types"

const STATUS_BADGE_CLASS: Record<string, string> = {
  "not-started": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "pending": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "blocked": "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  "completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    "pending": "Pending",
    "blocked": "Needs Improvement",
    "completed": "Completed",
  }
  return map[status] ?? status
}

interface VersionSummaryProps {
  version: Version
  modules: Module[]
}

function VersionSummary({ version, modules }: VersionSummaryProps) {
  if (version.entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No modules in this version yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {version.entries.map((entry) => {
        const mod = modules.find((m) => m.id === entry.moduleId)
        if (!mod) return null
        return (
          <div key={entry.moduleId} className="flex items-center justify-between gap-2 py-1">
            <span className="truncate text-sm">{mod.name}</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">{entry.moduleSize} feature{entry.moduleSize !== 1 ? "s" : ""}</span>
              <Badge className={STATUS_BADGE_CLASS[entry.status]} variant="outline">
                {statusLabel(entry.status)}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface VersionPanelProps {
  projectId: string
  projectName: string
  versions: Version[]
  modules: Module[]
}

export function VersionPanel({ projectId, projectName, versions, modules }: VersionPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDeleteVersion(versionId: string, versionName: string) {
    if (!window.confirm(`Delete version "${versionName}"?`)) return
    startTransition(async () => {
      await deleteVersion(projectId, versionId)
      toast.success(`Version "${versionName}" deleted`)
      router.refresh()
    })
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">No versions yet.</p>
        <CreateVersionDialog projectId={projectId} projectName={projectName} />
      </div>
    )
  }

  // Sort versions by creation date (newest first)
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <Tabs defaultValue={sortedVersions[0].id}>
      <div className="flex items-center gap-2">
        <TabsList className="h-8">
          {sortedVersions.map((v) => (
            <TabsTrigger key={v.id} value={v.id} className="text-xs">
              {v.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <CreateVersionDialog projectId={projectId} projectName={projectName} />
      </div>
      {sortedVersions.map((v) => (
        <TabsContent key={v.id} value={v.id} className="mt-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(v.createdAt).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {v.entries.length} module{v.entries.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <EditVersionDialog
                  version={v}
                  modules={modules}
                  projectId={projectId}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => handleDeleteVersion(v.id, v.name)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <Separator />
            <VersionSummary version={v} modules={modules} />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
