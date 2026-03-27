"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db/index"
import { moduleEntries, modules, projects, versions } from "@/lib/db/schema"
import type { ModuleEntry } from "@/lib/types"
import { requireAdmin } from "@/lib/auth-guard"

function uuid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

// ── Projects ──────────────────────────────────────────────

export async function createProject(name: string, description?: string): Promise<void> {
  await requireAdmin()
  db.insert(projects)
    .values({ id: uuid(), name, description: description ?? null, createdAt: now() })
    .run()
  revalidatePath("/")
}

export async function deleteProject(projectId: string): Promise<void> {
  await requireAdmin()
  db.delete(projects).where(eq(projects.id, projectId)).run()
  revalidatePath("/")
}

// ── Modules ───────────────────────────────────────────────

export async function createModule(
  projectId: string,
  name: string,
  description?: string,
): Promise<void> {
  await requireAdmin()
  db.insert(modules)
    .values({ id: uuid(), projectId, name, description: description ?? null })
    .run()
  revalidatePath("/")
}

export async function deleteModule(projectId: string, moduleId: string): Promise<void> {
  await requireAdmin()
  db.delete(modules).where(eq(modules.id, moduleId)).run()
  revalidatePath("/")
  revalidatePath(`/project/${projectId}`)
}

export async function updateModule(
  projectId: string,
  moduleId: string,
  name: string,
  description?: string,
): Promise<void> {
  await requireAdmin()
  db
    .update(modules)
    .set({ name, description: description ?? null })
    .where(eq(modules.id, moduleId))
    .run()
  revalidatePath("/")
  revalidatePath(`/project/${projectId}`)
}

export async function importModules(
  projectId: string,
  items: Array<{ name: string; description?: string }>,
): Promise<{ imported: number }> {
  await requireAdmin()
  let imported = 0
  for (const item of items) {
    const trimmed = item.name.trim()
    if (!trimmed) continue
    db.insert(modules)
      .values({ id: uuid(), projectId, name: trimmed, description: item.description?.trim() || null })
      .run()
    imported++
  }
  revalidatePath("/")
  revalidatePath(`/project/${projectId}`)
  revalidatePath(`/project/${projectId}/modules`)
  return { imported }
}

// ── Versions ──────────────────────────────────────────────

export async function createVersion(projectId: string, name: string): Promise<void> {
  await requireAdmin()
  db.insert(versions)
    .values({ id: uuid(), projectId, name, createdAt: now() })
    .run()
  revalidatePath("/")
}

export async function deleteVersion(projectId: string, versionId: string): Promise<void> {
  await requireAdmin()
  db.delete(versions).where(eq(versions.id, versionId)).run()
  revalidatePath("/")
  revalidatePath(`/project/${projectId}`)
  revalidatePath(`/project/${projectId}/versions`)
}

export async function updateVersion(
  projectId: string,
  versionId: string,
  name: string,
): Promise<void> {
  await requireAdmin()
  db
    .update(versions)
    .set({ name })
    .where(eq(versions.id, versionId))
    .run()
  revalidatePath("/")
  revalidatePath(`/project/${projectId}`)
  revalidatePath(`/project/${projectId}/versions`)
}

// ── Module Entries ─────────────────────────────────────────

export async function upsertEntries(
  projectId: string,
  versionId: string,
  entries: ModuleEntry[],
): Promise<void> {
  await requireAdmin()
  // Delete existing entries for this version and re-insert
  db.delete(moduleEntries).where(eq(moduleEntries.versionId, versionId)).run()

  for (const entry of entries) {
    db.insert(moduleEntries)
      .values({
        id: uuid(),
        versionId,
        moduleId: entry.moduleId,
        moduleSize: entry.moduleSize,
        status: entry.status,
        description: entry.description,
      })
      .run()
  }

  revalidatePath("/")
  revalidatePath(`/project/${projectId}`)
  revalidatePath(`/project/${projectId}/versions`)
}
