'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ListFilter, RotateCcw, Search, X } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'
import type { ProjectEntry, ProjectFilterTag } from '@/lib/projects'
import { uiStrings } from '@/lib/ui-strings'

export interface FilterOption {
  value: string
  normalized: string
  count: number
}

const DEFAULT_TECH_VISIBLE = 12

export function normalizeFilterToken(value: string): string {
  return value.trim().toLowerCase()
}

export function filterProjects(
  projects: ProjectEntry[],
  selectedCategory: string | null,
  selectedTechs: string[],
  searchQuery: string = '',
): ProjectEntry[] {
  const normalizedCategory = selectedCategory ? normalizeFilterToken(selectedCategory) : null
  const normalizedTechs = selectedTechs.map(normalizeFilterToken).filter(Boolean)
  const normalizedQuery = normalizeFilterToken(searchQuery)

  return projects.filter((project) => {
    if (normalizedCategory) {
      const projectCat = project.category ? normalizeFilterToken(project.category) : ''
      if (projectCat !== normalizedCategory) return false
    }

    if (normalizedTechs.length > 0) {
      const projectTechSet = new Set(project.techStack.map(normalizeFilterToken))
      const matchesAllSelected = normalizedTechs.every((tech) => projectTechSet.has(tech))
      if (!matchesAllSelected) return false
    }

    if (normalizedQuery) {
      const searchable = [
        project.title,
        project.category,
        project.summary,
        project.description,
        project.techStack.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(normalizedQuery)) return false
    }

    return true
  })
}

interface ProjectFilterControlsProps {
  searchQuery: string
  activeFilterCount: number
  hasFilterOptions: boolean
  isFiltersOpen: boolean
  onSearchChange: (query: string) => void
  onToggleFilters: () => void
}

/**
 * Compact inline [ Search ] [ Filters v ] controls rendered beside the count chip
 * directly below the Projects title.
 */
export function ProjectFilterControls({
  searchQuery,
  activeFilterCount,
  hasFilterOptions,
  isFiltersOpen,
  onSearchChange,
  onToggleFilters,
}: ProjectFilterControlsProps) {
  return (
    <>
      <div className="relative flex-1 min-w-[120px] max-w-[240px] sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={uiStrings.projects.searchPlaceholder.en}
          aria-label="Search projects"
          className="h-9 w-full rounded-xl border border-line-subtle bg-surface/85 pl-8 pr-7 text-xs sm:text-sm text-ink placeholder:text-muted shadow-xs transition-colors focus:border-line-strong focus:bg-surface focus:outline-none"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => {
              sensoryAudio.playClick()
              onSearchChange('')
            }}
            aria-label={uiStrings.projects.clearSearch.en}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted hover:bg-overlay hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {hasFilterOptions && (
        <button
          type="button"
          onClick={() => {
            sensoryAudio.playToggle()
            onToggleFilters()
          }}
          aria-expanded={isFiltersOpen}
          aria-controls="project-filters-panel"
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isFiltersOpen || activeFilterCount > 0
              ? 'border-line-medium bg-surface text-ink'
              : 'border-line-subtle bg-surface/85 text-ink hover:border-line-medium hover:bg-surface'
          }`}
        >
          <ListFilter
            className={`h-3.5 w-3.5 transition-colors ${
              activeFilterCount > 0 ? 'text-accent' : 'text-muted'
            }`}
            aria-hidden="true"
          />
          <span>{uiStrings.projects.filtersLabel.en}</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-semibold text-inverse tabular-nums">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
              isFiltersOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      )}
    </>
  )
}

interface ProjectFilterPanelProps {
  projects: ProjectEntry[]
  cmsTechTags?: ProjectFilterTag[]
  isOpen: boolean
  selectedCategory: string | null
  selectedTechs: string[]
  hasAnyActiveState: boolean
  onSelectCategory: (category: string | null) => void
  onToggleTech: (tech: string) => void
  onClear: () => void
}

/**
 * Collapsible Category & Technology Stack filter drawer toggled by [ Filters v ].
 */
export function ProjectFilterPanel({
  projects,
  cmsTechTags,
  isOpen,
  selectedCategory,
  selectedTechs,
  hasAnyActiveState,
  onSelectCategory,
  onToggleTech,
  onClear,
}: ProjectFilterPanelProps) {
  const [showAllTechs, setShowAllTechs] = useState(false)
  const reduceMotion = useReducedMotion()

  const categories = useMemo<FilterOption[]>(() => {
    const map = new Map<string, FilterOption>()
    for (const project of projects) {
      const raw = project.category?.trim()
      if (!raw) continue
      const normalized = normalizeFilterToken(raw)
      const existing = map.get(normalized)
      if (existing) {
        existing.count += 1
      } else {
        map.set(normalized, { value: raw, normalized, count: 1 })
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.value.localeCompare(b.value)
    })
  }, [projects])

  const techOptions = useMemo<FilterOption[]>(() => {
    const normalizedCat = selectedCategory ? normalizeFilterToken(selectedCategory) : null
    const allTechs = new Map<
      string,
      { value: string; normalized: string; totalCount: number; scopedCount: number }
    >()

    if (cmsTechTags) {
      for (const tag of cmsTechTags) {
        allTechs.set(tag.normalized, {
          value: tag.label,
          normalized: tag.normalized,
          totalCount: tag.count,
          scopedCount: normalizedCat ? 0 : tag.count,
        })
      }
    }

    if (!cmsTechTags || normalizedCat) {
      for (const project of projects) {
        const matchesCategory =
          !normalizedCat ||
          (project.category ? normalizeFilterToken(project.category) === normalizedCat : false)

        const seenInProject = new Set<string>()
        for (const item of project.techStack) {
          const raw = item.trim()
          if (!raw) continue
          const normalized = normalizeFilterToken(raw)
          if (seenInProject.has(normalized)) continue
          seenInProject.add(normalized)

          const existing = allTechs.get(normalized)
          if (existing) {
            if (!cmsTechTags) existing.totalCount += 1
            if (matchesCategory && normalizedCat) existing.scopedCount += 1
          } else {
            allTechs.set(normalized, {
              value: raw,
              normalized,
              totalCount: 1,
              scopedCount: matchesCategory ? 1 : 0,
            })
          }
        }
      }
    }

    return Array.from(allTechs.values())
      .sort((a, b) => {
        if (b.scopedCount !== a.scopedCount) return b.scopedCount - a.scopedCount
        if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount
        return a.value.localeCompare(b.value)
      })
      .map((entry) => ({
        value: entry.value,
        normalized: entry.normalized,
        count: normalizedCat ? entry.scopedCount : entry.totalCount,
      }))
  }, [projects, cmsTechTags, selectedCategory])

  const hasFilterOptions = categories.length > 0 || techOptions.length > 0
  if (!projects.length || !hasFilterOptions) return null

  const normalizedSelectedCat = selectedCategory ? normalizeFilterToken(selectedCategory) : null
  const selectedTechSet = new Set(selectedTechs.map(normalizeFilterToken))

  const visibleTechs = showAllTechs
    ? techOptions
    : techOptions.filter(
        (tech, idx) => idx < DEFAULT_TECH_VISIBLE || selectedTechSet.has(tech.normalized),
      )
  const hiddenTechCount = techOptions.length - visibleTechs.length

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id="project-filters-panel"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 rounded-2xl border border-line-subtle bg-surface/85 backdrop-blur-xl p-4 sm:p-5 space-y-4"
        >
          {hasAnyActiveState && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sensoryAudio.playClick()
                  onClear()
                }}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line-subtle bg-transparent px-2.5 text-[11px] font-medium text-ink-secondary transition-colors hover:border-line-medium hover:bg-overlay hover:text-ink cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3 w-3 text-accent" aria-hidden="true" />
                <span>{uiStrings.projects.clearFilters.en}</span>
                {uiStrings.projects.clearFilters.kr && (
                  <span lang="ko" className="font-korean text-[10px] text-muted font-normal">
                    {uiStrings.projects.clearFilters.kr}
                  </span>
                )}
              </button>
            </div>
          )}

          {categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="font-mono uppercase tracking-[0.14em]">
                  {uiStrings.projects.categoryLabel.en}
                </span>
                {uiStrings.projects.categoryLabel.kr && (
                  <span lang="ko" className="font-korean text-[10px]">
                    · {uiStrings.projects.categoryLabel.kr}
                  </span>
                )}
              </div>

              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label={uiStrings.projects.categoryLabel.en}
              >
                <button
                  type="button"
                  onClick={() => {
                    sensoryAudio.playToggle()
                    onSelectCategory(null)
                  }}
                  aria-pressed={!normalizedSelectedCat}
                  className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    !normalizedSelectedCat
                      ? 'bg-ink text-inverse'
                      : 'border border-line-hairline bg-overlay-faint text-ink-secondary hover:bg-overlay hover:text-ink'
                  }`}
                >
                  <span>{uiStrings.projects.allCategories.en}</span>
                  {uiStrings.projects.allCategories.kr && (
                    <span
                      lang="ko"
                      className={`font-korean text-[10px] font-normal ${
                        !normalizedSelectedCat ? 'text-inverse/75' : 'text-muted'
                      }`}
                    >
                      {uiStrings.projects.allCategories.kr}
                    </span>
                  )}
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      !normalizedSelectedCat ? 'text-inverse/70' : 'text-muted'
                    }`}
                  >
                    {projects.length}
                  </span>
                </button>

                {categories.map((category) => {
                  const isActive = normalizedSelectedCat === category.normalized
                  return (
                    <button
                      key={category.normalized}
                      type="button"
                      onClick={() => {
                        sensoryAudio.playToggle()
                        onSelectCategory(isActive ? null : category.value)
                      }}
                      aria-pressed={isActive}
                      className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-ink text-inverse'
                          : 'border border-line-hairline bg-overlay-faint text-ink-secondary hover:bg-overlay hover:text-ink'
                      }`}
                    >
                      <span>{category.value}</span>
                      <span
                        className={`font-mono text-[10px] tabular-nums ${
                          isActive ? 'text-inverse/70' : 'text-muted'
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {techOptions.length > 0 && (
            <div
              className={`space-y-2 ${
                categories.length > 0 ? 'pt-1 border-t border-line-hairline' : ''
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-[11px] text-muted ${
                  categories.length > 0 ? 'pt-2' : ''
                }`}
              >
                <span className="font-mono uppercase tracking-[0.14em]">
                  {uiStrings.projects.techStackLabel.en}
                </span>
                {uiStrings.projects.techStackLabel.kr && (
                  <span lang="ko" className="font-korean text-[10px]">
                    · {uiStrings.projects.techStackLabel.kr}
                  </span>
                )}
              </div>

              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label={uiStrings.projects.techStackLabel.en}
              >
                {visibleTechs.map((tech) => {
                  const isSelected = selectedTechSet.has(tech.normalized)
                  const isEmptyInScope = tech.count === 0 && !isSelected

                  return (
                    <button
                      key={tech.normalized}
                      type="button"
                      onClick={() => {
                        sensoryAudio.playClick()
                        onToggleTech(tech.value)
                      }}
                      aria-pressed={isSelected}
                      className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'border border-accent bg-accent text-inverse shadow-xs'
                          : isEmptyInScope
                            ? 'border border-line-hairline bg-transparent text-muted/60 hover:border-line-subtle hover:text-ink-secondary'
                            : 'border border-line-hairline bg-overlay-faint text-ink-secondary hover:border-line-subtle hover:bg-overlay hover:text-ink'
                      }`}
                    >
                      <span>{tech.value}</span>
                      <span
                        className={`font-mono text-[10px] tabular-nums ${
                          isSelected ? 'text-inverse/75' : 'text-muted'
                        }`}
                      >
                        {tech.count}
                      </span>
                    </button>
                  )
                })}

                {hiddenTechCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sensoryAudio.playClick()
                      setShowAllTechs(true)
                    }}
                    className="inline-flex min-h-[32px] items-center rounded-full px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-overlay transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {uiStrings.projects.showMoreTech(hiddenTechCount)}
                  </button>
                )}

                {showAllTechs && techOptions.length > DEFAULT_TECH_VISIBLE && (
                  <button
                    type="button"
                    onClick={() => {
                      sensoryAudio.playClick()
                      setShowAllTechs(false)
                    }}
                    className="inline-flex min-h-[32px] items-center rounded-full px-2.5 py-1 text-[11px] font-medium text-muted hover:text-ink hover:bg-overlay transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {uiStrings.projects.showLessTech.en}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
