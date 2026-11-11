'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Github, Layers, Sparkles } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'
import { TechStack } from '@/components/ui/TechStack'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'

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
  altText?: string
  live?: string
  github?: string
  status?: string
  featured?: boolean
  completionDate?: string
  phases?: Array<{ phase?: string; name: string; completed?: boolean }>
}

interface ProjectCardProps {
  project: ProjectData
  variant?: 'featured' | 'standard' | 'compact'
  index?: number
}

export function ProjectCard({ project, variant = 'standard', index }: ProjectCardProps) {
  const isFeatured = variant === 'featured' || project.featured
  // Every card opens the case study route, never an inline expansion.
  const detailHref = `/projects/${project.slug || toSlug(project.title)}`

  return (
    <Card3D maxTilt={6} className={isFeatured ? 'md:col-span-2' : ''}>
      <article className="apple-card group relative overflow-hidden flex flex-col justify-between h-full">
        {/* The whole card is the link; the overlay keeps the markup valid without
            nesting the demo and source links inside an anchor. */}
        <Link
          href={detailHref}
          className="absolute inset-0 z-10"
          aria-label={`Open the ${project.title} case study`}
        />
        {/* Top Image Preview if available */}
        {project.image && (
          <div className="relative overflow-hidden aspect-[16/10] max-h-[300px] bg-overlay-faint">
            <Image
              src={project.image}
              alt={project.altText || `${project.title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />

            {/* Apple Frosted Glass Pill Badges */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
              {project.category && (
                <div className="px-3 py-1 rounded-full bg-surface/85 dark:bg-scrim/80 backdrop-blur-xl border border-line-subtle text-[11px] font-medium tracking-tight text-ink shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{project.category}</span>
                </div>
              )}
              {project.status && (
                <div className="px-3 py-1 rounded-full bg-surface/85 dark:bg-scrim/80 backdrop-blur-xl border border-line-subtle text-[11px] font-medium text-emerald-600 shadow-xs">
                  {project.status}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-6 md:p-7 flex-1 flex flex-col justify-between space-y-5">
          <div>
            {/* Meta Row with Korean Subtitle */}
            <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
              {index !== undefined && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="font-mono">0{index + 1}</span>
                </div>
              )}
              {project.completionDate && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted ml-auto">
                  <Calendar className="w-3 h-3 text-accent" />
                  {project.completionDate}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-semibold text-ink tracking-tight leading-snug">
              {project.title}
            </h3>

            {/* Description */}
            {(project.summary || project.description) && (
              <p className="mt-2.5 text-sm text-muted leading-relaxed line-clamp-3 font-normal">
                {project.summary || project.description}
              </p>
            )}

            {/* Phases Pill */}
            {project.phases && project.phases.length > 0 && (
              <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay-hairline text-[11px] text-ink-secondary">
                <Layers className="w-3 h-3 text-accent" />
                <span>{project.phases.length} Execution Phases</span>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="pt-1">
              <TechStack items={project.techStack} limit={5} />
            </div>
          )}

          {/* Actions with Anti-Boxy Apple Pill Buttons */}
          <div className="relative z-20 pt-4 border-t border-line-hairline flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {project.live && project.live !== '#' && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sensoryAudio.playClick()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-overlay px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-overlay-medium"
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
                  onClick={() => sensoryAudio.playClick()}
                  className="apple-btn-secondary !py-1.5 !px-3 !text-xs"
                  title="View Source Code"
                >
                  <Github className="w-3.5 h-3.5 text-muted" />
                  <span>Code</span>
                </a>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <span>View case study</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Card3D>
  )
}
