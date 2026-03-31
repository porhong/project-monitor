import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { PdfReportData } from "@/lib/pdf/types"
import type { Status } from "@/lib/types"

const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  pending: "Pending",
  blocked: "Needs Improvement",
  completed: "Completed",
}

const STATUS_COLOR: Record<Status, string> = {
  completed: "#3d7a58",
  "in-progress": "#5b82b5",
  pending: "#d4824a",
  blocked: "#7aab8a",
  "not-started": "#b85c58",
}

const STATUS_ORDER: Status[] = [
  "completed",
  "in-progress",
  "pending",
  "blocked",
  "not-started",
]

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
  },
  // Header
  accentBar: {
    height: 6,
    backgroundColor: "#d4824a",
    borderRadius: 2,
    marginBottom: 16,
  },
  projectName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 10,
    lineHeight: 1.5,
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerMetaText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginTop: 12,
    marginBottom: 20,
  },
  // Stats
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f5f2ee",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  // Status breakdown
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  statusCount: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  // Chart
  chartImage: {
    width: "100%",
    maxHeight: 280,
    objectFit: "contain",
    borderRadius: 4,
    marginBottom: 20,
  },
  // Modules list
  moduleList: {
    width: "100%",
    gap: 5,
  },
  moduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  moduleAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  moduleContent: {
    flex: 1,
    paddingVertical: 9,
    paddingLeft: 10,
    paddingRight: 8,
  },
  moduleName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: 8,
    color: "#9ca3af",
    lineHeight: 1.4,
  },
  moduleRight: {
    paddingVertical: 9,
    paddingRight: 10,
    paddingLeft: 8,
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    minWidth: 90,
  },
  statusBadge: {
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 7.5,
    color: "#6b7280",
  },
  featureCount: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
  featureUnit: {
    fontSize: 7.5,
    color: "#9ca3af",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#d1d5db",
  },
})

interface ProjectPdfDocumentProps {
  data: PdfReportData
  chartImageUrl: string
}

export function ProjectPdfDocument({ data, chartImageUrl }: ProjectPdfDocumentProps) {
  const visibleStatuses = STATUS_ORDER.filter(
    (s) => (data.statusCounts[s] ?? 0) > 0,
  )

  return (
    <Document
      title={`${data.projectName} — Project Report`}
      author="Project Monitor"
      subject={`Overview report for ${data.projectName}, version ${data.versionName}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header block — keep together */}
        <View wrap={false}>
          <View style={styles.accentBar} />
          <Text style={styles.projectName}>{data.projectName}</Text>
          {data.projectDescription ? (
            <Text style={styles.projectDescription}>{data.projectDescription}</Text>
          ) : null}
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaText}>Generated on {data.exportedAt}</Text>
            <Text style={styles.headerMetaText}>Version: {data.versionName}</Text>
          </View>
          <View style={styles.rule} />
        </View>

        {/* Stats — keep label + boxes together */}
        <View wrap={false}>
          <Text style={styles.sectionLabel}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.versionName}</Text>
              <Text style={styles.statLabel}>Version</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.activeModules}</Text>
              <Text style={styles.statLabel}>Active Modules</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.totalFeatures}</Text>
              <Text style={styles.statLabel}>Total Features</Text>
            </View>
          </View>
        </View>

        {/* Status breakdown — keep label + chips together */}
        {visibleStatuses.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionLabel}>Status Breakdown</Text>
            <View style={styles.statusRow}>
              {visibleStatuses.map((status) => (
                <View key={status} style={styles.statusChip}>
                  <View
                    style={[styles.statusDot, { backgroundColor: STATUS_COLOR[status] }]}
                  />
                  <Text style={styles.statusLabel}>{STATUS_LABEL[status]}</Text>
                  <Text style={styles.statusCount}>{data.statusCounts[status]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Treemap chart — keep label + image together; break to new page if needed */}
        <View wrap={false}>
          <Text style={styles.sectionLabel}>Module Treemap</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
          <Image src={chartImageUrl} style={styles.chartImage} />
        </View>

        {/* Modules list — each card is atomic; label stays with first card */}
        <View wrap={false} style={{ marginBottom: 5 }}>
          <Text style={styles.sectionLabel}>
            Modules ({data.moduleRows.length})
          </Text>
          {data.moduleRows[0] && (() => {
            const row = data.moduleRows[0]
            const color = STATUS_COLOR[row.status]
            return (
              <View style={styles.moduleRow}>
                <View style={[styles.moduleAccent, { backgroundColor: color }]} />
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleName}>{row.name}</Text>
                  {row.description ? (
                    <Text style={styles.moduleDescription}>{row.description}</Text>
                  ) : null}
                </View>
                <View style={styles.moduleRight}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{STATUS_LABEL[row.status]}</Text>
                  </View>
                  <Text style={styles.featureCount}>
                    {row.features}{" "}
                    <Text style={styles.featureUnit}>
                      {row.features === 1 ? "feat" : "feats"}
                    </Text>
                  </Text>
                </View>
              </View>
            )
          })()}
        </View>

        {/* Remaining module rows — each card never splits */}
        <View style={styles.moduleList}>
          {data.moduleRows.slice(1).map((row) => {
            const color = STATUS_COLOR[row.status]
            return (
              <View key={row.id} wrap={false} style={styles.moduleRow}>
                <View style={[styles.moduleAccent, { backgroundColor: color }]} />
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleName}>{row.name}</Text>
                  {row.description ? (
                    <Text style={styles.moduleDescription}>{row.description}</Text>
                  ) : null}
                </View>
                <View style={styles.moduleRight}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{STATUS_LABEL[row.status]}</Text>
                  </View>
                  <Text style={styles.featureCount}>
                    {row.features}{" "}
                    <Text style={styles.featureUnit}>
                      {row.features === 1 ? "feat" : "feats"}
                    </Text>
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Project Monitor</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
