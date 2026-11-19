'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarRange, CheckCircle2, Circle } from 'lucide-react'
import type { ProjectGanttTimeline } from '@/lib/projects'

interface ProjectGanttChartProps {
  gantt: ProjectGanttTimeline
  projectTitle: string
}

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function ProjectGanttChart({ gantt, projectTitle }: ProjectGanttChartProps) {
  const reduceMotion = useReducedMotion()
  const [selectedId, setSelectedId] = useState<string>(gantt.tracks[0]?.id ?? '')

  if (!gantt.tracks.length) return null

  const activeTrack =
    gantt.tracks.find((track) => track.id === selectedId) ?? gantt.tracks[0]
  const completedCount = gantt.tracks.filter((track) => track.completed).length

  return (
    <section
      aria-label={`${projectTitle} execution Gantt chart`}
      className="mt-8 apple-card p-5 sm:p-6 md:p-7 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <CalendarRange className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Execution schedule (Gantt)</span>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-ink tracking-tight">
            Phase timeline &amp; delivery cadence
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted tabular-nums">
          <span>
            {gantt.totalWeeks} weeks · {completedCount}/{gantt.tracks.length} completed
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent" aria-hidden="true" />
              <span>Completed</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm border border-accent/60 bg-accent/25"
                aria-hidden="true"
              />
              <span>In progress / planned</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Gantt Grid */}
      <div className="rounded-xl border border-line-hairline bg-overlay-faint/60 overflow-hidden">
        {/* Timeline Scale Header */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] border-b border-line-hairline bg-surface/60">
          <div className="px-4 py-2.5 text-[11px] font-mono uppercase tracking-[0.12em] text-muted">
            Workstream
          </div>
          <div className="hidden md:flex items-center justify-between px-4 py-2.5 border-l border-line-hairline text-[11px] font-mono text-muted tabular-nums">
            {gantt.ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>

        {/* Track Rows */}
        <div className="divide-y divide-line-hairline">
          {gantt.tracks.map((track, idx) => {
            const isActive = track.id === activeTrack?.id
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedId(track.id)}
                onMouseEnter={() => setSelectedId(track.id)}
                className={`w-full text-left grid grid-cols-1 md:grid-cols-[220px_1fr] items-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                  isActive ? 'bg-overlay' : 'hover:bg-overlay-hairline'
                }`}
                aria-pressed={isActive}
              >
                {/* Phase Label */}
                <div className="px-4 py-3 flex items-center justify-between gap-2 md:block">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
                      <span>{track.phaseLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{track.period}</span>
                    </div>
                    <p
                      className={`mt-0.5 text-xs sm:text-sm font-medium truncate ${
                        isActive ? 'text-accent' : 'text-ink'
                      }`}
                    >
                      {track.name}
                    </p>
                  </div>
                  <span className="md:hidden shrink-0">
                    {track.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                    )}
                  </span>
                </div>

                {/* Gantt Bar Track */}
                <div className="relative px-4 pb-3 pt-1 md:py-3.5 md:border-l md:border-line-hairline">
                  {/* Subtle vertical grid guides matching ticks */}
                  <div
                    className="pointer-events-none absolute inset-y-0 inset-x-4 hidden md:flex justify-between"
                    aria-hidden="true"
                  >
                    {gantt.ticks.map((tick) => (
                      <span key={tick} className="w-px h-full bg-line-hairline/70" />
                    ))}
                  </div>

                  {/* Bar Rail */}
                  <div className="relative h-6 w-full rounded-md bg-overlay-hairline/80 overflow-hidden">
                    <motion.div
                      initial={reduceMotion ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        duration: reduceMotion ? 0.05 : 0.45,
                        delay: reduceMotion ? 0 : idx * 0.06,
                        ease: EASE_SETTLE,
                      }}
                      style={{
                        left: `${track.startPct}%`,
                        width: `${track.widthPct}%`,
                        transformOrigin: 'left center',
                      }}
                      className={`absolute inset-y-1 rounded-[5px] flex items-center justify-between px-2 text-[10px] font-mono tabular-nums transition-opacity ${
                        track.completed
                          ? 'bg-accent text-white shadow-xs'
                          : 'border border-dashed border-accent/70 bg-accent/20 text-ink'
                      } ${isActive ? 'opacity-100 ring-1 ring-accent/40' : 'opacity-90'}`}
                    >
                      <span className="truncate font-medium">
                        {track.durationWeeks}w
                      </span>
                    </motion.div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Milestone Inspector */}
      {activeTrack && (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line-hairline bg-surface/80 px-4 py-3.5 text-xs"
          aria-live="polite"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-accent font-medium">
                {activeTrack.phaseLabel}
              </span>
              <span aria-hidden="true" className="text-muted">·</span>
              <span className="font-semibold text-ink">{activeTrack.name}</span>
              <span aria-hidden="true" className="text-muted">·</span>
              <span className="font-mono text-muted tabular-nums">
                {activeTrack.period}
              </span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              {activeTrack.description}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted shrink-0">
            {activeTrack.completed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span className="text-ink">Delivered</span>
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                <span>Planned</span>
              </>
            )}
          </span>
        </div>
      )}
    </section>
  )
}
