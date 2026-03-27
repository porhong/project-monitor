import { db } from "@/lib/db/index"
import { eq } from "drizzle-orm"
import { projects } from "@/lib/db/schema"
import type { Project } from "@/lib/types"
import type { Status } from "@/lib/types"

export async function getAllProjects(): Promise<Project[]> {
  const rows = await db.query.projects.findMany({
    with: {
      modules: true,
      versions: {
        with: { entries: true },
      },
    },
  })

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    createdAt: p.createdAt,
    modules: p.modules.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description ?? undefined,
    })),
    versions: p.versions.map((v) => ({
      id: v.id,
      name: v.name,
      createdAt: v.createdAt,
      entries: v.entries.map((e) => ({
        moduleId: e.moduleId,
        moduleSize: e.moduleSize,
        status: e.status as Status,
        description: e.description,
      })),
    })),
  }))
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      modules: true,
      versions: {
        with: { entries: true },
      },
    },
  })

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    modules: row.modules.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description ?? undefined,
    })),
    versions: row.versions.map((v) => ({
      id: v.id,
      name: v.name,
      createdAt: v.createdAt,
      entries: v.entries.map((e) => ({
        moduleId: e.moduleId,
        moduleSize: e.moduleSize,
        status: e.status as Status,
        description: e.description,
      })),
    })),
  }
}
