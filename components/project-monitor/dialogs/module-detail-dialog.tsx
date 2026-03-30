"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ModuleEntry, Status } from "@/lib/types"

const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  pending: "Pending",
  blocked: "Needs Improvement",
  completed: "Completed",
}

// Synced with treemap chart STATUS_COLORS in lib/treemap-utils.ts
const STATUS_COLOR: Record<Status, string> = {
  "not-started": "#b85c58",
  "in-progress": "#5b82b5",
  pending: "#d4824a",
  blocked: "#7aab8a",
  completed: "#3d7a58",
}

const DETAIL_TABS: { value: keyof Pick<ModuleEntry, "overview" | "scope" | "resources" | "constraints" | "schedule">; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "scope", label: "Scope" },
  { value: "resources", label: "Resources" },
  { value: "constraints", label: "Constraints" },
  { value: "schedule", label: "Schedule" },
]

interface ModuleDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName: string
  entry: ModuleEntry
}

function DetailPane({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-sm italic text-muted-foreground">No details provided.</p>
  }
  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
}

export function ModuleDetailDialog({ open, onOpenChange, moduleName, entry }: ModuleDetailDialogProps) {
  const status = entry.status as Status

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-2rem,38rem)] max-w-none">
        <DialogHeader>
          <DialogTitle className="text-base">{moduleName}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${STATUS_COLOR[status]}26`,
                color: STATUS_COLOR[status],
                borderColor: `${STATUS_COLOR[status]}4d`,
              }}
            >
              {STATUS_LABEL[status] ?? status}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {entry.moduleSize} feature{entry.moduleSize !== 1 ? "s" : ""}
            </Badge>
            {entry.description && (
              <p className="w-full text-xs text-muted-foreground">{entry.description}</p>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-1">
          <TabsList className="w-full">
            {DETAIL_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {DETAIL_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4 min-h-[6rem]">
              <DetailPane content={entry[tab.value] ?? ""} />
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
