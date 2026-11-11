'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { FolderGit2, Layers } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import ScrollObserver from '@/components/ScrollObserver'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import DevSection from '@/components/devmode/DevSection'
import { useDevMode } from '@/contexts/DevModeContext'
import { ProjectRow } from '@/components/ui/ProjectRow'
import { MetaChip, PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'
import type { ProjectEntry } from '@/lib/projects'
import type { PageCopy } from '@/lib/site-content'
import { uiStrings } from '@/lib/ui-strings'

interface ProjectsContentProps {
  projects: ProjectEntry[]
  copy?: PageCopy
  error?: string
}

const PAGE_KEY = 'projects'
const DEFAULT_SECTIONS = ['intro', 'work'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

export default function ProjectsContent({ projects, copy, error }: ProjectsContentProps) {
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
        title={copy?.title ?? CMS_SCHEMA.sections.pages.projects.label}
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
      label={uiStrings.projects.worksHeading.en}
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageSection
        number={0}
        eyebrow={sections?.work?.eyebrow}
        krEyebrow={sections?.work?.krEyebrow}
        title={sections?.work?.title ?? CMS_SCHEMA.sections.pages.projects.label}
        accent={sections?.work?.accent}
        description={sections?.work?.description}
      >
        {error ? (
          <CmsErrorState message={error} />
        ) : projects.length ? (
          <div>
            {projects.map((project, index) => (
              <ProjectRow key={project.slug || project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderGit2}
            message={CMS_SCHEMA.sections.pages.projects.emptyState.message}
            hint={CMS_SCHEMA.sections.pages.projects.emptyState.hint}
            actionLabel={CMS_SCHEMA.sections.pages.projects.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.sections.pages.projects.emptyState.actionHref}
          />
        )}
      </PageSection>
    </DevSection>
  )

  const sectionMap: Record<SectionId, JSX.Element> = { intro, work }

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
