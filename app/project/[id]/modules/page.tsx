import { getProjectById } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { ArrowLeft, Boxes, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateModuleDialog } from "@/components/project-monitor/dialogs/create-module-dialog"
import { EditModuleDialog } from "@/components/project-monitor/dialogs/edit-module-dialog"
import { DeleteModuleButton } from "@/components/project-monitor/delete-module-button"
import { ImportModulesDialog } from "@/components/project-monitor/dialogs/import-modules-dialog"

interface ModulesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ModulesPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    return { title: "Project Not Found" }
  }

  return {
    title: `Modules — ${project.name} • Project Monitor`,
  }
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  // Get all version IDs for each module
  const moduleVersionCount = new Map<string, number>()
  project.versions.forEach((version) => {
    version.entries.forEach((entry) => {
      moduleVersionCount.set(entry.moduleId, (moduleVersionCount.get(entry.moduleId) ?? 0) + 1)
    })
  })

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
            <h1 className="text-2xl font-bold">Modules</h1>
            <p className="text-sm text-muted-foreground">
              Manage modules for {project.name}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Boxes className="size-4" />
              {project.modules.length} module{project.modules.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ImportModulesDialog projectId={project.id} projectName={project.name} />
          <CreateModuleDialog projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* Modules List */}
      {project.modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <Boxes className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No modules yet. Add a module to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {project.modules.map((mod) => {
            const versionCount = moduleVersionCount.get(mod.id) ?? 0
            return (
              <Card key={mod.id} className="gap-3 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{mod.name}</h3>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground">{mod.description}</p>
                    )}
                    <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        Used in {versionCount} version{versionCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditModuleDialog projectId={project.id} module={mod} />
                    <DeleteModuleButton projectId={project.id} moduleId={mod.id} moduleName={mod.name} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
