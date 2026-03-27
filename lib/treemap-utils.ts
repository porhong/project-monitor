import type { EChartsOption } from "echarts"
import type { Project, TreemapNodeData } from "@/lib/types"

const STATUS_COLORS: Record<string, string> = {
  "not-started": "#ef4444", // red-500
  "in-progress": "#3b82f6", // blue-500
  "pending": "#f97316", // orange-500
  "blocked": "#86efac", // light green (lime-400) for "needs improvement"
  "completed": "#22c55e", // green-500
}

const PARENT_COLOR = "#9ca3af" // gray-400 for project nodes

export function buildTreemapOption(
  projects: Project[],
  selectedVersionId?: string,
): EChartsOption {
  const data: TreemapNodeData[] = projects.map((project) => {
    // Find the version to use: either the selected one or the latest
    let version = project.versions[project.versions.length - 1]
    if (selectedVersionId) {
      const selected = project.versions.find((v) => v.id === selectedVersionId)
      if (selected) version = selected
    }

    const entryByModuleId = new Map(version.entries.map((e) => [e.moduleId, e] as const))

    const modulesForView = selectedVersionId
      ? project.modules.filter((m) => entryByModuleId.has(m.id))
      : project.modules

    const children: TreemapNodeData[] = modulesForView.map((mod) => {
      // Find entry for this module in the selected/latest version
      const entry = entryByModuleId.get(mod.id)
      const status = entry?.status ?? "not-started"
      const moduleSize = entry?.moduleSize ?? 1

      return {
        name: mod.name,
        value: Math.max(1, moduleSize),
        moduleSize,
        status,
        itemStyle: {
          color: STATUS_COLORS[status] ?? STATUS_COLORS["not-started"],
        },
      }
    })

    // If no modules, give project a minimal placeholder value
    if (children.length === 0) {
      return {
        name: project.name,
        value: 1,
        status: "not-started",
        itemStyle: { color: PARENT_COLOR },
      }
    }

    return {
      name: project.name,
      value: children.reduce((sum, c) => sum + c.value, 0),
      children,
      itemStyle: { color: PARENT_COLOR },
    }
  })

  return {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as {
          name: string
          value: number
          treePathInfo?: { name: string }[]
          data?: { status?: string; moduleSize?: number }
        }
        const isModule = p.treePathInfo && p.treePathInfo.length > 1
        if (isModule) {
          const status = p.data?.status ?? "not-started"
          const moduleSize = p.data?.moduleSize ?? p.value
          return `${p.name}: ${moduleSize} feature${moduleSize !== 1 ? "s" : ""} — ${statusLabel(status)}`
        }
        return p.name
      },
    },
    series: [
      {
        type: "treemap",
        data,
        visibleMin: 1,
        label: {
          show: true,
          formatter: "{b}",
          color: "#fff",
          fontWeight: "bold",
        },
        upperLabel: {
          show: true,
          height: 30,
          formatter: "{b}",
          color: "#333",
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
          gapWidth: 2,
          // Use status-based coloring
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 3,
              borderColor: "#555",
              gapWidth: 3,
            },
            upperLabel: { show: true },
          },
          {
            itemStyle: {
              borderWidth: 1,
              gapWidth: 1,
            },
          },
        ],
        breadcrumb: { show: false },
      },
    ],
  }
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
