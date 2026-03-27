"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload, Copy, Check, AlertCircle, FileJson } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { importModules } from "@/app/actions"

const JSON_TEMPLATE = JSON.stringify(
  [
    {
      name: "Authentication",
      description: "User login, registration, and session management",
    },
    {
      name: "Dashboard",
      description: "Main overview and analytics widgets",
    },
    {
      name: "Settings",
      description: "User preferences and account configuration",
    },
    {
      name: "Notifications",
    },
  ],
  null,
  2,
)

interface ParseResult {
  valid: true
  items: Array<{ name: string; description?: string }>
  count: number
}

interface ParseError {
  valid: false
  message: string
}

function parseJson(raw: string): ParseResult | ParseError {
  if (!raw.trim()) return { valid: false, message: "Paste your JSON above to get started." }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { valid: false, message: "Invalid JSON — check for missing commas, brackets, or quotes." }
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, message: "JSON must be an array [ … ] at the root level." }
  }

  const items: Array<{ name: string; description?: string }> = []
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i]
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return { valid: false, message: `Item at index ${i} must be an object with a "name" field.` }
    }
    const obj = item as Record<string, unknown>
    if (typeof obj["name"] !== "string" || !(obj["name"] as string).trim()) {
      return { valid: false, message: `Item at index ${i} is missing a non-empty "name" field.` }
    }
    if (obj["description"] !== undefined && typeof obj["description"] !== "string") {
      return { valid: false, message: `Item at index ${i}: "description" must be a string.` }
    }
    items.push({
      name: obj["name"] as string,
      description: obj["description"] as string | undefined,
    })
  }

  if (items.length === 0) {
    return { valid: false, message: "The array is empty — add at least one module." }
  }

  return { valid: true, items, count: items.length }
}

interface ImportModulesDialogProps {
  projectId: string
  projectName: string
  isAdmin: boolean
}

export function ImportModulesDialog({ projectId, projectName, isAdmin }: ImportModulesDialogProps) {
  if (!isAdmin) return null
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [jsonText, setJsonText] = useState("")
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const result = parseJson(jsonText)

  function handleCopyTemplate() {
    navigator.clipboard.writeText(JSON_TEMPLATE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleOpenChange(next: boolean) {
    if (isPending) return
    setOpen(next)
    if (!next) setJsonText("")
  }

  function handleImport() {
    if (!result.valid) return
    startTransition(async () => {
      const { imported } = await importModules(projectId, result.items)
      toast.success(`Imported ${imported} module${imported !== 1 ? "s" : ""} successfully.`)
      setOpen(false)
      setJsonText("")
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 size-4" />
          Import JSON
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Modules from JSON</DialogTitle>
          <DialogDescription>
            Paste a JSON array of modules to bulk-import them into{" "}
            <span className="font-medium text-foreground">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Template section */}
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileJson className="size-4 text-muted-foreground" />
                JSON Template
              </div>
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
              {JSON_TEMPLATE}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Each item requires a <code className="rounded bg-muted px-1 py-0.5">name</code> (string). The{" "}
              <code className="rounded bg-muted px-1 py-0.5">description</code> field is optional.
            </p>
          </div>

          {/* Paste area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Paste your JSON</label>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  { "name": "Module Name", "description": "Optional" }\n]`}
              rows={12}
              className="field-sizing-fixed max-h-80 min-h-52 shrink-0 resize-y overflow-y-auto font-mono text-sm"
              disabled={isPending}
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
                <>
                  <Check className="size-4 shrink-0" />
                  <span>
                    <span className="font-medium">{result.count}</span> module
                    {result.count !== 1 ? "s" : ""} ready to import.
                  </span>
                  <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                    {result.count}
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{result.message}</span>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!result.valid || isPending}>
            {isPending
              ? "Importing…"
              : result.valid
                ? `Import ${result.count} Module${result.count !== 1 ? "s" : ""}`
                : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
