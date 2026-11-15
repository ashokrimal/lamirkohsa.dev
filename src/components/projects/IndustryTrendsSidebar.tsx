'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  ArrowUpRight,
  Compass,
  Globe,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import type { IndustryTrendsResponse } from '@/app/api/projects/trends/route'
import { uiStrings } from '@/lib/ui-strings'
import { sensoryAudio } from '@/lib/sensory-audio'

interface IndustryTrendsSidebarProps {
  technologies: string[]
  categories: string[]
  projectTitles: string[]
  activeFilterCount?: number
  onSelectTech?: (tech: string) => void
}

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function IndustryTrendsSidebar({
  technologies,
  categories,
  projectTitles,
  activeFilterCount = 0,
  onSelectTech,
}: IndustryTrendsSidebarProps) {
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState<IndustryTrendsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stableTechs = useMemo(() => technologies.slice(0, 12), [technologies])
  const stableCategories = useMemo(() => categories.slice(0, 6), [categories])
  const stableTitles = useMemo(() => projectTitles.slice(0, 6), [projectTitles])
  const requestSignature = useMemo(
    () => `${stableTechs.join('|')}::${stableCategories.join('|')}`,
    [stableCategories, stableTechs],
  )

  const hasInputs =
    stableTechs.length > 0 || stableCategories.length > 0 || stableTitles.length > 0

  const fetchTrends = useCallback(
    async (forceRefresh = false) => {
      if (!hasInputs) {
        setData(null)
        setError(null)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/projects/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            technologies: stableTechs,
            categories: stableCategories,
            projectTitles: stableTitles,
            forceRefresh,
          }),
        })

        const payload = (await response.json().catch(() => ({}))) as Partial<IndustryTrendsResponse> & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to load industry trends.')
        }

        setData(payload as IndustryTrendsResponse)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unable to load industry trends.')
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false)
        }
      }
    },
    [hasInputs, stableCategories, stableTechs, stableTitles],
  )

  useEffect(() => {
    void fetchTrends(false)
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchTrends, requestSignature])

  const techLookup = useMemo(() => {
    const map = new Map<string, string>()
    for (const tech of stableTechs) {
      map.set(tech.toLowerCase(), tech)
    }
    return map
  }, [stableTechs])

  const copy = uiStrings.projects.industryTrends

  return (
    <aside
      aria-label={copy.title.en}
      className="apple-card p-5 md:p-6 space-y-5 lg:sticky lg:top-28"
    >
      {/* Sidebar header */}
      <div className="flex items-start justify-between gap-3 border-b border-line-subtle pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
            <Globe className="h-3 w-3 text-accent" aria-hidden="true" />
            <span>{copy.eyebrow.en}</span>
            {copy.eyebrow.kr && (
              <span lang="ko" className="font-korean normal-case tracking-normal opacity-80">
                · {copy.eyebrow.kr}
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{copy.title.en}</span>
          </h2>

          {stableTechs.length > 0 && (
            <p className="text-[11px] text-muted leading-relaxed">
              {activeFilterCount > 0 ? 'Scoped to filter: ' : 'Tracking: '}
              <span className="text-ink-secondary">
                {stableTechs.slice(0, 4).join(', ')}
                {stableTechs.length > 4 ? ` +${stableTechs.length - 4}` : ''}
              </span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            sensoryAudio.playClick()
            void fetchTrends(true)
          }}
          disabled={isLoading || !hasInputs}
          aria-label={copy.refreshAria.en}
          title={copy.refreshAria.en}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-muted transition-colors hover:border-line-medium hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-accent' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Body states */}
      {!hasInputs ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-line-subtle bg-overlay-faint p-3.5 text-xs text-muted">
          <Compass className="h-4 w-4 shrink-0 text-accent mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{copy.emptyHint.en}</p>
        </div>
      ) : isLoading && !data ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <p className="text-[11px] font-mono text-muted">{copy.loading.en}</p>
          {[0, 1, 2].map((skeleton) => (
            <div
              key={skeleton}
              className="rounded-xl border border-line-subtle bg-overlay-faint p-3.5 space-y-2 animate-pulse"
            >
              <div className="h-2.5 w-20 rounded bg-overlay-medium" />
              <div className="h-3.5 w-3/4 rounded bg-overlay-medium" />
              <div className="h-3 w-full rounded bg-overlay" />
              <div className="h-3 w-5/6 rounded bg-overlay" />
            </div>
          ))}
        </div>
      ) : error && !data ? (
        <div
          role="alert"
          className="rounded-xl border border-line bg-overlay-faint p-4 space-y-3 text-xs"
        >
          <div className="flex items-start gap-2.5 text-ink-secondary">
            <AlertCircle className="h-4 w-4 shrink-0 text-accent mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              sensoryAudio.playClick()
              void fetchTrends(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1.5 text-[11px] font-medium text-ink transition-colors hover:border-accent hover:text-accent cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            <span>{copy.retryLabel.en}</span>
          </button>
        </div>
      ) : data ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={data.generatedAt}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: EASE_SETTLE }}
            className="space-y-4"
          >
            {data.summary && (
              <p className="text-xs leading-relaxed text-ink-secondary">{data.summary}</p>
            )}

            {data.trends.length > 0 && (
              <ul className="space-y-3">
                {data.trends.map((trend, index) => (
                  <li
                    key={`${trend.title}-${index}`}
                    className="rounded-xl border border-line-subtle bg-overlay-faint p-3.5 space-y-2 transition-colors hover:border-line-medium"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
                      <span>{trend.category}</span>
                      {trend.momentum && (
                        <span className="text-accent font-medium">{trend.momentum}</span>
                      )}
                    </div>

                    <h3 className="text-xs md:text-sm font-semibold text-ink leading-snug">
                      {trend.title}
                    </h3>

                    <p className="text-xs text-muted leading-relaxed">{trend.summary}</p>

                    {trend.relatedTo.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {trend.relatedTo.map((tech) => {
                          const matchedStackTech = techLookup.get(tech.toLowerCase())
                          const interactive = Boolean(matchedStackTech && onSelectTech)
                          return interactive ? (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => {
                                sensoryAudio.playClick()
                                if (matchedStackTech) onSelectTech?.(matchedStackTech)
                              }}
                              className="rounded-md border border-line-subtle bg-surface px-2 py-0.5 text-[10px] font-mono text-ink-secondary transition-colors hover:border-accent hover:text-accent cursor-pointer"
                              title={`Filter projects by ${matchedStackTech}`}
                            >
                              {tech}
                            </button>
                          ) : (
                            <span
                              key={tech}
                              className="rounded-md border border-line-subtle bg-surface/60 px-2 py-0.5 text-[10px] font-mono text-muted"
                            >
                              {tech}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400" role="status">
                {error}
              </p>
            )}

            {data.sources.length > 0 && (
              <div className="border-t border-line-subtle pt-3.5 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                  {copy.sourcesLabel.en}
                </p>
                <ul className="space-y-1.5">
                  {data.sources.slice(0, 4).map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-2 text-xs text-ink-secondary hover:text-accent transition-colors"
                      >
                        <span className="truncate">{source.title}</span>
                        <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-mono text-muted group-hover:text-accent">
                          <span>{source.domain}</span>
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.searchQueries.length > 0 && (
              <div className="border-t border-line-subtle pt-3 text-[10px] font-mono text-muted leading-relaxed">
                <span className="uppercase tracking-[0.14em]">{copy.queriesLabel.en}: </span>
                <span>{data.searchQueries.slice(0, 3).join(' · ')}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : null}
    </aside>
  )
}
