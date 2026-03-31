"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Status } from "@/lib/types"

const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  pending: "Pending",
  blocked: "Needs Improvement",
  completed: "Completed",
}

const STATUS_DOT_COLOR: Record<Status, string> = {
  completed: "#3d7a58",
  "in-progress": "#5b82b5",
  pending: "#d4824a",
  blocked: "#7aab8a",
  "not-started": "#b85c58",
}

const PAGE_SIZE = 10

const STATUS_ORDER: Status[] = ["completed", "in-progress", "pending", "blocked", "not-started"]

interface ModuleRow {
  id: string
  name: string
  description: string
  status: Status
  features: number
}

interface ModuleTableProps {
  rows: ModuleRow[]
  pageSize?: number
}

export function ModuleTable({ rows, pageSize = PAGE_SIZE }: ModuleTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Status>>(new Set())

  useEffect(() => {
    setTimeout(() => {
      setCurrentPage(1)
    }, 300)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedStatuses(new Set())
  }, [rows])

  const availableStatuses = Array.from(new Set(rows.map((r) => r.status))).sort(
    (a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b),
  )

  const trimmedQuery = query.trim().toLowerCase()
  const hasFilters = trimmedQuery.length > 0 || selectedStatuses.size > 0

  const filteredRows = rows.filter((r) => {
    const matchesQuery =
      !trimmedQuery ||
      r.name.toLowerCase().includes(trimmedQuery) ||
      r.description.toLowerCase().includes(trimmedQuery)
    const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(r.status)
    return matchesQuery && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pageRows = filteredRows.slice(start, end)

  const rangeStart = filteredRows.length === 0 ? 0 : start + 1
  const rangeEnd = Math.min(end, filteredRows.length)

  function handleQueryChange(value: string) {
    setQuery(value)
    setCurrentPage(1)
  }

  function toggleStatus(status: Status) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
    setCurrentPage(1)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Modules</h3>
        {filteredRows.length > 0 && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {rangeStart}–{rangeEnd} of {filteredRows.length}
            {hasFilters && rows.length !== filteredRows.length && (
              <span className="ml-1">(of {rows.length})</span>
            )}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by name or description…"
            className="h-8 pl-8 pr-8 text-sm"
          />
          {query && (
            <button
              onClick={() => handleQueryChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {availableStatuses.length > 1 && (
          <div className="my-1 flex flex-wrap gap-1.5">
            {availableStatuses.map((status) => {
              const color = STATUS_DOT_COLOR[status]
              const isActive = selectedStatuses.has(status)
              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={
                    isActive
                      ? { backgroundColor: `${color}26`, color, borderColor: `${color}4d` }
                      : { backgroundColor: "transparent", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                  }
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: isActive ? color : "var(--muted-foreground)" }}
                  />
                  {STATUS_LABEL[status]}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[25%]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[160px]">Status</TableHead>
              <TableHead className="w-[90px] text-right">Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="pointer-events-none hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-muted-foreground"
                  style={{ height: `${pageSize * 40}px` }}
                >
                  {hasFilters ? "No modules match the current filters." : "No modules in this version."}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {pageRows.map((row) => {
                  const color = STATUS_DOT_COLOR[row.status]
                  return (
                    <TableRow key={row.id} className="h-10">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="whitespace-normal">
                        {row.description ? (
                          <span className="line-clamp-2 text-sm text-muted-foreground">
                            {row.description}
                          </span>
                        ) : (
                          <span className="text-sm italic text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${color}26`,
                            color,
                            borderColor: `${color}4d`,
                          }}
                        >
                          {STATUS_LABEL[row.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {row.features}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {row.features === 1 ? "feat" : "feats"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {Array.from({ length: pageSize - pageRows.length }).map((_, i) => (
                  <TableRow key={`pad-${i}`} className="h-10 pointer-events-none hover:bg-transparent">
                    <TableCell colSpan={4} />
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
