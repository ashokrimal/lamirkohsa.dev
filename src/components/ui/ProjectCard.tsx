import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Github, Layers } from 'lucide-react'

export interface ProjectData {
  id?: number | string
  title: string
  slug?: string
  category?: string
  summary?: string
  description?: string
  challenge?: string
  solution?: string
  techStack?: string[]
  image?: string
  live?: string
  github?: string
  status?: string
  featured?: boolean
  completionDate?: string
  phases?: Array<{ phase: string; name: string; completed?: boolean }>
}

interface ProjectCardProps {
  project: ProjectData
  variant?: 'featured' | 'standard' | 'compact'
  index?: number
  onQuickView?: (project: ProjectData) => void
}

export function ProjectCard({ project, variant = 'standard', index, onQuickView }: ProjectCardProps) {
  const isFeatured = variant === 'featured' || project.featured

  return (
    <article
      className={`group rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xs flex flex-col justify-between ${
        isFeatured ? 'md:col-span-2' : ''
      }`}
    >
      {/* Top Image Preview if available */}
      {project.image && (
        <div className="relative overflow-hidden aspect-[16/9] max-h-[280px] bg-[var(--paper)]">
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            className="object-cover transition-transform duration-500 group-hover:scale-102"
          />
          {project.status && (
            <div className="absolute top-3 right-3 bg-[var(--surface)]/95 backdrop-blur-xs border border-[var(--line)] px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold text-[var(--accent)] shadow-2xs">
              {project.status}
            </div>
          )}
          {project.category && (
            <div className="absolute top-3 left-3 bg-[var(--ink)]/80 text-[var(--paper)] px-2 py-0.5 rounded-xs text-[9px] font-mono uppercase tracking-wider">
              {project.category}
            </div>
          )}
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 text-xs mb-2">
            {index !== undefined && (
              <span className="text-[10px] font-mono text-[var(--muted)]">
                0{index + 1} / Project
              </span>
            )}
            {project.completionDate && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--muted)] ml-auto">
                <Calendar className="w-3 h-3 text-[var(--accent)]" />
                {project.completionDate}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-normal text-[var(--ink)] tracking-[-0.04em] leading-snug group-hover:text-[var(--accent)] transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs md:text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
            {project.summary || project.description || 'A full-stack software application built with attention to performance and interface craft.'}
          </p>

          {/* Phases counter badge if available */}
          {project.phases && project.phases.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[var(--paper)] border border-[var(--line)] text-[10px] font-mono text-[var(--muted)]">
              <Layers className="w-3 h-3 text-[var(--accent)]" />
              <span>{project.phases.length} Execution Phases</span>
            </div>
          )}
        </div>

        {/* Tech Stack Chips */}
        {project.techStack && project.techStack.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.techStack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-xs bg-[var(--paper)] border border-[var(--line)] px-2 py-0.5 text-[10px] font-mono text-[var(--ink)]"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 5 && (
                <span className="text-[10px] font-mono text-[var(--muted)] self-center">
                  +{project.techStack.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-[var(--line)]/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {project.live && project.live !== '#' && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline"
              >
                <span>Live Demo</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--ink)]"
                title="View Source Code"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono">Source</span>
              </a>
            )}
          </div>

          {onQuickView ? (
            <button
              type="button"
              onClick={() => onQuickView(project)}
              className="text-[11px] font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Case study</span>
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <Link
              href="/projects"
              className="text-[11px] font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              Case study →
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
