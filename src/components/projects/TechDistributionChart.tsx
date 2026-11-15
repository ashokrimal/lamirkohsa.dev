'use client'

import { useMemo, useState } from 'react'
import { arc as d3Arc, pie as d3Pie, type PieArcDatum } from 'd3'
import { motion, useReducedMotion } from 'framer-motion'
import { PieChart } from 'lucide-react'
import { normalizeFilterToken } from '@/components/ui/ProjectFilter'
import { extractProjectTechTags, type ProjectEntry } from '@/lib/projects'
import { sensoryAudio } from '@/lib/sensory-audio'
import { uiStrings } from '@/lib/ui-strings'

interface TechDistributionChartProps {
  projects: ProjectEntry[]
  selectedTechs?: string[]
  onToggleTech?: (tech: string) => void
}

interface TechSlice {
  label: string
  normalized: string
  count: number
  percentage: number
  fillClass: string
  bgClass: string
  isOther?: boolean
}

const SLICE_PALETTE = [
  { fillClass: 'fill-emerald-600 dark:fill-emerald-400', bgClass: 'bg-emerald-600 dark:bg-emerald-400' },
  { fillClass: 'fill-teal-600 dark:fill-teal-400', bgClass: 'bg-teal-600 dark:bg-teal-400' },
  { fillClass: 'fill-slate-600 dark:fill-slate-400', bgClass: 'bg-slate-600 dark:bg-slate-400' },
  { fillClass: 'fill-amber-600 dark:fill-amber-400', bgClass: 'bg-amber-600 dark:bg-amber-400' },
  { fillClass: 'fill-sky-600 dark:fill-sky-400', bgClass: 'bg-sky-600 dark:bg-sky-400' },
  { fillClass: 'fill-indigo-600 dark:fill-indigo-400', bgClass: 'bg-indigo-600 dark:bg-indigo-400' },
  { fillClass: 'fill-stone-500 dark:fill-stone-400', bgClass: 'bg-stone-500 dark:bg-stone-400' },
] as const

const OTHER_SWATCH = {
  fillClass: 'fill-zinc-400 dark:fill-zinc-600',
  bgClass: 'bg-zinc-400 dark:bg-zinc-600',
} as const

const MAX_PRIMARY_SLICES = 7
const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function TechDistributionChart({
  projects,
  selectedTechs = [],
  onToggleTech,
}: TechDistributionChartProps) {
  const reduceMotion = useReducedMotion()
  const [hoveredNormalized, setHoveredNormalized] = useState<string | null>(null)

  const selectedSet = useMemo(
    () => new Set(selectedTechs.map((item) => normalizeFilterToken(item))),
    [selectedTechs],
  )

  const { slices, totalUsages, uniqueTechCount } = useMemo(() => {
    const tags = extractProjectTechTags(projects)
    const usageSum = tags.reduce((acc, item) => acc + item.count, 0)
    if (usageSum === 0) {
      return { slices: [] as TechSlice[], totalUsages: 0, uniqueTechCount: 0 }
    }

    const primary = tags.slice(0, MAX_PRIMARY_SLICES)
    const remainder = tags.slice(MAX_PRIMARY_SLICES)

    const computed: TechSlice[] = primary.map((tag, index) => {
      const palette = SLICE_PALETTE[index % SLICE_PALETTE.length]
      return {
        label: tag.label,
        normalized: tag.normalized,
        count: tag.count,
        percentage: Math.round((tag.count / usageSum) * 100),
        fillClass: palette.fillClass,
        bgClass: palette.bgClass,
      }
    })

    if (remainder.length > 0) {
      const otherCount = remainder.reduce((acc, item) => acc + item.count, 0)
      computed.push({
        label: `${uiStrings.projects.distribution.otherLabel.en} (${remainder.length})`,
        normalized: '__other__',
        count: otherCount,
        percentage: Math.max(1, Math.round((otherCount / usageSum) * 100)),
        fillClass: OTHER_SWATCH.fillClass,
        bgClass: OTHER_SWATCH.bgClass,
        isOther: true,
      })
    }

    return {
      slices: computed,
      totalUsages: usageSum,
      uniqueTechCount: tags.length,
    }
  }, [projects])

  const arcs = useMemo(() => {
    if (slices.length === 0) return []
    const pieGenerator = d3Pie<TechSlice>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.028)

    const baseArc = d3Arc<PieArcDatum<TechSlice>>()
      .innerRadius(74)
      .outerRadius(112)
      .cornerRadius(5)

    const activeArc = d3Arc<PieArcDatum<TechSlice>>()
      .innerRadius(74)
      .outerRadius(120)
      .cornerRadius(6)

    return pieGenerator(slices).map((datum) => ({
      datum,
      defaultPath: baseArc(datum) ?? '',
      activePath: activeArc(datum) ?? '',
    }))
  }, [slices])

  if (slices.length === 0) return null

  const highlightedSlice =
    slices.find((slice) => slice.normalized === hoveredNormalized) ??
    slices.find((slice) => !slice.isOther && selectedSet.has(slice.normalized)) ??
    null

  const copy = uiStrings.projects.distribution

  return (
    <motion.section
      aria-labelledby="tech-distribution-heading"
      className="apple-card p-6 md:p-8"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: EASE_SETTLE }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line-subtle pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
            <PieChart className="h-3 w-3 text-accent" aria-hidden="true" />
            <span>{copy.eyebrow.en}</span>
            {copy.eyebrow.kr && (
              <span lang="ko" className="font-korean normal-case tracking-normal opacity-80">
                · {copy.eyebrow.kr}
              </span>
            )}
          </div>
          <h2
            id="tech-distribution-heading"
            className="text-xl md:text-2xl font-semibold tracking-tight text-ink"
          >
            {copy.title.en}
          </h2>
          <p className="text-xs md:text-sm text-muted leading-relaxed">{copy.description.en}</p>
        </div>

        <div className="text-[11px] font-mono text-muted shrink-0 tabular-nums">
          {uniqueTechCount} stack tags · {totalUsages} usages across {projects.length} projects
        </div>
      </div>

      <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* D3 Donut Visualization */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-[260px] h-[260px] flex items-center justify-center">
            <svg
              viewBox="-132 -132 264 264"
              className="w-full h-full overflow-visible"
              role="img"
              aria-label={`Donut chart showing technology distribution across ${projects.length} projects`}
            >
              {arcs.map(({ datum, defaultPath, activePath }) => {
                const slice = datum.data
                const isHovered = hoveredNormalized === slice.normalized
                const isSelected = !slice.isOther && selectedSet.has(slice.normalized)
                const isEmphasized = isHovered || isSelected
                const isDimmed =
                  (hoveredNormalized !== null && !isHovered) ||
                  (hoveredNormalized === null && selectedSet.size > 0 && !isSelected)
                const isInteractive = Boolean(!slice.isOther && onToggleTech)

                return (
                  <path
                    key={slice.normalized}
                    d={isEmphasized ? activePath : defaultPath}
                    tabIndex={isInteractive ? 0 : -1}
                    role={isInteractive ? 'button' : undefined}
                    aria-pressed={isInteractive ? isSelected : undefined}
                    aria-label={`${slice.label}: ${copy.projectsCount(slice.count)} (${slice.percentage}%)`}
                    onMouseEnter={() => setHoveredNormalized(slice.normalized)}
                    onMouseLeave={() => setHoveredNormalized(null)}
                    onFocus={() => setHoveredNormalized(slice.normalized)}
                    onBlur={() => setHoveredNormalized(null)}
                    onClick={() => {
                      if (!isInteractive) return
                      sensoryAudio.playClick()
                      onToggleTech?.(slice.label)
                    }}
                    onKeyDown={(event) => {
                      if (!isInteractive) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        sensoryAudio.playClick()
                        onToggleTech?.(slice.label)
                      }
                    }}
                    className={`${slice.fillClass} transition-all duration-200 focus:outline-none ${
                      isInteractive ? 'cursor-pointer' : 'cursor-default'
                    } ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
                  />
                )
              })}
            </svg>

            {/* Donut Center Readout */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-10">
              {highlightedSlice ? (
                <>
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted truncate max-w-[120px]">
                    {highlightedSlice.label}
                  </span>
                  <span className="mt-0.5 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                    {highlightedSlice.percentage}%
                  </span>
                  <span className="text-[11px] text-accent font-medium tabular-nums">
                    {copy.projectsCount(highlightedSlice.count)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
                    {copy.totalLabel.en}
                  </span>
                  <span className="mt-0.5 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                    {uniqueTechCount}
                  </span>
                  <span className="text-[11px] text-muted tabular-nums">
                    {copy.projectsCount(projects.length)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Legend */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {slices.map((slice) => {
            const isHovered = hoveredNormalized === slice.normalized
            const isSelected = !slice.isOther && selectedSet.has(slice.normalized)
            const isInteractive = Boolean(!slice.isOther && onToggleTech)

            return (
              <button
                key={slice.normalized}
                type="button"
                disabled={!isInteractive}
                onMouseEnter={() => setHoveredNormalized(slice.normalized)}
                onMouseLeave={() => setHoveredNormalized(null)}
                onFocus={() => setHoveredNormalized(slice.normalized)}
                onBlur={() => setHoveredNormalized(null)}
                onClick={() => {
                  if (!isInteractive) return
                  sensoryAudio.playClick()
                  onToggleTech?.(slice.label)
                }}
                aria-pressed={isInteractive ? isSelected : undefined}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-accent bg-overlay-medium text-ink'
                    : isHovered
                      ? 'border-line-medium bg-overlay-faint text-ink'
                      : 'border-line-subtle bg-overlay-faint/60 text-ink-secondary'
                } ${isInteractive ? 'cursor-pointer hover:border-line-medium' : 'cursor-default opacity-80'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${slice.bgClass}`}
                    aria-hidden="true"
                  />
                  <span className="truncate text-xs font-medium text-ink">{slice.label}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono tabular-nums">
                  <span className="text-muted">{slice.count}</span>
                  <span className="text-ink-secondary font-medium w-9 text-right">
                    {slice.percentage}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
