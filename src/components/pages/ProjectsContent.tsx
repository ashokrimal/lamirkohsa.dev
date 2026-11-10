'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { Calendar, Layers } from 'lucide-react'
import ScrollObserver from '@/components/ScrollObserver'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import { ProjectsTimeline } from '@/components/ProjectsTimeline'
import DevSection from '@/components/devmode/DevSection'
import { useDevMode } from '@/contexts/DevModeContext'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { MetaChip, PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'
import type { ProjectEntry } from '@/lib/projects'

interface ProjectsContentProps {
  projects: ProjectEntry[]
}

const PAGE_KEY = 'projects'
const DEFAULT_SECTIONS = ['intro', 'work', 'timeline'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

export default function ProjectsContent({ projects }: ProjectsContentProps) {
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

  const webCount = projects.filter((project) => project.category === 'Web').length
  const mobileCount = projects.filter((project) => project.category === 'Mobile').length

  const intro = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label="Intro"
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageHero
        eyebrow="Selected Work · Case Studies"
        krEyebrow="주요 프로젝트"
        title="Engineering ideas into"
        accent="reality."
        description="Case studies from discovery to deployment, where architecture, performance and interface craft meet real-world utility. Every record is managed through the CMS."
        meta={
          <>
            <MetaChip icon={Layers}>{projects.length} case studies</MetaChip>
            <MetaChip>{webCount} web</MetaChip>
            <MetaChip>{mobileCount} mobile</MetaChip>
            <MetaChip icon={Calendar}>2019 — today</MetaChip>
          </>
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
        eyebrow="Archive"
        krEyebrow="전체 사례"
        title="Selected"
        accent="case studies."
        description="Open a project to read its challenge, solution, delivery phases and technical stack."
      >
        {projects.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug || project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="apple-card p-10 text-center text-sm text-muted">
            Case studies will appear here as they are published in the CMS.
          </div>
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
        eyebrow="Process"
        krEyebrow="진행 단계"
        title="Delivery"
        accent="timeline."
        description="How each build moved from the first phase through to release."
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
          </div>
          <PageNav backLabel="Return home" nextHref="/contact" nextLabel="Start a conversation" />
        </PageShell>
      </Suspense>
    </ErrorBoundary>
  )
}
