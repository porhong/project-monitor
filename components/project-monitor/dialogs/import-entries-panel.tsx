"use client"

import { useState } from "react"
import { Copy, Check, AlertCircle, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Module, ModuleEntry, Status } from "@/lib/types"

const VALID_STATUSES = new Set<string>([
  "not-started",
  "in-progress",
  "pending",
  "blocked",
  "completed",
])

function buildTemplate(modules: Module[]): string {
  const items = modules.map((mod) => ({
    module: mod.name,
    moduleSize: 1,
    status: "not-started",
    description: "",
    overview: "",
    scope: "",
    resources: "",
    constraints: "",
    schedule: "",
  }))
  return JSON.stringify(items, null, 2)
}

interface ParsedEntry {
  moduleId: string
  entry: ModuleEntry
}

type ParseResult =
  | { valid: true; entries: ParsedEntry[]; count: number; skipped: string[] }
  | { valid: false; message: string }

function parseEntries(raw: string, modules: Module[]): ParseResult {
  if (!raw.trim()) {
    return { valid: false, message: "Paste your JSON above to get started." }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { valid: false, message: "Invalid JSON — check for missing commas, brackets, or quotes." }
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, message: "JSON must be an array [ … ] at the root level." }
  }

  const moduleByName = new Map<string, Module>()
  modules.forEach((m) => moduleByName.set(m.name.toLowerCase(), m))

  const entries: ParsedEntry[] = []
  const skipped: string[] = []

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i]
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return { valid: false, message: `Item at index ${i} must be an object.` }
    }
    const obj = item as Record<string, unknown>

    if (typeof obj["module"] !== "string" || !(obj["module"] as string).trim()) {
      return { valid: false, message: `Item at index ${i} is missing a non-empty "module" field.` }
    }
    const name = (obj["module"] as string).trim()
    const mod = moduleByName.get(name.toLowerCase())

    // Skip modules that don't exist in this project instead of aborting
    if (!mod) {
      skipped.push(name)
      continue
    }

    let moduleSize = 1
    if (obj["moduleSize"] !== undefined) {
      if (
        typeof obj["moduleSize"] !== "number" ||
        !Number.isInteger(obj["moduleSize"]) ||
        (obj["moduleSize"] as number) < 1
      ) {
        return { valid: false, message: `Item at index ${i}: "moduleSize" must be a positive integer.` }
      }
      moduleSize = obj["moduleSize"] as number
    }

    let status: Status = "not-started"
    if (obj["status"] !== undefined) {
      if (typeof obj["status"] !== "string" || !VALID_STATUSES.has(obj["status"] as string)) {
        return {
          valid: false,
          message: `Item at index ${i}: "status" must be one of: not-started, in-progress, pending, blocked, completed.`,
        }
      }
      status = obj["status"] as Status
    }

    let description = ""
    if (obj["description"] !== undefined) {
      if (typeof obj["description"] !== "string") {
        return { valid: false, message: `Item at index ${i}: "description" must be a string.` }
      }
      description = obj["description"] as string
    }

    const overview = typeof obj["overview"] === "string" ? obj["overview"] : ""
    const scope = typeof obj["scope"] === "string" ? obj["scope"] : ""
    const resources = typeof obj["resources"] === "string" ? obj["resources"] : ""
    const constraints = typeof obj["constraints"] === "string" ? obj["constraints"] : ""
    const schedule = typeof obj["schedule"] === "string" ? obj["schedule"] : ""

    entries.push({
      moduleId: mod.id,
      entry: { moduleId: mod.id, moduleSize, status, description, overview, scope, resources, constraints, schedule },
    })
  }

  if (entries.length === 0) {
    if (skipped.length > 0) {
      return {
        valid: false,
        message: `None of the ${skipped.length} module name${skipped.length !== 1 ? "s" : ""} in your JSON exist in this project (e.g. "${skipped[0]}"). Add them via the Modules page first.`,
      }
    }
    return { valid: false, message: "The array is empty — add at least one entry." }
  }

  return { valid: true, entries, count: entries.length, skipped }
}

interface ImportEntriesPanelProps {
  modules: Module[]
  onApply: (entries: Map<string, ModuleEntry>) => void
}

export function ImportEntriesPanel({ modules, onApply }: ImportEntriesPanelProps) {
  const [jsonText, setJsonText] = useState("")
  const [copied, setCopied] = useState(false)

  const template = buildTemplate(modules)
  const result = parseEntries(jsonText, modules)

  function handleCopyTemplate() {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleApply() {
    if (!result.valid) return
    const map = new Map<string, ModuleEntry>()
    result.entries.forEach(({ moduleId, entry }) => map.set(moduleId, entry))
    onApply(map)
    setJsonText("")
  }

  if (modules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No modules in this project yet. Add modules first.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Template */}
      <div className="rounded-lg border bg-muted/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileJson className="size-3.5" />
            JSON Template — {modules.length} module{modules.length !== 1 ? "s" : ""}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={handleCopyTemplate}
          >
            {copied ? (
              <>
                <Check className="size-3 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </Button>
        </div>
        <pre className="max-h-44 overflow-y-auto rounded-md bg-background p-3 text-xs leading-relaxed text-muted-foreground">
          {template}
        </pre>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            <code className="rounded bg-muted px-1 py-0.5">module</code> — required, matched by name
          </span>
          <span>
            <code className="rounded bg-muted px-1 py-0.5">moduleSize</code> — positive integer
            (default <code className="rounded bg-muted px-1 py-0.5">1</code>)
          </span>
          <span>
            Valid <code className="rounded bg-muted px-1 py-0.5">status</code>:{" "}
            {["not-started", "in-progress", "pending", "blocked", "completed"].map((s) => (
              <code key={s} className="mr-1 rounded bg-muted px-1 py-0.5">
                {s}
              </code>
            ))}
          </span>
        </div>
      </div>

      {/* Paste area */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Paste your JSON</label>
        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={`[\n  { "module": "Module Name", "moduleSize": 5, "status": "in-progress", "description": "" }\n]`}
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      {/* Validation feedback */}
      {jsonText.trim() && (
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
            result.valid
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {result.valid ? (
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center gap-2">
                <Check className="size-4 shrink-0" />
                <span>
                  <span className="font-medium">{result.count}</span> module entr
                  {result.count !== 1 ? "ies" : "y"} ready to apply.
                </span>
                <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                  {result.count}
                </Badge>
              </div>
              {result.skipped.length > 0 && (
                <p className="pl-6 text-xs text-amber-600 dark:text-amber-400">
                  {result.skipped.length} skipped — not found in this project:{" "}
                  {result.skipped.slice(0, 3).join(", ")}
                  {result.skipped.length > 3 && ` +${result.skipped.length - 3} more`}. Add them via the Modules page.
                </p>
              )}
            </div>
          ) : (
            <>
              <AlertCircle className="size-4 shrink-0" />
              <span>{result.message}</span>
            </>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={handleApply} disabled={!result.valid}>
          {result.valid
            ? `Apply ${result.count} Entr${result.count !== 1 ? "ies" : "y"} & Review`
            : "Apply"}
        </Button>
      </div>
    </div>
  )
}
