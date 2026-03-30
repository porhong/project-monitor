export type Status = "not-started" | "in-progress" | "pending" | "blocked" | "completed"

export interface Module {
  id: string
  name: string
  description?: string
}

export interface ModuleEntry {
  moduleId: string
  moduleSize: number
  status: Status
  description: string
  overview?: string
  scope?: string
  resources?: string
  constraints?: string
  schedule?: string
}

export interface Version {
  id: string
  name: string
  createdAt: string
  entries: ModuleEntry[]
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  modules: Module[]
  versions: Version[]
}

export interface TreemapNodeData {
  name: string
  value: number
  moduleSize?: number
  status?: string
  itemStyle?: { color: string }
  children?: TreemapNodeData[]
  entryData?: ModuleEntry
}
