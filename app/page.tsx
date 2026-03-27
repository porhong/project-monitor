import { getAllProjects } from "@/lib/db/queries"
import { CreateProjectDialog } from "@/components/project-monitor/dialogs/create-project-dialog"
import { ProjectCard } from "@/components/project-monitor/project-card"

export default async function Page() {
  const projects = await getAllProjects()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Project list */}
      <section className="flex flex-col gap-3">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No projects yet. Click &quot;New Project&quot; to get started.
          </p>
        )}
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>

      {/* Dark mode hint */}
      <p className="text-center font-mono text-xs text-muted-foreground">
        Press <kbd className="rounded border px-1">d</kbd> to toggle dark mode
      </p>
    </div>
  )
}
