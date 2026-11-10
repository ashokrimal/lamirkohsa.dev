'use client'

import React, { useState } from 'react'
import { Calendar, CheckCircle2, ChevronRight, Clock, GitCommit, Layers, ArrowUpRight } from 'lucide-react'

export interface ProjectPhase {
  phase?: string
  name: string
  period?: string
  description?: string
  completed?: boolean
}

export interface TimelineProject {
  title: string
  category?: string
  completionDate?: string
  period?: string
  status?: string
  phases?: ProjectPhase[]
  github?: string
  live?: string
}

interface ProjectsTimelineProps {
  projects: TimelineProject[]
  activeProjectTitle?: string
  onSelectProject?: (title: string) => void
}

export function ProjectsTimeline({
  projects,
  activeProjectTitle,
  onSelectProject,
}: ProjectsTimelineProps) {
  const [expandedProject, setExpandedProject] = useState<string>(
    activeProjectTitle || projects[0]?.title || ''
  )

  const selected = projects.find((p) => p.title.trim() === expandedProject.trim()) || projects[0]

  return (
    <section className="my-8 rounded-sm border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Chronology &amp; Execution
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-normal tracking-[-0.04em] text-[var(--ink)]">
            Project Phases &amp; <span className="text-[var(--accent)]">Milestones.</span>
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-[var(--muted)] max-w-xl leading-relaxed">
            A chronological timeline documenting research, architecture, core implementation, and production completion dates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>2024 Development Roadmap</span>
        </div>
      </div>

      {/* Horizontal Milestone Ribbon */}
      <div className="py-6 overflow-x-auto">
        <div className="min-w-[620px] relative">
          {/* Milestone connecting bar */}
          <div className="absolute top-5 left-8 right-8 h-[2px] bg-[var(--line)] z-0" />

          {/* Project Milestone Nodes */}
          <div className="grid grid-cols-4 gap-4 relative z-10">
            {projects.map((proj, idx) => {
              const isSelected = expandedProject.trim() === proj.title.trim()
              return (
                <button
                  key={proj.title}
                  type="button"
                  onClick={() => {
                    setExpandedProject(proj.title)
                    onSelectProject?.(proj.title)
                  }}
                  className={`flex flex-col items-center text-center p-3 rounded-sm transition-all text-left group ${
                    isSelected
                      ? 'bg-[var(--accent-soft)]/60 border border-[var(--accent)] shadow-2xs'
                      : 'hover:bg-[var(--paper)] border border-transparent'
                  }`}
                >
                  {/* Indicator Dot */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-transform duration-200 ${
                      isSelected
                        ? 'bg-[var(--accent)] text-inverse scale-110 shadow-xs'
                        : 'bg-[var(--surface)] border-2 border-[var(--line)] text-[var(--muted)] group-hover:border-[var(--accent)]'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  <span className="mt-3 text-xs font-semibold text-[var(--ink)] leading-tight group-hover:text-[var(--accent)] transition-colors">
                    {proj.title}
                  </span>

                  {proj.completionDate && (
                    <span className="mt-1 text-[10px] font-mono text-[var(--muted)]">
                      {proj.completionDate}
                    </span>
                  )}

                  {proj.status && (
                    <span className="mt-1 text-[9px] uppercase tracking-wider font-semibold text-[var(--accent)] bg-surface px-2 py-0.5 rounded-xs border border-[var(--line)]">
                      {proj.status}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expanded Project Phases Breakdown Panel */}
      {selected && (
        <div className="mt-4 pt-6 border-t border-[var(--line)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-xs bg-[var(--accent-soft)] text-[var(--accent)]">
                  {selected.category} Case Study
                </span>
                {selected.period && (
                  <span className="text-xs text-[var(--muted)] font-mono">
                    {selected.period}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-lg font-normal text-[var(--ink)]">
                {selected.title} — <span className="text-[var(--accent)]">Execution Phases</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {selected.completionDate && (
                <span className="text-xs text-[var(--muted)] font-medium">
                  Completion: <strong className="text-[var(--ink)]">{selected.completionDate}</strong>
                </span>
              )}
              {selected.live && selected.live !== '#' && (
                <a
                  href={selected.live}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Live Product <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* 4 Phases Flow Grid */}
          {selected.phases && selected.phases.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selected.phases.map((ph, pIdx) => (
                <div
                  key={ph.phase}
                  className="p-4 rounded-sm border border-[var(--line)] bg-[var(--paper)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                        {ph.phase}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--ink)] leading-snug">
                      {ph.name}
                    </h4>
                    <p className="mt-2 text-[11px] text-[var(--muted)] leading-relaxed">
                      {ph.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[var(--line)]/60 flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
                    <span>{ph.period}</span>
                    <span className="text-[var(--accent)] font-semibold">Done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
