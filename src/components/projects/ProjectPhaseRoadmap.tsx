'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Layers,
  RotateCcw,
  X,
} from 'lucide-react'
import type { ProjectPhase } from '@/lib/projects'
import { sensoryAudio } from '@/lib/sensory-audio'

type PhaseVisibilityFilter = 'all' | 'completed' | 'planned'

interface ProjectPhaseRoadmapProps {
  phases: ProjectPhase[]
  projectTitle: string
  headingTitle?: string
}

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function ProjectPhaseRoadmap({
  phases,
  projectTitle,
  headingTitle = 'Phase-by-phase execution roadmap',
}: ProjectPhaseRoadmapProps) {
  const reduceMotion = useReducedMotion()
  const [filter, setFilter] = useState<PhaseVisibilityFilter>('all')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(phases.length > 0 ? 0 : null)

  const indexedPhases = useMemo(
    () =>
      phases.map((phase, originalIndex) => ({
        phase,
        originalIndex,
        isCompleted: Boolean(phase.completed),
        label: phase.phase?.trim() || `Phase ${originalIndex + 1}`,
      })),
    [phases],
  )

  const completedCount = useMemo(
    () => indexedPhases.filter((item) => item.isCompleted).length,
    [indexedPhases],
  )
  const plannedCount = indexedPhases.length - completedCount
  const completionPct =
    indexedPhases.length > 0 ? Math.round((completedCount / indexedPhases.length) * 100) : 0

  const visiblePhases = useMemo(() => {
    if (filter === 'completed') return indexedPhases.filter((item) => item.isCompleted)
    if (filter === 'planned') return indexedPhases.filter((item) => !item.isCompleted)
    return indexedPhases
  }, [filter, indexedPhases])

  const activeEntry = useMemo(() => {
    if (selectedIndex === null) return null
    return visiblePhases.find((item) => item.originalIndex === selectedIndex) ?? null
  }, [selectedIndex, visiblePhases])

  const activeVisiblePosition = activeEntry
    ? visiblePhases.findIndex((item) => item.originalIndex === activeEntry.originalIndex)
    : -1

  if (phases.length === 0) return null

  const filterOptions: Array<{
    id: PhaseVisibilityFilter
    label: string
    count: number
  }> = [
    { id: 'all', label: 'All phases', count: indexedPhases.length },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'planned', label: 'Planned', count: plannedCount },
  ]

  const handleFilterChange = (nextFilter: PhaseVisibilityFilter) => {
    if (nextFilter === filter) return
    sensoryAudio.playClick()
    setFilter(nextFilter)

    const nextVisible =
      nextFilter === 'completed'
        ? indexedPhases.filter((item) => item.isCompleted)
        : nextFilter === 'planned'
          ? indexedPhases.filter((item) => !item.isCompleted)
          : indexedPhases

    if (
      selectedIndex !== null &&
      !nextVisible.some((item) => item.originalIndex === selectedIndex)
    ) {
      setSelectedIndex(nextVisible[0]?.originalIndex ?? null)
    }
  }

  const handlePhaseClick = (originalIndex: number) => {
    sensoryAudio.playClick()
    setSelectedIndex((current) => (current === originalIndex ? null : originalIndex))
  }

  const stepPhase = (delta: -1 | 1) => {
    if (visiblePhases.length === 0 || activeVisiblePosition === -1) return
    const nextPos =
      (activeVisiblePosition + delta + visiblePhases.length) % visiblePhases.length
    sensoryAudio.playClick()
    setSelectedIndex(visiblePhases[nextPos].originalIndex)
  }

  return (
    <div className="mt-8 space-y-5">
      {/* Header & Interactive Visibility Toggles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-ink tracking-tight">{headingTitle}</h3>
          <p className="text-xs text-muted tabular-nums">
            {completedCount} of {indexedPhases.length} phases completed ({completionPct}%) · Click
            any phase to inspect details
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter roadmap phases by status"
          className="inline-flex items-center gap-1 rounded-xl border border-line-subtle bg-overlay-faint p-1 self-start sm:self-auto"
        >
          {filterOptions.map((option) => {
            const isSelected = filter === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleFilterChange(option.id)}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="roadmap-filter-indicator"
                    transition={
                      reduceMotion
                        ? { duration: 0.08 }
                        : { type: 'spring', stiffness: 420, damping: 32 }
                    }
                    className="absolute inset-0 rounded-lg bg-surface shadow-xs border border-line-subtle"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{option.label}</span>
                <span className="relative z-10 font-mono text-[11px] text-muted tabular-nums">
                  {option.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Overall Milestone Completion Progress Track */}
      <div
        className="apple-card px-4 py-3 flex items-center gap-4"
        aria-label={`${completionPct}% of ${projectTitle} roadmap phases completed`}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-ink shrink-0">
          <Layers className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="hidden sm:inline">Roadmap progress</span>
        </div>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-overlay-medium">
          <motion.div
            initial={false}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: reduceMotion ? 0.08 : 0.45, ease: EASE_SETTLE }}
            className="h-full rounded-full bg-accent"
          />
        </div>
        <span className="font-mono text-xs font-medium text-ink tabular-nums shrink-0">
          {completionPct}%
        </span>
      </div>

      {/* Clickable Phase Grid */}
      <AnimatePresence mode="popLayout" initial={false}>
        {visiblePhases.length > 0 ? (
          <motion.div
            key={`roadmap-grid-${filter}`}
            layout={!reduceMotion}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {visiblePhases.map((entry, visibleIdx) => {
              const isSelected = activeEntry?.originalIndex === entry.originalIndex
              return (
                <motion.button
                  key={`${entry.phase.name}-${entry.originalIndex}`}
                  type="button"
                  layout={!reduceMotion}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  transition={{
                    duration: reduceMotion ? 0.1 : 0.24,
                    delay: reduceMotion ? 0 : Math.min(visibleIdx * 0.03, 0.12),
                    ease: EASE_SETTLE,
                    layout: { duration: 0.25, ease: EASE_SETTLE },
                  }}
                  onClick={() => handlePhaseClick(entry.originalIndex)}
                  aria-expanded={isSelected}
                  className={`apple-card text-left p-5 flex flex-col justify-between gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'border-accent/60 bg-overlay-faint ring-1 ring-accent/30'
                      : 'hover:border-line-medium'
                  }`}
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-muted tabular-nums">{entry.label}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          entry.isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted'
                        }`}
                      >
                        {entry.isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>Planned</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-ink tracking-tight leading-snug">
                      {entry.phase.name}
                    </h4>

                    {entry.phase.description && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">
                        {entry.phase.description}
                      </p>
                    )}
                  </div>

                  <div className="w-full pt-2.5 border-t border-line-hairline flex items-center justify-between gap-2 text-[11px] font-mono text-muted tabular-nums">
                    <span>{entry.phase.period || `Milestone ${entry.originalIndex + 1}`}</span>
                    <span className="text-accent font-sans font-medium">
                      {isSelected ? 'Viewing' : 'Inspect'}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key={`roadmap-empty-${filter}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: EASE_SETTLE }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-medium px-6 py-10 text-center"
            role="status"
          >
            <p className="text-sm font-medium text-ink">
              No {filter === 'planned' ? 'planned' : 'completed'} phases in this roadmap.
            </p>
            <p className="text-xs text-muted">
              {filter === 'planned'
                ? `All ${indexedPhases.length} phases for ${projectTitle} have been completed.`
                : 'Completed milestones will appear here as phases finish.'}
            </p>
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/85 px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-medium hover:text-accent cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>Show all phases</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Phase Inspection Drawer */}
      <AnimatePresence mode="wait" initial={false}>
        {activeEntry && (
          <motion.div
            key={`phase-detail-${activeEntry.originalIndex}-${filter}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.24, ease: EASE_SETTLE }}
            className="apple-card p-5 md:p-6 space-y-4 border-line-medium"
            role="region"
            aria-label={`${activeEntry.label}: ${activeEntry.phase.name}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
                  <span className="font-mono font-medium text-accent tabular-nums">
                    {activeEntry.label}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      activeEntry.isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-ink-secondary'
                    }`}
                  >
                    {activeEntry.isCompleted ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Completed milestone</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        <span>Planned milestone</span>
                      </>
                    )}
                  </span>
                  {activeEntry.phase.period && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{activeEntry.phase.period}</span>
                    </>
                  )}
                </div>
                <h4 className="text-base md:text-lg font-semibold text-ink tracking-tight">
                  {activeEntry.phase.name}
                </h4>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {visiblePhases.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => stepPhase(-1)}
                      aria-label="Previous phase"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-muted transition-colors hover:border-line-medium hover:text-ink cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepPhase(1)}
                      aria-label="Next phase"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-muted transition-colors hover:border-line-medium hover:text-ink cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sensoryAudio.playClick()
                    setSelectedIndex(null)
                  }}
                  aria-label="Close phase details"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-muted transition-colors hover:border-line-medium hover:text-ink cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <p className="text-sm text-ink-secondary leading-relaxed">
              {activeEntry.phase.description ||
                `Executed ${activeEntry.phase.name.toLowerCase()} deliverables during step ${
                  activeEntry.originalIndex + 1
                } of ${indexedPhases.length} for ${projectTitle}.`}
            </p>

            <div className="pt-3 border-t border-line-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-muted tabular-nums">
              <span>
                Step {activeEntry.originalIndex + 1} of {indexedPhases.length} in build sequence
              </span>
              {visiblePhases.length > 1 && (
                <span className="font-mono text-[11px]">
                  Showing {activeVisiblePosition + 1} / {visiblePhases.length} in current view
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
