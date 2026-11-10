import type { CmsRecord } from '@/app/actions/content-cms'
import { toSlug } from '@/lib/slug'

export type ProjectCategory = 'Web' | 'Mobile'

export interface ProjectPhase {
  phase: string
  name: string
  period: string
  description: string
  completed: boolean
}

export interface ProjectEntry {
  id: number
  slug: string
  title: string
  category: ProjectCategory
  image: string
  completionDate: string
  period: string
  status: string
  challenge: string
  solution: string
  phases: ProjectPhase[]
  features: string[]
  techStack: string[]
  github: string
  live?: string
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&auto=format&fit=crop&q=80'

export function mapProjectRecord(record: CmsRecord): ProjectEntry {
  const p = record.payload || {}

  const phases: ProjectPhase[] = Array.isArray(p.phases) ? (p.phases as ProjectPhase[]) : []
  const features: string[] = Array.isArray(p.features) ? (p.features as string[]) : []
  const techStack: string[] = Array.isArray(p.techStack) ? (p.techStack as string[]) : []

  return {
    id: record.id,
    slug: record.slug || toSlug(record.title),
    title: record.title,
    category: (p.category === 'Mobile' ? 'Mobile' : 'Web') as ProjectCategory,
    image:
      typeof p.image === 'string'
        ? p.image
        : typeof p.imageUrl === 'string'
          ? p.imageUrl
          : FALLBACK_IMAGE,
    completionDate: typeof p.completionDate === 'string' ? p.completionDate : '2024',
    period: typeof p.period === 'string' ? p.period : '2024',
    status: typeof p.status === 'string' ? p.status : 'Active',
    challenge:
      typeof p.challenge === 'string'
        ? p.challenge
        : typeof p.description === 'string'
          ? p.description
          : 'Engineering requirements and problem definition.',
    solution:
      typeof p.solution === 'string'
        ? p.solution
        : typeof p.summary === 'string'
          ? p.summary
          : 'Architectural implementation and user experience.',
    phases,
    features: features.length
      ? features
      : ['Accessible and responsive layout', 'Optimized data operations and state handling'],
    techStack: techStack.length ? techStack : ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    github: typeof p.github === 'string' ? p.github : 'https://github.com/ashokrimal',
    live: typeof p.live === 'string' ? p.live : undefined,
  }
}

export function mapProjectRecords(records: CmsRecord[]): ProjectEntry[] {
  return records.map(mapProjectRecord)
}
