'use client'

import { Suspense, useEffect, useMemo } from 'react'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { Layers } from 'lucide-react'
import ScrollObserver from '@/components/ScrollObserver'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import { ProjectsTimeline } from '@/components/ProjectsTimeline'
import DevSection from '@/components/devmode/DevSection'
import { useDevMode } from '@/contexts/DevModeContext'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { MetaChip, PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'
import type { ProjectEntry } from '@/lib/projects'
import type { PageCopy } from '@/lib/site-content'

interface ProjectsContentProps {
  projects: ProjectEntry[]
  copy?: PageCopy
}

const PAGE_KEY = 'projects'
const DEFAULT_SECTIONS = ['intro', 'work', 'timeline'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

export default function ProjectsContent({ projects, copy }: ProjectsContentProps) {
  const sections = copy?.sections
  const { mode, registerPageSections, getSectionOrder } = useDevMode()

  useEffect(() => {
    registerPageSections(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[])
  }, [registerPageSections])

  const orderedSections = useMemo(() => {
    const sections = getSectionOrder(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[])
    const filtered = sections.filter((section): section is SectionId =>
      (DEFAULT_SECTIONS as readonly string[]).includes(section as SectionId),
    )
    return filtered.length ? filtered : [...DEFAULT_SECTIONS]
  }, [getSectionOrder])

  const intro = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label={copy?.eyebrow ?? ''}
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? ''}
        accent={copy?.accent}
        description={copy?.description}
        meta={
          projects.length ? <MetaChip icon={Layers}>{projects.length}</MetaChip> : undefined
        }
      />
    </DevSection>
  )

  const work = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="work"
      label="Case Studies"
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageSection
        eyebrow={sections?.work?.eyebrow}
        krEyebrow={sections?.work?.krEyebrow}
        title={sections?.work?.title ?? ''}
        accent={sections?.work?.accent}
        description={sections?.work?.description}
      >
        {projects.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug || project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
          <EmptyCollectionState
            eyebrow="Projects / Empty"
            title="No case studies yet."
            description="Published projects appear here with their stack, links and case study pages."
          />
        )}
      </PageSection>
    </DevSection>
  )

  const timeline = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="timeline"
      label="Timeline & Milestones"
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageSection
        eyebrow={sections?.timeline?.eyebrow}
        krEyebrow={sections?.timeline?.krEyebrow}
        title={sections?.timeline?.title ?? ''}
        accent={sections?.timeline?.accent}
        description={sections?.timeline?.description}
      >
        <ProjectsTimeline projects={projects} />
      </PageSection>
    </DevSection>
  )

  const sectionMap: Record<SectionId, JSX.Element> = { intro, work, timeline }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <PageShell>
          <ScrollObserver />
          <div className="space-y-16 md:space-y-24">
            {mode === 'classic' ? (
              <>
                {intro}
                {work}
                {timeline}
              </>
            ) : (
              orderedSections.map((sectionId) => <div key={sectionId}>{sectionMap[sectionId]}</div>)
            )}
          </div>            <PageNav />
        </PageShell>
      </Suspense>
    </ErrorBoundary>
  )
}
