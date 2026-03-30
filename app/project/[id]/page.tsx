import { headers } from "next/headers"
import { getProjectById } from "@/lib/db/queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ArrowLeft, Boxes, Calendar, GitBranch } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TreemapSection } from "@/components/project-monitor/treemap-section"
import { DeleteProjectButton } from "@/components/project-monitor/delete-project-button"
import type { Status } from "@/lib/types"

interface ProjectPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ version?: string }>
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return { title: "Project Not Found" }
  return { title: `${project.name} — Project Monitor` }
}

const STATUS_ORDER: Status[] = [
  "completed",
  "in-progress",
  "pending",
  "blocked",
  "not-started",
]

const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  pending: "Pending",
  blocked: "Needs Improvement",
  completed: "Completed",
}

const STATUS_DOT_COLOR: Record<Status, string> = {
  completed: "#3d7a58",
  "in-progress": "#5b82b5",
  pending: "#d4824a",
  blocked: "#7aab8a",
  "not-started": "#b85c58",
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params
  const { version: selectedVersionId } = await searchParams
  const requestHeaders = await headers()
  const [project, session] = await Promise.all([
    getProjectById(id),
    auth.api.getSession({ headers: requestHeaders }),
  ])
  const role = session?.user.role
  const isSuperAdmin = role === "super-admin"
  const canManageContent = role === "super-admin" || role === "admin"

  if (!project) notFound()

  const sortedVersions = [...project.versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const selectedVersion = selectedVersionId
    ? (sortedVersions.find((v) => v.id === selectedVersionId) ?? sortedVersions[0])
    : sortedVersions[0]

  const selectedVersionEntries = selectedVersion?.entries ?? []
  const selectedVersionModuleCount = new Set(selectedVersionEntries.map((e) => e.moduleId)).size
  const totalFeatures = selectedVersionEntries.reduce((sum, e) => sum + e.moduleSize, 0)

  const statusCounts = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = selectedVersionEntries.filter((e) => e.status === s).length
      return acc
    },
    {} as Record<Status, number>,
  )

  const visibleStatuses = STATUS_ORDER.filter((s) => statusCounts[s] > 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-7 shrink-0" />
            <span className="truncate font-semibold">{project.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/project/${project.id}/versions`}>
                <GitBranch className="size-3.5" />
                Versions
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/project/${project.id}/modules`}>
                <Boxes className="size-3.5" />
                Modules
              </Link>
            </Button>
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.name}
              isAdmin={isSuperAdmin}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Project meta */}
        <div className="space-y-1.5">
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Boxes className="size-3.5" />
              {project.modules.length} module{project.modules.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="size-3.5" />
              {project.versions.length} version{project.versions.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Overview card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Overview</CardTitle>
              {sortedVersions.length > 0 && (
                <Tabs value={selectedVersion?.id ?? ""} className="w-fit max-w-full">
                  <TabsList className="h-8">
                    {sortedVersions.map((v) => (
                      <TabsTrigger
                        key={v.id}
                        value={v.id}
                        asChild
                        className="h-7 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Link href={`?version=${v.id}`} scroll={false}>
                          {v.name}
                        </Link>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {selectedVersion ? (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center">
                    <p className="truncate text-xl font-bold tabular-nums">
                      {selectedVersion.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Version</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center">
                    <p className="text-xl font-bold tabular-nums">{selectedVersionModuleCount}</p>
                    <p className="text-xs text-muted-foreground">Active Modules</p>
                  </div>
                  <div className="col-span-2 rounded-lg border bg-muted/30 px-4 py-3 text-center sm:col-span-1">
                    <p className="text-xl font-bold tabular-nums">{totalFeatures}</p>
                    <p className="text-xs text-muted-foreground">Total Features</p>
                  </div>
                </div>

                {/* Status breakdown */}
                {visibleStatuses.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 px-4 py-3">
                    <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                      Status Breakdown
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {visibleStatuses.map((status) => (
                        <div key={status} className="flex items-center gap-1.5">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: STATUS_DOT_COLOR[status] }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {STATUS_LABEL[status]}
                          </span>
                          <span className="text-xs font-semibold tabular-nums">
                            {statusCounts[status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treemap */}
                <TreemapSection projects={[project]} selectedVersionId={selectedVersion.id} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <GitBranch className="mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Create a version to see the project overview.
                </p>
                {canManageContent && (
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5" asChild>
                    <Link href={`/project/${project.id}/versions`}>
                      <GitBranch className="size-3.5" />
                      Manage Versions
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
