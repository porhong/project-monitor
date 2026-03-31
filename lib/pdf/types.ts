import type { Status } from "@/lib/types"

export interface PdfModuleRow {
  id: string
  name: string
  description: string
  status: Status
  features: number
}

export interface PdfReportData {
  projectName: string
  projectDescription: string
  exportedAt: string
  versionName: string
  activeModules: number
  totalFeatures: number
  statusCounts: Partial<Record<Status, number>>
  moduleRows: PdfModuleRow[]
}
