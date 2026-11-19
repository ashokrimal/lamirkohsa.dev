'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Github,
  Layers,
  X,
} from 'lucide-react'
import type { ProjectData } from '@/components/ui/ProjectCard'
import { TechStack } from '@/components/ui/TechStack'
import type { ProjectEntry } from '@/lib/projects'
import type { CmsTechDefinition } from '@/lib/tech-metadata'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'
import { uiStrings } from '@/lib/ui-strings'
import { isRepositoryUrl } from '@/lib/urls'

export type QuickViewProject = ProjectData & Partial<Omit<ProjectEntry, 'id' | 'phases'>>

interface ProjectQuickViewDrawerProps {
  project: QuickViewProject | null
  globalTechDefinitions?: Record<string, CmsTechDefinition>
  onClose: () => void
}

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function ProjectQuickViewDrawer({
  project,
  globalTechDefinitions,
  onClose,
}: ProjectQuickViewDrawerProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!project) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 30)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus?.()
    }
  }, [onClose, project])

  if (!mounted) return null

  const detailHref = project ? `/projects/${project.slug || toSlug(project.title)}` : '/projects'
  const sourceUrl = project && isRepositoryUrl(project.github) ? project.github : undefined
  const summaryText = project ? project.summary || project.description : undefined

  return createPortal(
    <AnimatePresence>
      {project && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {/* Scrim Backdrop */}
          <motion.div
            key="quick-view-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.24 }}
            onClick={() => {
              sensoryAudio.playClick()
              onClose()
            }}
            className="fixed inset-0 bg-scrim/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-Over Panel */}
          <motion.div
            key={project.slug || project.id || project.title}
            initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: reduceMotion ? 0.12 : 0.34, ease: EASE_SETTLE }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-line bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-6 py-5">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono text-muted">
                  {project.category && (
                    <span className="uppercase tracking-[0.16em] text-accent">
                      {project.category}
                    </span>
                  )}
                  {project.completionDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-accent" aria-hidden="true" />
                      {project.completionDate}
                    </span>
                  )}
                  {project.status && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      · {project.status}
                    </span>
                  )}
                </div>

                <h2
                  id={titleId}
                  className="text-xl md:text-2xl font-semibold tracking-tight text-ink leading-snug"
                >
                  {project.title}
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  sensoryAudio.playClick()
                  onClose()
                }}
                aria-label={uiStrings.project.closeQuickView.en}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-muted transition-colors hover:border-line-medium hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {project.image && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line-subtle bg-overlay-faint">
                  <Image
                    src={project.image}
                    alt={project.altText || uiStrings.project.previewAlt(project.title)}
                    fill
                    sizes="(max-width: 640px) 100vw, 540px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
              )}

              {summaryText && (
                <p className="text-sm leading-relaxed text-ink-secondary">{summaryText}</p>
              )}

              {/* Quick Metadata Strip */}
              {(project.duration || project.model || project.cost) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl border border-line-subtle bg-overlay-faint p-4 text-xs">
                  {project.duration && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3 text-accent" aria-hidden="true" />
                        Duration
                      </span>
                      <p className="font-medium text-ink">{project.duration}</p>
                    </div>
                  )}
                  {project.model && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted">
                        Engagement
                      </span>
                      <p className="font-medium text-ink">{project.model}</p>
                    </div>
                  )}
                  {project.cost && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted">
                        Project cost
                      </span>
                      <p className="font-medium text-ink">{project.cost}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Challenge & Solution */}
              {(project.challenge || project.solution) && (
                <div className="grid grid-cols-1 gap-3.5">
                  {project.challenge && (
                    <div className="rounded-2xl border border-line-subtle bg-overlay-faint p-4 space-y-1.5">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                        Challenge
                      </h3>
                      <p className="text-xs md:text-sm text-ink-secondary leading-relaxed">
                        {project.challenge}
                      </p>
                    </div>
                  )}
                  {project.solution && (
                    <div className="rounded-2xl border border-line-subtle bg-overlay-faint p-4 space-y-1.5">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                        Solution
                      </h3>
                      <p className="text-xs md:text-sm text-ink-secondary leading-relaxed">
                        {project.solution}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Key Features */}
              {project.features && project.features.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                    Core Capabilities
                  </h3>
                  <ul className="space-y-2">
                    {project.features.slice(0, 5).map((feature, idx) => (
                      <li
                        key={`${feature}-${idx}`}
                        className="flex items-start gap-2.5 text-xs md:text-sm text-ink-secondary leading-relaxed"
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-accent mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Execution Phases */}
              {project.phases && project.phases.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                    <Layers className="h-3 w-3 text-accent" aria-hidden="true" />
                    <span>{uiStrings.project.executionPhases(project.phases.length)}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.phases.slice(0, 4).map((phase, idx) => (
                      <div
                        key={`${phase.name}-${idx}`}
                        className="rounded-xl border border-line-subtle bg-overlay-faint px-3.5 py-2.5 text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted">
                          <span>{phase.phase || `Phase ${idx + 1}`}</span>
                          {phase.completed && (
                            <span className="text-emerald-600 dark:text-emerald-400">Done</span>
                          )}
                        </div>
                        <p className="font-medium text-ink leading-snug">{phase.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                    Technology Stack
                  </h3>
                  <TechStack
                    items={project.techStack}
                    limit={12}
                    definitions={project.techDefinitions}
                    globalDefinitions={globalTechDefinitions}
                    projectTitle={project.title}
                    projectCategory={project.category}
                  />
                </div>
              )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="border-t border-line-subtle bg-surface px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {project.live && project.live !== '#' && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sensoryAudio.playClick()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-overlay px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-overlay-medium"
                  >
                    <span>{uiStrings.project.liveDemo.en}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}

                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sensoryAudio.playClick()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-overlay px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-overlay-medium"
                  >
                    <Github className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                    <span>{uiStrings.project.code.en}</span>
                  </a>
                )}
              </div>

              <Link
                href={detailHref}
                onClick={() => {
                  sensoryAudio.playClick()
                  onClose()
                }}
                className="apple-btn-primary !py-2 !px-4 !text-xs"
              >
                <span>{uiStrings.project.viewCaseStudy.en}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
