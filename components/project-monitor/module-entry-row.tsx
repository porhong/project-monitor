"use client"

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
import type { ModuleEntry, Status } from "@/lib/types"

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "blocked", label: "Needs Improvement" },
  { value: "completed", label: "Completed" },
]

interface ModuleEntryRowProps {
  moduleName: string
  entry: ModuleEntry
  onChange: (updated: ModuleEntry) => void
}

export function ModuleEntryRow({ moduleName, entry, onChange }: ModuleEntryRowProps) {
  function update(partial: Partial<ModuleEntry>) {
    onChange({ ...entry, ...partial })
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <p className="text-sm font-medium">{moduleName}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Module Size (features)</Label>
          <Input
            type="number"
            min={1}
            value={entry.moduleSize}
            onChange={(e) =>
              update({ moduleSize: Math.max(1, Math.floor(Number(e.target.value))) })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={entry.status}
            onValueChange={(v) => update({ status: v as Status })}
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
            value={entry.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={1}
            className="min-h-0 resize-none text-sm"
            placeholder="Notes..."
          />
        </div>
      </div>
    </div>
  )
}
