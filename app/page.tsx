import Link from "next/link"
import { headers } from "next/headers"
import { Users } from "lucide-react"
import { getAllProjects } from "@/lib/db/queries"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { CreateProjectDialog } from "@/components/project-monitor/dialogs/create-project-dialog"
import { ProjectCard } from "@/components/project-monitor/project-card"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function Page() {
  const [projects, session] = await Promise.all([
    getAllProjects(),
    auth.api.getSession({ headers: await headers() }),
  ])
  const isAdmin = session?.user.role === "admin"

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
        <div className="flex items-center gap-2">
          {isAdmin && <CreateProjectDialog isAdmin={isAdmin} />}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-mono text-xs tracking-wide"
              asChild
            >
              <Link href="/admin/users">
                <Users className="size-3.5" />
                Users
              </Link>
            </Button>
          )}
          <SignOutButton />
        </div>
      </div>

      {/* Project list */}
      <section className="flex flex-col gap-3">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No projects yet. Click &quot;New Project&quot; to get started.
          </p>
        )}
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} isAdmin={isAdmin} />
        ))}
      </section>

      {/* Dark mode hint */}
      <p className="text-center font-mono text-xs text-muted-foreground">
        Press <kbd className="rounded border px-1">d</kbd> to toggle dark mode
      </p>
    </div>
  )
}
