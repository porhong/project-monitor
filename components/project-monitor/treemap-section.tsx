"use client"

import { useMemo, useState, useEffect } from "react"
import { buildTreemapOption } from "@/lib/treemap-utils"
import { TreemapChart } from "@/components/project-monitor/treemap-chart"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import type { Project } from "@/lib/types"

interface TreemapSectionProps {
  projects: Project[]
  selectedVersionId?: string
}

export function TreemapSection({ projects, selectedVersionId }: TreemapSectionProps) {
  const option = useMemo(
    () => buildTreemapOption(projects, selectedVersionId),
    [projects, selectedVersionId],
  )
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isFullscreen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isFullscreen])

  if (projects.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Create a project to see the treemap</p>
      </div>
    )
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
          <span className="text-sm font-semibold">Project Overview</span>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
            <Minimize2 className="mr-2 size-4" />
            Exit Fullscreen
          </Button>
        </div>
        <div className="flex-1 p-4">
          <TreemapChart option={option} height="calc(100dvh - 80px)" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-2 z-10 size-8 opacity-60 hover:opacity-100"
        onClick={() => setIsFullscreen(true)}
        title="View fullscreen"
      >
        <Maximize2 className="size-4" />
      </Button>
      <TreemapChart option={option} />
    </div>
  )
}
