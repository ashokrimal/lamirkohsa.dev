import type { CmsRecord } from '@/app/actions/content-cms'
import { toSlug } from '@/lib/slug'

export interface ProjectPhase {
  phase?: string
  name: string
  period?: string
  description?: string
  completed?: boolean
}

export interface ProjectEntry {
  id: number
  slug: string
  title: string
  category?: string
  image?: string
  altText?: string
  completionDate?: string
  period?: string
  status?: string
  summary?: string
  description?: string
  challenge?: string
  solution?: string
  phases: ProjectPhase[]
  features: string[]
  techStack: string[]
  github?: string
  live?: string
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

/**
 * Maps a CMS project record to the view model. Missing fields stay missing —
 * the UI omits them rather than filling in placeholder copy.
 */
export function mapProjectRecord(record: CmsRecord): ProjectEntry {
  const payload = record.payload ?? {}

  return {
    id: record.id,
    slug: record.slug || toSlug(record.title),
    title: record.title,
    category: optionalString(payload.category),
    image: optionalString(payload.image) ?? optionalString(payload.imageUrl),
    altText: optionalString(payload.altText),
    completionDate: optionalString(payload.completionDate),
    period: optionalString(payload.period),
    status: optionalString(payload.status),
    summary: optionalString(payload.summary),
    description: optionalString(payload.description),
    challenge: optionalString(payload.challenge) ?? optionalString(payload.description),
    solution: optionalString(payload.solution) ?? optionalString(payload.summary),
    phases: Array.isArray(payload.phases)
      ? (payload.phases as ProjectPhase[]).filter((phase) => Boolean(phase?.name))
      : [],
    features: stringArray(payload.features),
    techStack: stringArray(payload.techStack),
    github: optionalString(payload.github),
    live: optionalString(payload.live),
  }
}

export function mapProjectRecords(records: CmsRecord[]): ProjectEntry[] {
  return records.map(mapProjectRecord)
}
