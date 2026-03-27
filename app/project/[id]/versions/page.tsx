import { getProjectById } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { ArrowLeft, GitBranch, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateVersionDialog } from "@/components/project-monitor/dialogs/create-version-dialog"
import { EditVersionDialog } from "@/components/project-monitor/dialogs/edit-version-dialog"
import { DeleteVersionButton } from "@/components/project-monitor/delete-version-button"

interface VersionsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: VersionsPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    return { title: "Project Not Found" }
  }

  return {
    title: `Versions — ${project.name} • Project Monitor`,
  }
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  // Sort versions by creation date (newest first)
  const sortedVersions = [...project.versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-3">
              <Link href={`/project/${project.id}`}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Project
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Versions</h1>
            <p className="text-sm text-muted-foreground">
              Manage versions for {project.name}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="size-4" />
              {project.versions.length} version{project.versions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <CreateVersionDialog projectId={project.id} projectName={project.name} />
      </div>

      {/* Versions List */}
      {project.versions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <GitBranch className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No versions yet. Add a version to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedVersions.map((version) => (
            <Card key={version.id} className="gap-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{version.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(version.createdAt).toLocaleDateString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {version.entries.length} module{version.entries.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/project/${project.id}?version=${version.id}`}>
                      Select
                    </Link>
                  </Button>
                  <EditVersionDialog
                    version={version}
                    modules={project.modules}
                    projectId={project.id}
                  />
                  <DeleteVersionButton
                    projectId={project.id}
                    versionId={version.id}
                    versionName={version.name}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
