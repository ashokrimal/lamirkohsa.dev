'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FolderGit2, Layers, RotateCcw, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import ScrollObserver from '@/components/ScrollObserver'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import DevSection from '@/components/devmode/DevSection'
import { useDevMode } from '@/contexts/DevModeContext'
import { ProjectRow } from '@/components/ui/ProjectRow'
import {
  ProjectFilterControls,
  ProjectFilterPanel,
  filterProjects,
  normalizeFilterToken,
} from '@/components/ui/ProjectFilter'
import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import type { ProjectEntry, ProjectFilterTag } from '@/lib/projects'
import type { PageCopy } from '@/lib/site-content'
import { uiStrings } from '@/lib/ui-strings'
import { sensoryAudio } from '@/lib/sensory-audio'

interface ProjectsContentProps {
  projects: ProjectEntry[]
  techTags?: ProjectFilterTag[]
  copy?: PageCopy
  error?: string
}

const PAGE_KEY = 'projects'
const DEFAULT_SECTIONS = ['intro', 'work'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

export default function ProjectsContent({
  projects,
  techTags,
  copy,
  error,
}: ProjectsContentProps) {
  const { mode, registerPageSections, getSectionOrder } = useDevMode()
  const reduceMotion = useReducedMotion()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Restore any deep-linked filters (?q=...&category=...&tech=...) on mount without CSR bailouts
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')?.trim() || ''
      const cat = params.get('category')?.trim() || null
      const techParam = params.get('tech')?.trim()
      const techs = techParam
        ? techParam
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []
      if (q) setSearchQuery(q)
      if (cat) setSelectedCategory(cat)
      if (techs.length) setSelectedTechs(techs)
    } catch {}
  }, [])

  const syncUrlParams = useCallback(
    (nextQuery: string, nextCategory: string | null, nextTechs: string[]) => {
      try {
        const url = new URL(window.location.href)
        if (nextQuery.trim()) {
          url.searchParams.set('q', nextQuery.trim())
        } else {
          url.searchParams.delete('q')
        }
        if (nextCategory) {
          url.searchParams.set('category', nextCategory)
        } else {
          url.searchParams.delete('category')
        }
        if (nextTechs.length > 0) {
          url.searchParams.set('tech', nextTechs.join(','))
        } else {
          url.searchParams.delete('tech')
        }
        window.history.replaceState(null, '', url.pathname + url.search)
      } catch {}
    },
    [],
  )

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query)
      syncUrlParams(query, selectedCategory, selectedTechs)
    },
    [selectedCategory, selectedTechs, syncUrlParams],
  )

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      setSelectedCategory(category)
      syncUrlParams(searchQuery, category, selectedTechs)
    },
    [searchQuery, selectedTechs, syncUrlParams],
  )

  const handleToggleTech = useCallback(
    (tech: string) => {
      const normalizedTarget = normalizeFilterToken(tech)
      setSelectedTechs((prev) => {
        const exists = prev.some((item) => normalizeFilterToken(item) === normalizedTarget)
        const next = exists
          ? prev.filter((item) => normalizeFilterToken(item) !== normalizedTarget)
          : [...prev, tech]
        syncUrlParams(searchQuery, selectedCategory, next)
        return next
      })
    },
    [searchQuery, selectedCategory, syncUrlParams],
  )

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedTechs([])
    syncUrlParams('', null, [])
  }, [syncUrlParams])

  const filteredProjects = useMemo(
    () => filterProjects(projects, selectedCategory, selectedTechs, searchQuery),
    [projects, selectedCategory, selectedTechs, searchQuery],
  )

  const hasFilterOptions = useMemo(
    () =>
      Boolean(techTags?.length) ||
      projects.some((project) => Boolean(project.category?.trim()) || project.techStack.length > 0),
    [projects, techTags],
  )

  const activeFilterCount = (selectedCategory ? 1 : 0) + selectedTechs.length
  const hasAnyActiveState = activeFilterCount > 0 || searchQuery.trim().length > 0

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
          projects.length ? (
            <div className="flex w-full flex-wrap items-center gap-2 sm:gap-2.5">
              <span
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-subtle bg-surface/85 px-3 text-xs font-medium text-ink-secondary shadow-xs tabular-nums shrink-0"
                aria-live="polite"
              >
                <Layers className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>{filteredProjects.length}</span>
              </span>

              <ProjectFilterControls
                searchQuery={searchQuery}
                activeFilterCount={activeFilterCount}
                hasFilterOptions={hasFilterOptions}
                isFiltersOpen={isFiltersOpen}
                onSearchChange={handleSearchChange}
                onToggleFilters={() => setIsFiltersOpen((open) => !open)}
              />
            </div>
          ) : undefined
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
      {error ? (
        <CmsErrorState message={error} />
      ) : projects.length ? (
        <div>
          <ProjectFilterPanel
            projects={projects}
            cmsTechTags={techTags}
            isOpen={isFiltersOpen}
            selectedCategory={selectedCategory}
            selectedTechs={selectedTechs}
            hasAnyActiveState={hasAnyActiveState}
            onSelectCategory={handleSelectCategory}
            onToggleTech={handleToggleTech}
            onClear={handleClearFilters}
          />

          {filteredProjects.length > 0 ? (
            <div className="space-y-10 md:space-y-12">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.slug || project.id || project.title}
                    layout={!reduceMotion}
                    initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProjectRow project={project} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-medium bg-transparent px-6 py-12 text-center"
              role="status"
            >
              <SearchX className="h-5 w-5 text-muted" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm text-ink">{uiStrings.projects.noMatchesTitle.en}</p>
                <p className="text-xs text-muted">{uiStrings.projects.noMatchesHint.en}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sensoryAudio.playClick()
                  handleClearFilters()
                }}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-4 py-2 text-xs font-medium text-ink shadow-xs transition-colors hover:border-line-medium hover:text-accent cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>{uiStrings.projects.clearFilters.en}</span>
              </button>
            </div>
          )}
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
    </DevSection>
  )

  const sectionMap: Record<SectionId, JSX.Element> = { intro, work }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <PageShell>
          <ScrollObserver />
          <div className="space-y-8 md:space-y-10">
            {mode === 'classic' ? (
              <>
                {intro}
                {work}
              </>
            ) : (
              orderedSections.map((sectionId) => <div key={sectionId}>{sectionMap[sectionId]}</div>)
            )}
          </div>
          <PageNav />
        </PageShell>
      </Suspense>
    </ErrorBoundary>
  )
}
