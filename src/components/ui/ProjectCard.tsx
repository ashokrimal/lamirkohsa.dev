'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Eye, Github, Layers } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'
import { TechStack } from '@/components/ui/TechStack'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'
import { uiStrings } from '@/lib/ui-strings'
import { isRepositoryUrl } from '@/lib/urls'
import type { CmsTechDefinition } from '@/lib/tech-metadata'

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
  techDefinitions?: Record<string, CmsTechDefinition>
  image?: string
  altText?: string
  live?: string
  github?: string
  status?: string
  featured?: boolean
  completionDate?: string
  duration?: string
  cost?: string
  model?: string
  features?: string[]
  phases?: Array<{ phase?: string; name: string; completed?: boolean }>
}

interface ProjectCardProps {
  project: ProjectData
  variant?: 'featured' | 'standard' | 'compact'
  index?: number
  onQuickView?: () => void
}

export function ProjectCard({
  project,
  variant = 'standard',
  index,
  onQuickView,
}: ProjectCardProps) {
  const isFeatured = variant === 'featured' || project.featured
  // Every card opens the case study route, never an inline expansion.
  const detailHref = `/projects/${project.slug || toSlug(project.title)}`
  const sourceUrl = isRepositoryUrl(project.github) ? project.github : undefined

  return (
    <Card3D maxTilt={6} className={isFeatured ? 'md:col-span-2' : ''}>
      <article className="apple-card group relative overflow-hidden flex flex-col justify-between h-full">
        {/* The whole card is the link; the overlay keeps the markup valid without
            nesting the demo and source links inside an anchor. */}
        <Link
          href={detailHref}
          className="absolute inset-0 z-10"
          aria-label={uiStrings.project.openCaseStudy(project.title)}
        />
        {/* Top Image Preview if available */}
        {project.image && (
          <div className="relative overflow-hidden aspect-[16/10] max-h-[300px] bg-overlay-faint">
            <Image
              src={project.image}
              alt={project.altText || uiStrings.project.previewAlt(project.title)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              className="object-cover transition-[transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:contrast-[1.04] group-hover:saturate-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between gap-2 text-white opacity-0 translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 motion-reduce:transition-none motion-reduce:translate-y-0"
              aria-hidden="true"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 truncate">
                {uiStrings.project.viewCaseStudy.en}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white" />
            </div>

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
                <span>{uiStrings.project.executionPhases(project.phases.length)}</span>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="relative z-20 pt-1">
              <TechStack
                items={project.techStack}
                limit={5}
                definitions={project.techDefinitions}
                projectTitle={project.title}
                projectCategory={project.category}
              />
            </div>
          )}

          {/* Actions with Anti-Boxy Apple Pill Buttons */}
          <div className="relative z-20 pt-4 border-t border-line-hairline flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {onQuickView && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    sensoryAudio.playClick()
                    onQuickView()
                  }}
                  aria-label={uiStrings.project.quickViewAria(project.title)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-overlay px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>{uiStrings.project.quickView.en}</span>
                </button>
              )}
              {project.live && project.live !== '#' && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sensoryAudio.playClick()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-overlay px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-overlay-medium"
                >
                  <span>{uiStrings.project.liveDemo.en}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sensoryAudio.playClick()}
                  className="apple-btn-secondary !py-1.5 !px-3 !text-xs"
                  title={uiStrings.project.sourceTitle.en}
                >
                  <Github className="w-3.5 h-3.5 text-muted" />
                  <span>{uiStrings.project.code.en}</span>
                </a>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent shrink-0">
              <span>{uiStrings.project.viewCaseStudy.en}</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Card3D>
  )
}
