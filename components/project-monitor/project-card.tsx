"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteProjectButton } from "@/components/project-monitor/delete-project-button"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const latestVersion = project.versions[project.versions.length - 1]
  const totalFeatures = latestVersion
    ? latestVersion.entries.reduce((sum, e) => sum + e.moduleSize, 0)
    : null

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <Link
          href={`/project/${project.id}`}
          className="flex-1 transition-colors hover:text-foreground"
        >
          <div className="space-y-1">
            <h3 className="font-semibold">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
              <span>{project.modules.length} module{project.modules.length !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{project.versions.length} version{project.versions.length !== 1 ? "s" : ""}</span>
              {totalFeatures !== null && totalFeatures > 0 && (
                <>
                  <span>•</span>
                  <span>{totalFeatures} feature{totalFeatures !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>
        </Link>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </CardContent>
    </Card>
  )
}
