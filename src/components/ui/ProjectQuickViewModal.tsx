'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ArrowUpRight, Github, Calendar, CheckCircle2, Layers, Check } from 'lucide-react'
import type { ProjectData } from '@/components/ui/ProjectCard'
import { sensoryAudio } from '@/lib/sensory-audio'

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-scrim/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sensoryAudio.playClick()
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-line bg-surface/95 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line-subtle">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              {project.category && (
                <span className="px-3 py-1 rounded-full bg-overlay text-accent font-medium text-[11px] uppercase tracking-wide">
                  {project.category}
                </span>
              )}
              {project.status && (
                <span className="text-[11px] text-emerald-600 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10">
                  {project.status}
                </span>
              )}
              {project.completionDate && (
                <span className="text-[11px] text-muted flex items-center gap-1 ml-auto sm:ml-2">
                  <Calendar className="w-3 h-3 text-accent" />
                  {project.completionDate}
                </span>
              )}
            </div>
            <h2 id="modal-title" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              sensoryAudio.playClick()
              onClose()
            }}
            className="p-2 rounded-full bg-overlay-soft hover:bg-overlay-strong text-ink transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero image */}
        {project.image && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-overlay-faint border border-line-faint">
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

        {/* Challenge & Solution Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-2xl bg-overlay-faint border border-line-faint space-y-1.5">
            <span className="text-[11px] font-korean uppercase tracking-wider text-muted font-medium">
              문제 정의 · The Challenge
            </span>
            <p className="text-ink text-sm">
              {project.challenge || project.description || 'Solving real-world performance, usability, and workflow friction through thoughtful engineering.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-overlay-faint border border-line-faint space-y-1.5">
            <span className="text-[11px] font-korean uppercase tracking-wider text-muted font-medium">
              기술 해결책 · Solution
            </span>
            <p className="text-ink text-sm">
              {project.solution || 'Engineered with clean separation of concerns, optimistic UI updates, and dependable backend integrity.'}
            </p>
          </div>
        </div>

        {/* Execution Phases Timeline */}
        {project.phases && project.phases.length > 0 && (
          <div className="p-4 rounded-2xl bg-overlay-faint border border-line-faint space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent" />
                <span>Execution Phases</span>
              </span>
              <span className="text-[11px] text-muted">
                {project.phases.filter((p) => p.completed).length} / {project.phases.length} Complete
              </span>
            </div>

            <div className="space-y-2">
              {project.phases.map((ph, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-line-faint text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                        ph.completed
                          ? 'bg-emerald-500 text-inverse'
                          : 'bg-overlay-subtle text-muted'
                      }`}
                    >
                      {ph.completed ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <span className="font-medium text-ink">{ph.phase}</span>
                    <span className="text-muted">· {ph.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      ph.completed
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-overlay text-muted'
                    }`}
                  >
                    {ph.completed ? 'Delivered' : 'Planned'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack Pills */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-korean uppercase tracking-wider text-muted font-medium block">
              사용 기술 스택 · Technology Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full bg-overlay text-xs font-medium text-ink-secondary border border-line-hairline"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal footer CTA */}
        <div className="pt-4 border-t border-line-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {project.live && project.live !== '#' && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="apple-btn-primary"
              >
                <span>Live Experience</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="apple-btn-secondary"
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="apple-btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
