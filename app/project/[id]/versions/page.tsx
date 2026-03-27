import { headers } from "next/headers"
import { getProjectById } from "@/lib/db/queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, GitBranch } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreateVersionDialog } from "@/components/project-monitor/dialogs/create-version-dialog"
import { EditVersionDialog } from "@/components/project-monitor/dialogs/edit-version-dialog"
import { DeleteVersionButton } from "@/components/project-monitor/delete-version-button"

interface VersionsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: VersionsPageProps) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return { title: "Project Not Found" }
  return { title: `Versions — ${project.name} • Project Monitor` }
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const { id } = await params
  const [project, session] = await Promise.all([
    getProjectById(id),
    auth.api.getSession({ headers: await headers() }),
  ])
  const isAdmin = session?.user.role === "admin"

  if (!project) notFound()

  const sortedVersions = [...project.versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
              <Link href={`/project/${project.id}`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-7 shrink-0" />
            <span className="truncate text-sm text-muted-foreground">{project.name}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-semibold">Versions</span>
          </div>
          {isAdmin && (
            <CreateVersionDialog
              projectId={project.id}
              projectName={project.name}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Page meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="size-3.5" />
            {project.versions.length} version{project.versions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Versions list */}
        {sortedVersions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
            <GitBranch className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">No versions yet</p>
            {isAdmin && (
              <p className="mt-1 text-xs text-muted-foreground">
                Click &ldquo;New Version&rdquo; above to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedVersions.map((version, index) => (
              <Card
                key={version.id}
                className="transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{version.name}</h3>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="size-3" />
                          {version.entries.length} module{version.entries.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button asChild variant="ghost" size="sm" className="text-xs">
                      <Link href={`/project/${project.id}?version=${version.id}`}>View</Link>
                    </Button>
                    <EditVersionDialog
                      version={version}
                      modules={project.modules}
                      projectId={project.id}
                      isAdmin={isAdmin}
                    />
                    <DeleteVersionButton
                      projectId={project.id}
                      versionId={version.id}
                      versionName={version.name}
                      isAdmin={isAdmin}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
