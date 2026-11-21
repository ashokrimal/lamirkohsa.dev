'use client'

import { useMemo, useState } from 'react'
import { arc as d3Arc, pie as d3Pie, type PieArcDatum } from 'd3'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, PieChart } from 'lucide-react'
import { normalizeFilterToken } from '@/components/ui/ProjectFilter'
import { extractProjectTechTags, type ProjectEntry } from '@/lib/projects'
import { mergeCmsTechDefinitions, resolveTechUsageMetadata } from '@/lib/tech-metadata'
import { sensoryAudio } from '@/lib/sensory-audio'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

interface TechDistributionChartProps {
  projects: ProjectEntry[]
  selectedTechs?: string[]
  onToggleTech?: (tech: string) => void
  compact?: boolean
}

interface TechSlice {
  label: string
  normalized: string
  count: number
  percentage: number
  layer: string
  description: string
  fillClass: string
  bgClass: string
  isOther?: boolean
}

const SLICE_PALETTE = [
  { fillClass: 'fill-emerald-700 dark:fill-emerald-400', bgClass: 'bg-emerald-700 dark:bg-emerald-400' },
  { fillClass: 'fill-teal-700 dark:fill-teal-400', bgClass: 'bg-teal-700 dark:bg-teal-400' },
  { fillClass: 'fill-emerald-500 dark:fill-emerald-500', bgClass: 'bg-emerald-500 dark:bg-emerald-500' },
  { fillClass: 'fill-slate-700 dark:fill-slate-300', bgClass: 'bg-slate-700 dark:bg-slate-300' },
  { fillClass: 'fill-stone-600 dark:fill-stone-400', bgClass: 'bg-stone-600 dark:bg-stone-400' },
  { fillClass: 'fill-cyan-800 dark:fill-cyan-400', bgClass: 'bg-cyan-800 dark:bg-cyan-400' },
] as const

const OTHER_SWATCH = {
  fillClass: 'fill-zinc-400 dark:fill-zinc-600',
  bgClass: 'bg-zinc-400 dark:bg-zinc-600',
} as const

const MAX_PRIMARY_SLICES = 6
const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function TechDistributionChart({
  projects,
  selectedTechs = [],
  onToggleTech,
  compact = false,
}: TechDistributionChartProps) {
  const uiStrings = useUiStrings()
  const reduceMotion = useReducedMotion()
  const [hoveredNormalized, setHoveredNormalized] = useState<string | null>(null)

  const selectedSet = useMemo(
    () => new Set(selectedTechs.map((item) => normalizeFilterToken(item))),
    [selectedTechs],
  )

  const globalTechDefinitions = useMemo(
    () => mergeCmsTechDefinitions(projects),
    [projects],
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
      const meta = resolveTechUsageMetadata(tag.label, {
        globalDefinitions: globalTechDefinitions,
      })
      return {
        label: tag.label,
        normalized: tag.normalized,
        count: tag.count,
        percentage: Math.max(1, Math.round((tag.count / usageSum) * 100)),
        layer: meta.layer || 'Engineering Tooling',
        description: meta.description,
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
        layer: 'Supporting Utilities',
        description: remainder.map((item) => item.label).slice(0, 4).join(', '),
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
  }, [projects, globalTechDefinitions, uiStrings])

  const arcs = useMemo(() => {
    if (slices.length === 0) return []
    const pieGenerator = d3Pie<TechSlice>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.025)

    const baseArc = d3Arc<PieArcDatum<TechSlice>>()
      .innerRadius(74)
      .outerRadius(108)
      .cornerRadius(4)

    const activeArc = d3Arc<PieArcDatum<TechSlice>>()
      .innerRadius(74)
      .outerRadius(116)
      .cornerRadius(5)

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
      className={compact ? 'space-y-4' : 'space-y-5'}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: EASE_SETTLE }}
    >
      {/* Unified Single Card: D3 Donut + Interactive Stack Chips */}
      <div className="apple-card p-5 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-line-hairline">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
              <PieChart className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>{copy.eyebrow.en}</span>
              {copy.eyebrow.kr && (
                <span lang="ko" className="font-korean normal-case tracking-normal opacity-80">
                  · {copy.eyebrow.kr}
                </span>
              )}
            </div>
            <h2
              id="tech-distribution-heading"
              className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-ink"
            >
              {copy.title.en}
            </h2>
          </div>

          <div className="text-[11px] font-mono text-muted shrink-0 tabular-nums">
            {uniqueTechCount} technologies · {totalUsages} usages · {copy.projectsCount(projects.length)}
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left: D3 Donut Visualization */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-[204px] h-[204px] sm:w-[228px] sm:h-[228px] flex items-center justify-center">
              <svg
                viewBox="-130 -130 260 260"
                className="w-full h-full overflow-visible"
                role="img"
                aria-label={`Donut chart showing technology distribution across ${projects.length} projects`}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={121}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2 4"
                  className="text-line"
                />
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
                      } ${isDimmed ? 'opacity-35' : 'opacity-100'}`}
                    />
                  )
                })}
              </svg>

              {/* Donut Center Readout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-9">
                {highlightedSlice ? (
                  <>
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted truncate max-w-[116px]">
                      {highlightedSlice.label}
                    </span>
                    <span className="mt-0.5 text-2xl sm:text-3xl font-semibold tracking-tight text-ink tabular-nums">
                      {highlightedSlice.percentage}%
                    </span>
                    <span className="text-[11px] text-accent font-medium tabular-nums truncate max-w-[120px]">
                      {copy.projectsCount(highlightedSlice.count)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
                      {copy.totalLabel.en}
                    </span>
                    <span className="mt-0.5 text-2xl sm:text-3xl font-semibold tracking-tight text-ink tabular-nums">
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

          {/* Right: Summary Copy + Compact Interactive Chips Inside Same Card */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted leading-relaxed">
                {copy.description.en}
              </p>

              {/* Inspected Slice Role Note */}
              <div className="min-h-[38px] pt-1 border-t border-line-hairline flex items-center">
                {highlightedSlice ? (
                  <p className="text-xs text-ink-secondary leading-snug line-clamp-2">
                    <span className="font-semibold text-ink">{highlightedSlice.layer}:</span>{' '}
                    {highlightedSlice.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted">
                    Select any core technology chip to inspect share or filter matching projects.
                  </p>
                )}
              </div>
            </div>

            {/* Compact Interactive Tech Chips */}
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Core technology distribution chips"
            >
              {slices.map((slice) => {
                const isHovered = hoveredNormalized === slice.normalized
                const isSelected = !slice.isOther && selectedSet.has(slice.normalized)
                const isEmphasized = isHovered || isSelected
                const isDimmed =
                  (hoveredNormalized !== null && !isHovered) ||
                  (hoveredNormalized === null && selectedSet.size > 0 && !isSelected)
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
                    className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-ink font-medium'
                        : isEmphasized
                          ? 'border-line-strong bg-overlay text-ink'
                          : 'border-line-subtle bg-overlay-faint text-ink-secondary hover:border-line-medium hover:text-ink'
                    } ${isDimmed ? 'opacity-50' : 'opacity-100'} ${
                      isInteractive ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${slice.bgClass}`}
                      aria-hidden="true"
                    />
                    <span className="font-medium tracking-tight">{slice.label}</span>
                    <span className="font-mono text-[11px] text-muted tabular-nums">
                      {slice.percentage}%
                    </span>
                    {isInteractive && (
                      <ArrowUpRight
                        className={`h-3 w-3 shrink-0 transition-colors ${
                          isEmphasized ? 'text-accent' : 'text-muted group-hover:text-accent'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
