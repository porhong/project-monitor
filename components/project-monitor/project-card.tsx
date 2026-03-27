"use client"

import Link from "next/link"
import { ChevronRight, GitBranch, Layers, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteProjectButton } from "@/components/project-monitor/delete-project-button"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
  isAdmin: boolean
}

export function ProjectCard({ project, isAdmin }: ProjectCardProps) {
  const latestVersion = project.versions[project.versions.length - 1]
  const totalFeatures = latestVersion
    ? latestVersion.entries.reduce((sum, e) => sum + e.moduleSize, 0)
    : null

  return (
    <Card className="group transition-all hover:border-foreground/20 hover:shadow-sm">
      <CardContent className="flex items-center gap-2 p-4">
        <Link
          href={`/project/${project.id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight">{project.name}</h3>
              {latestVersion && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {latestVersion.name}
                </Badge>
              )}
            </div>
            {project.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Layers className="size-3" />
                {project.modules.length} module{project.modules.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GitBranch className="size-3" />
                {project.versions.length} version{project.versions.length !== 1 ? "s" : ""}
              </span>
              {totalFeatures !== null && totalFeatures > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3" />
                  {totalFeatures} feature{totalFeatures !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </Link>
        <DeleteProjectButton
          projectId={project.id}
          projectName={project.name}
          isAdmin={isAdmin}
        />
      </CardContent>
    </Card>
  )
}
