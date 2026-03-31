"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import type { EChartsOption, EChartsType } from "echarts"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

interface TreemapChartProps {
  option: EChartsOption
  height?: string
  onEvents?: Record<string, (params: unknown) => void>
  onChartReady?: (echarts: EChartsType) => void
}

export function TreemapChart({ option, height = "600px", onEvents, onChartReady }: TreemapChartProps) {
  return (
    <ReactECharts
      option={option}
      notMerge={true}
      style={{ height, width: "100%" }}
      loadingOption={{ text: "Loading..." }}
      onEvents={onEvents}
      onChartReady={onChartReady}
    />
  )
}

export function TreemapChartSkeleton() {
  return (
    <div className="relative h-[600px] animate-pulse rounded-lg bg-muted">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground/50">Loading chart…</span>
      </div>
    </div>
  )
}
