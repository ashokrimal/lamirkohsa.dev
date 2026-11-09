'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ArrowUpRight, Github, Calendar, CheckCircle2, Layers, Check } from 'lucide-react'
import type { ProjectData } from '@/components/ui/ProjectCard'

interface ProjectQuickViewModalProps {
  project: ProjectData | null
  onClose: () => void
}

export function ProjectQuickViewModal({ project, onClose }: ProjectQuickViewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (project) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [project, onClose])

  if (!project) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-[var(--line)] bg-[var(--surface)] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono">
              {project.category && (
                <span className="px-2 py-0.5 rounded-xs bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)] font-semibold text-[10px] uppercase">
                  {project.category}
                </span>
              )}
              {project.status && (
                <span className="text-[10px] text-[var(--muted)]">
                  • {project.status}
                </span>
              )}
              {project.completionDate && (
                <span className="text-[10px] text-[var(--muted)] flex items-center gap-1 ml-auto sm:ml-2">
                  <Calendar className="w-3 h-3 text-[var(--accent)]" />
                  {project.completionDate}
                </span>
              )}
            </div>
            <h2 id="modal-title" className="text-2xl sm:text-3xl font-normal text-[var(--ink)] tracking-[-0.04em]">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xs border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero image if present */}
        {project.image && (
          <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden bg-[var(--paper)] border border-[var(--line)]">
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
        )}

        {/* Challenge & Solution Architecture (Inspiration: worksruthi.com & aimane.dev) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-xs border border-[var(--line)] bg-[var(--paper)] space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] font-semibold">
              The Challenge
            </span>
            <p className="text-[var(--ink)]">
              {project.challenge || project.description || 'Solving real-world performance, usability, and workflow friction through engineering.'}
            </p>
          </div>

          <div className="p-4 rounded-xs border border-[var(--line)] bg-[var(--paper)] space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
              The Architecture Solution
            </span>
            <p className="text-[var(--ink)]">
              {project.solution || project.summary || 'Engineered modular components, reliable state synchronization, and low-latency interaction pipelines.'}
            </p>
          </div>
        </div>

        {/* Execution Timeline Phases */}
        {project.phases && project.phases.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[var(--line)]">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-[var(--muted)] tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Project Execution Milestones</span>
            </div>
            <div className="space-y-2">
              {project.phases.map((phase, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xs border border-[var(--line)]/60 bg-[var(--paper)] text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--ink)]">{phase.name}</span>
                      <span className="text-[10px] font-mono text-[var(--muted)]">({phase.phase})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack Chips */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <span className="text-[10px] font-mono uppercase text-[var(--muted)] tracking-wider block">
              Core Technologies Used
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-xs bg-[var(--paper)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-mono text-[var(--ink)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-3">
            {project.live && project.live !== '#' && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[#435d4c] transition shadow-2xs"
              >
                <span>Open Live Deployment</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xs border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] hover:border-[var(--accent)] transition"
              >
                <Github className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>GitHub Source</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)] underline cursor-pointer"
          >
            Close window
          </button>
        </div>
      </div>
    </div>
  )
}
