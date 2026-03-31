"use client"

import { createElement } from "react"
import type { ReactElement } from "react"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { DocumentProps } from "@react-pdf/renderer"
import type { PdfReportData } from "@/lib/pdf/types"

export function useExportPdf(
  getChartImage: () => string | null,
  reportData: PdfReportData,
): { handleExport: () => Promise<void>; isExporting: boolean } {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const chartImageUrl = getChartImage()
      if (!chartImageUrl) {
        toast.error("Chart is not ready. Please wait and try again.")
        return
      }

      const [{ pdf }, { ProjectPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/build-project-pdf"),
      ])

      // `pdf()` expects ReactElement<DocumentProps>; our component renders a
      // <Document> root, so the assertion is safe at this system boundary.
      const blob = await pdf(
        createElement(ProjectPdfDocument, {
          data: reportData,
          chartImageUrl,
        }) as ReactElement<DocumentProps>,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      const safeName = reportData.projectName.replace(/[^a-z0-9]/gi, "-").toLowerCase()
      anchor.href = url
      anchor.download = `${safeName}-${reportData.versionName}-report.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }, [getChartImage, reportData])

  return { handleExport, isExporting }
}
