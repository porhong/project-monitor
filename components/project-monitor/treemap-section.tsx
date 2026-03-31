"use client"

import { useMemo, useState, useEffect, useCallback, useRef } from "react"
import { buildTreemapOption } from "@/lib/treemap-utils"
import { TreemapChart, TreemapChartSkeleton } from "@/components/project-monitor/treemap-chart"
import { ModuleDetailDialog } from "@/components/project-monitor/dialogs/module-detail-dialog"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, Maximize2, Minimize2, RefreshCcw } from "lucide-react"
import { useExportPdf } from "@/hooks/use-export-pdf"
import type { EChartsType } from "echarts"
import type { ModuleEntry, Project, TreemapNodeData } from "@/lib/types"
import type { PdfReportData } from "@/lib/pdf/types"

/**
 * Look up a module's entry by module name from the projects prop.
 * This is the authoritative source — more reliable than reading from ECharts
 * event params, which may omit custom data properties or use a stale reference.
 */
function findModuleEntry(
  moduleName: string,
  projects: Project[],
  selectedVersionId?: string,
): ModuleEntry | undefined {
  for (const project of projects) {
    const mod = project.modules.find((m) => m.name === moduleName)
    if (!mod) continue
    for (const version of project.versions) {
      if (selectedVersionId && version.id !== selectedVersionId) continue
      const entry = version.entries.find((e) => e.moduleId === mod.id)
      if (entry) return entry
    }
  }
  return undefined
}

interface TreemapSectionProps {
  projects: Project[]
  selectedVersionId?: string
  reportData?: PdfReportData
}

interface SelectedEntry {
  moduleName: string
  entry: ModuleEntry
}

export function TreemapSection({ projects, selectedVersionId, reportData }: TreemapSectionProps) {
  const option = useMemo(
    () => buildTreemapOption(projects, selectedVersionId),
    [projects, selectedVersionId],
  )

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDrilledDown, setIsDrilledDown] = useState(false)
  // Incrementing this key forces TreemapChart to fully remount, which is the
  // only guaranteed way to reset ECharts' internal drill-down state.
  const [chartKey, setChartKey] = useState(0)
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry | null>(null)
  const [isChartReady, setIsChartReady] = useState(false)
  const echartsInstanceRef = useRef<EChartsType | null>(null)

  const { handleExport, isExporting } = useExportPdf(
    () =>
      echartsInstanceRef.current?.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      }) ?? null,
    reportData ?? {
      projectName: "",
      projectDescription: "",
      exportedAt: "",
      versionName: "",
      activeModules: 0,
      totalFeatures: 0,
      statusCounts: {},
      moduleRows: [],
    },
  )

  // Reset drill-down when switching fullscreen (chart remounts anyway)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDrilledDown(false)
    setIsChartReady(false)
  }, [isFullscreen])

  // Reset drill-down when the selected version changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDrilledDown(false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartKey((k) => k + 1)
  }, [selectedVersionId])

  // Reset loading state and clear cached instance whenever the chart key changes (remount)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsChartReady(false)
    echartsInstanceRef.current = null
  }, [chartKey])

  useEffect(() => {
    if (!isFullscreen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isFullscreen])

  const handleTreemapClick = useCallback(
    (params: unknown) => {
      const p = params as { name?: string; data?: TreemapNodeData }
      if (!p.name) return

      // Determine if this is a module (leaf) or a project (parent) node.
      //
      // We intentionally do NOT use `treePathInfo` / `treeAncestors` for this:
      //   - `treePathInfo` is deprecated in ECharts v5
      //   - Both fields report paths relative to the *current visual root*, so
      //     after a drill-down, a module click looks identical to a root-level
      //     click (both have depth === 1), making depth-based detection unreliable.
      //
      // Instead, we look the name up in `projects` — if an entry exists it's a
      // module node; if nothing is found it's a project node (will drill down).
      const entry =
        p.data?.entryData ?? findModuleEntry(p.name, projects, selectedVersionId)

      if (entry) {
        // Module node — open the detail dialog
        setSelectedEntry({ moduleName: p.name, entry })
      } else {
        // Project node — ECharts will drill into it; mark the view as navigated
        setIsDrilledDown(true)
      }
    },
    [projects, selectedVersionId],
  )

  const handleReset = useCallback(() => {
    // Increment the key to force a full TreemapChart remount.
    // This destroys the ECharts instance and creates a fresh one, which is
    // the only reliable way to clear ECharts' internal drill-down root state.
    setChartKey((k) => k + 1)
    setIsDrilledDown(false)
  }, [])

  const onEvents = useMemo(() => ({ click: handleTreemapClick }), [handleTreemapClick])

  if (projects.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Create a project to see the treemap</p>
      </div>
    )
  }

  return (
    <>
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Project Overview</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={handleReset}
              >
                <RefreshCcw className="size-3.5" />
                Reset View
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {reportData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={handleExport}
                  disabled={!isChartReady || isExporting}
                  title="Export overview as PDF"
                >
                  {isExporting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileDown className="size-3.5" />
                  )}
                  Export PDF
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="mr-2 size-4" />
                Exit Fullscreen
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="relative h-full">
              {!isChartReady && (
                <div className="absolute inset-0 z-10">
                  <div className="h-full animate-pulse rounded-lg bg-muted" />
                </div>
              )}
              <TreemapChart
                key={chartKey}
                option={option}
                height="calc(100dvh - 80px)"
                onEvents={onEvents}
                onChartReady={(instance) => {
                  setIsChartReady(true)
                  echartsInstanceRef.current = instance
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[600px]">
          {!isChartReady && (
            <div className="absolute inset-0 z-10">
              <TreemapChartSkeleton />
            </div>
          )}
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
            {reportData && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs opacity-80 hover:opacity-100"
                onClick={handleExport}
                disabled={!isChartReady || isExporting}
                title="Export overview as PDF"
              >
                {isExporting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileDown className="size-3.5" />
                )}
                Export PDF
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs opacity-80 hover:opacity-100"
              onClick={handleReset}
              title="Reset to default view"
            >
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 opacity-60 hover:opacity-100"
              onClick={() => setIsFullscreen(true)}
              title="View fullscreen"
            >
              <Maximize2 className="size-4" />
            </Button>
          </div>
          <TreemapChart
            key={chartKey}
            option={option}
            onEvents={onEvents}
            onChartReady={(instance) => {
              setIsChartReady(true)
              echartsInstanceRef.current = instance
            }}
          />
        </div>
      )}

      {selectedEntry && (
        <ModuleDetailDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedEntry(null)
          }}
          moduleName={selectedEntry.moduleName}
          entry={selectedEntry.entry}
        />
      )}
    </>
  )
}
