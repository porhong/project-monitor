import { getProjectById } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Boxes, GitBranch } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  if (!project) {
    return { title: "Project Not Found" }
  }

  return {
    title: `${project.name} — Project Monitor`,
  }
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params
  const { version: selectedVersionId } = await searchParams
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const totalModules = project.modules.length
  const totalVersions = project.versions.length

  // Sort versions by date (newest first) for display
  const sortedVersions = [...project.versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Find the selected version or default to the most recent
  const selectedVersion = selectedVersionId
    ? sortedVersions.find((v) => v.id === selectedVersionId) ?? sortedVersions[0]
    : sortedVersions[0]

  // Calculate stats based on selected version
  const selectedVersionEntries = selectedVersion?.entries ?? []
  const selectedVersionModuleCount = new Set(selectedVersionEntries.map((e) => e.moduleId)).size

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

  const STATUS_BADGE_VARIANT: Record<Status, "default" | "secondary" | "destructive" | "outline"> =
    {
      completed: "default",
      "in-progress": "secondary",
      pending: "outline",
      blocked: "outline",
      "not-started": "outline",
    }

  const STATUS_BADGE_STYLE: Record<Status, { backgroundColor: string; color: string }> = {
    completed: { backgroundColor: "#22c55e", color: "#ffffff" }, // green-500
    "in-progress": { backgroundColor: "#3b82f6", color: "#ffffff" }, // blue-500
    pending: { backgroundColor: "#f97316", color: "#ffffff" }, // orange-500
    blocked: { backgroundColor: "#86efac", color: "#052e16" }, // green-200, green-950
    "not-started": { backgroundColor: "#ef4444", color: "#ffffff" }, // red-500
  }

  const statusCounts = (() => {
    const counts: Record<Status, number> = {
      "not-started": 0,
      "in-progress": 0,
      pending: 0,
      blocked: 0,
      completed: 0,
    }

    for (const entry of selectedVersionEntries) {
      counts[entry.status] += 1
    }

    return counts
  })()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-3">
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Boxes className="size-4" />
              {totalModules} module{totalModules !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="size-4" />
              {totalVersions} version{totalVersions !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      {/* Version Selector */}
      <section className="flex items-center gap-2">
        <Button variant="default">
          <GitBranch className="mr-2 size-4" />
          <Link href={`/project/${project.id}/versions`}>Manage Versions</Link>
        </Button>
        <Button variant="default">
          <Boxes className="mr-2 size-4" />
          <Link href={`/project/${project.id}/modules`}>Manage Modules</Link>
        </Button>
      </section>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <Card className="flex-1 min-w-[120px]">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{totalModules}</p>
            <p className="text-xs text-muted-foreground">Modules</p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[120px]">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{totalVersions}</p>
            <p className="text-xs text-muted-foreground">Versions</p>
          </CardContent>
        </Card>
      </div>

      {/* Treemap */}
      <section className="flex flex-col gap-2">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Project overview</CardTitle>
              {selectedVersion && (
                <Tabs value={selectedVersion.id} className="w-fit max-w-full">
                  <TabsList>
                    {sortedVersions.map((v) => (
                      <TabsTrigger
                        key={v.id}
                        value={v.id}
                        asChild
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
          <CardContent>
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Card className="min-w-0 flex-1">
                  <CardContent className="flex flex-1 flex-col items-center justify-center gap-1 py-4 text-center">
                    <p className="w-full truncate text-2xl font-bold leading-tight">
                      {selectedVersion?.name ?? "No versions yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">Current Version</p>
                  </CardContent>
                </Card>
                <Card className="min-w-0 flex-1">
                  <CardContent className="flex flex-1 flex-col items-center justify-center gap-1 py-4 text-center">
                    <p className="text-2xl font-bold leading-tight tabular-nums">
                      {selectedVersionModuleCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Modules (this version)</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {STATUS_ORDER.map((status) => (
                      <Badge
                        key={status}
                        variant={STATUS_BADGE_VARIANT[status]}
                        className="border-transparent"
                        style={STATUS_BADGE_STYLE[status]}
                      >
                        {STATUS_LABEL[status]}: {statusCounts[status]}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Current version status counts</p>
                </CardContent>
              </Card>
            </div>
            {selectedVersion ? (
              <TreemapSection projects={[project]} selectedVersionId={selectedVersion.id} />
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Create a version to see the project overview for a specific release.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
