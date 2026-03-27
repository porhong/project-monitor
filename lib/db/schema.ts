import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
})

export const modules = sqliteTable("modules", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
})

export const versions = sqliteTable("versions", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
})

export const moduleEntries = sqliteTable("module_entries", {
  id: text("id").primaryKey(),
  versionId: text("version_id")
    .notNull()
    .references(() => versions.id, { onDelete: "cascade" }),
  moduleId: text("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  moduleSize: integer("module_size").notNull().default(1),
  status: text("status").notNull().default("not-started"),
  description: text("description").notNull().default(""),
})

// --- Relations ---

export const projectsRelations = relations(projects, ({ many }) => ({
  modules: many(modules),
  versions: many(versions),
}))

export const modulesRelations = relations(modules, ({ one }) => ({
  project: one(projects, { fields: [modules.projectId], references: [projects.id] }),
}))

export const versionsRelations = relations(versions, ({ one, many }) => ({
  project: one(projects, { fields: [versions.projectId], references: [projects.id] }),
  entries: many(moduleEntries),
}))

export const moduleEntriesRelations = relations(moduleEntries, ({ one }) => ({
  version: one(versions, { fields: [moduleEntries.versionId], references: [versions.id] }),
  module: one(modules, { fields: [moduleEntries.moduleId], references: [modules.id] }),
}))
