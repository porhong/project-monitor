"use client"

import { memo, useState, useCallback, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ModuleEntry, Status } from "@/lib/types"

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "blocked", label: "Needs Improvement" },
  { value: "completed", label: "Completed" },
] satisfies { value: Status; label: string }[]

const DETAIL_FIELDS = [
  { key: "overview", label: "Overview", placeholder: "Describe the overall goal and purpose…" },
  { key: "scope", label: "Scope", placeholder: "What is included and excluded…" },
  { key: "resources", label: "Resources", placeholder: "Team members, tools, budget…" },
  { key: "constraints", label: "Constraints", placeholder: "Technical, time, or regulatory constraints…" },
  { key: "schedule", label: "Schedule", placeholder: "Timeline, milestones, deadlines…" },
] satisfies { key: keyof Pick<ModuleEntry, "overview" | "scope" | "resources" | "constraints" | "schedule">; label: string; placeholder: string }[]

interface ModuleEntryRowProps {
  moduleName: string
  entry: ModuleEntry
  onChange: (updated: ModuleEntry) => void
}

export const ModuleEntryRow = memo(function ModuleEntryRow({ moduleName, entry, onChange }: ModuleEntryRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [localEntry, setLocalEntry] = useState(entry)

  // Keep a stable ref to onChange so callbacks never go stale
  const onChangeRef = useRef(onChange)
  // eslint-disable-next-line react-hooks/refs
  onChangeRef.current = onChange

  // Debounce timer for text fields
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track the last value we propagated so we can ignore echoed prop updates
  const lastPropagatedRef = useRef(entry)

  useEffect(() => {
    if (entry !== lastPropagatedRef.current) {
      setLocalEntry(entry)
      lastPropagatedRef.current = entry
    }
  }, [entry])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // For selections / numbers: propagate immediately
  const updateImmediate = useCallback((partial: Partial<ModuleEntry>) => {
    setLocalEntry((prev) => {
      const updated = { ...prev, ...partial }
      if (timerRef.current) clearTimeout(timerRef.current)
      lastPropagatedRef.current = updated
      onChangeRef.current(updated)
      return updated
    })
  }, [])

  // For text inputs: update local state instantly, flush to parent after idle
  const updateDeferred = useCallback((partial: Partial<ModuleEntry>) => {
    setLocalEntry((prev) => {
      const updated = { ...prev, ...partial }
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        lastPropagatedRef.current = updated
        onChangeRef.current(updated)
      }, 300)
      return updated
    })
  }, [])

  const hasAnyDetail = DETAIL_FIELDS.some((f) => (localEntry[f.key] ?? "").trim().length > 0)

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <p className="text-sm font-medium">{moduleName}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Module Size (features)</Label>
          <Input
            type="number"
            min={1}
            value={localEntry.moduleSize}
            onChange={(e) =>
              updateImmediate({ moduleSize: Math.max(1, Math.floor(Number(e.target.value))) })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={localEntry.status}
            onValueChange={(v) => updateImmediate({ status: v as Status })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            value={localEntry.description}
            onChange={(e) => updateDeferred({ description: e.target.value })}
            rows={1}
            className="min-h-0 resize-none text-sm"
            placeholder="Notes..."
          />
        </div>
      </div>

      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform duration-200", detailsOpen && "rotate-180")}
            />
            {detailsOpen ? "Hide Extended Details" : "Show Extended Details"}
            {hasAnyDetail && !detailsOpen && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                filled
              </span>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 flex flex-col gap-3 border-t pt-3">
            {DETAIL_FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <Textarea
                  value={localEntry[field.key] ?? ""}
                  onChange={(e) => updateDeferred({ [field.key]: e.target.value })}
                  rows={2}
                  className="resize-none text-sm"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
})
