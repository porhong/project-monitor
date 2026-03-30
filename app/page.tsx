import Link from "next/link"
import { headers } from "next/headers"
import { FolderOpen, Users } from "lucide-react"
import { getAllProjects } from "@/lib/db/queries"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateProjectDialog } from "@/components/project-monitor/dialogs/create-project-dialog"
import { ProjectCard } from "@/components/project-monitor/project-card"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function Page() {
  // Await headers() first — it throws during `next build` static-generation
  // attempts, which prevents getAllProjects() from ever being called with an
  // empty in-memory DB.  At request time it resolves normally.
  const requestHeaders = await headers()
  const [projects, session] = await Promise.all([
    getAllProjects(),
    auth.api.getSession({ headers: requestHeaders }),
  ])
  const isAdmin = session?.user.role === "super-admin"

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="font-semibold tracking-tight">Project Monitor</span>
          <div className="flex items-center gap-2">
            {isAdmin && <CreateProjectDialog isAdmin={isAdmin} />}
            {isAdmin && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href="/admin/users">
                  <Users className="size-3.5" />
                  Users
                </Link>
              </Button>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <Badge variant="secondary" className="font-mono text-xs">
            {projects.length}
          </Badge>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
            <FolderOpen className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">No projects yet</p>
            {isAdmin && (
              <p className="mt-1 text-xs text-muted-foreground">
                Click &ldquo;New Project&rdquo; above to get started.
              </p>
            )}
          </div>
        ) : (
          <section className="flex flex-col gap-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} isAdmin={isAdmin} />
            ))}
          </section>
        )}
      </main>

      {/* Dark mode hint */}
      <p className="pb-8 text-center font-mono text-xs text-muted-foreground/50">
        Press <kbd className="rounded border px-1">d</kbd> to toggle dark mode
      </p>
    </div>
  )
}
