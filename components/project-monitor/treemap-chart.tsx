"use client"

import dynamic from "next/dynamic"
import type { EChartsOption } from "echarts"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

interface TreemapChartProps {
  option: EChartsOption
  height?: string
  onEvents?: Record<string, (params: unknown) => void>
}

export function TreemapChart({ option, height = "600px", onEvents }: TreemapChartProps) {
  return (
    <ReactECharts
      option={option}
      notMerge={true}
      style={{ height, width: "100%" }}
      loadingOption={{ text: "Loading..." }}
      onEvents={onEvents}
    />
  )
}

export function TreemapChartSkeleton() {
  return <div className="h-[600px] animate-pulse rounded-lg bg-muted" />
}
