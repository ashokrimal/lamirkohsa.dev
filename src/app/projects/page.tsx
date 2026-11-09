import type { Metadata } from 'next'
import ProjectsContent from '@/components/pages/ProjectsContent'
import { getPublishedCmsContent } from '@/app/actions/content-cms'

export const dynamic = 'force-dynamic'

export type ProjectCategory = 'Web' | 'Mobile'

export interface ProjectPhase {
  phase: string
  name: string
  period: string
  description: string
  completed: boolean
}

export interface ProjectItem {
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

export const metadata: Metadata = {
  title: 'Projects & Systems - Ashok Rimal',
  description: 'Technical case studies demonstrating Ashok Rimal’s approach to web, mobile, and full-stack software development.',
}

export default async function ProjectsPage() {
  // Fetch ALL projects dynamically from CMS
  const records = await getPublishedCmsContent('Projects')

  const projects: ProjectItem[] = records.map((r) => {
    const p = r.payload || {}
    const category = (p.category === 'Mobile' ? 'Mobile' : 'Web') as ProjectCategory
    const phases: ProjectPhase[] = Array.isArray(p.phases)
      ? (p.phases as ProjectPhase[])
      : []
    const features: string[] = Array.isArray(p.features)
      ? (p.features as string[])
      : []
    const techStack: string[] = Array.isArray(p.techStack)
      ? (p.techStack as string[])
      : []

    return {
      title: r.title,
      category,
      image: typeof p.image === 'string' ? p.image : (typeof p.imageUrl === 'string' ? p.imageUrl : 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&auto=format&fit=crop&q=80'),
      completionDate: typeof p.completionDate === 'string' ? p.completionDate : '2024',
      period: typeof p.period === 'string' ? p.period : '2024',
      status: typeof p.status === 'string' ? p.status : 'Active',
      challenge: typeof p.challenge === 'string' ? p.challenge : (typeof p.description === 'string' ? p.description : 'Engineering requirements and problem definition.'),
      solution: typeof p.solution === 'string' ? p.solution : (typeof p.summary === 'string' ? p.summary : 'Architectural implementation and user experience.'),
      phases,
      features: features.length ? features : ['Accessible and responsive layout', 'Optimized data operations and state handling'],
      techStack: techStack.length ? techStack : ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      github: typeof p.github === 'string' ? p.github : 'https://github.com/ashokrimal',
      live: typeof p.live === 'string' ? p.live : undefined,
    }
  })

  const filters: Array<'All' | ProjectCategory> = ['All', 'Web', 'Mobile']

  return (
    <ProjectsContent
      projects={projects}
      filters={filters}
      heading={
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">
            Selected Work · Case Studies
          </p>
          <h1 className="text-4xl md:text-6xl font-normal tracking-[-0.07em] text-[var(--ink)] leading-[0.95]">
            Engineering ideas into <span className="font-serif italic text-[var(--accent)]">reality.</span>
          </h1>
        </div>
      }
      description={
        <p className="mt-5 text-sm md:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
          From initial user discovery to production deployment, here are selected systems where I balanced architecture, performance, interface craft, and real-world utility. All records managed via CMS.
        </p>
      }
    />
  )
}
