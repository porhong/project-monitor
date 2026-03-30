import { headers } from "next/headers"
import { getProjectById } from "@/lib/db/queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ArrowLeft, Boxes, Calendar, GitBranch } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
  if (!project) return { title: "Project Not Found" }
  return { title: `Modules — ${project.name} • Project Monitor` }
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { id } = await params
  const requestHeaders = await headers()
  const [project, session] = await Promise.all([
    getProjectById(id),
    auth.api.getSession({ headers: requestHeaders }),
  ])
  const role = session?.user.role
  const canManageContent = role === "super-admin" || role === "admin"

  if (!project) notFound()

  const moduleVersionCount = new Map<string, number>()
  project.versions.forEach((version) => {
    version.entries.forEach((entry) => {
      moduleVersionCount.set(entry.moduleId, (moduleVersionCount.get(entry.moduleId) ?? 0) + 1)
    })
  })

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
            <span className="font-semibold">Modules</span>
          </div>
          {canManageContent && (
            <div className="flex shrink-0 items-center gap-2">
              <ImportModulesDialog
                projectId={project.id}
                projectName={project.name}
                isAdmin={canManageContent}
              />
              <CreateModuleDialog
                projectId={project.id}
                projectName={project.name}
                isAdmin={canManageContent}
              />
            </div>
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
            <Boxes className="size-3.5" />
            {project.modules.length} module{project.modules.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="size-3.5" />
            {project.versions.length} version{project.versions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Modules list */}
        {project.modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
            <Boxes className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">No modules yet</p>
            {canManageContent && (
              <p className="mt-1 text-xs text-muted-foreground">
                Click &ldquo;New Module&rdquo; above to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {project.modules.map((mod) => {
              const versionCount = moduleVersionCount.get(mod.id) ?? 0
              return (
                <Card
                  key={mod.id}
                  className="transition-all hover:border-foreground/20 hover:shadow-sm"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-semibold">{mod.name}</h3>
                      {mod.description && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {mod.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {versionCount} version{versionCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <EditModuleDialog
                        projectId={project.id}
                        module={mod}
                        isAdmin={canManageContent}
                      />
                      <DeleteModuleButton
                        projectId={project.id}
                        moduleId={mod.id}
                        moduleName={mod.name}
                        isAdmin={canManageContent}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
