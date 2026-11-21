'use client'

import Link from 'next/link'
import { ArrowUpRight, Calendar, Eye, Github, Layers, TrendingUp } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'
import { useUiStrings } from '@/components/ui/UiCopyProvider'
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
  metrics?: string[]
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
  const uiStrings = useUiStrings()
  const isFeatured = variant === 'featured' || project.featured
  const detailHref = `/projects/${project.slug || toSlug(project.title)}`
  const sourceUrl = isRepositoryUrl(project.github) ? project.github : undefined
  const hasFooterActions = Boolean((project.live && project.live !== '#') || sourceUrl)
  const metrics = project.metrics ?? []

  return (
    <Card3D maxTilt={6} className={isFeatured ? 'md:col-span-2' : ''}>
      <article className="apple-card group relative overflow-hidden flex flex-col justify-between h-full">
        {/* The whole card links cleanly; Quick look sits above on z-20 */}
        <Link
          href={detailHref}
          className="absolute inset-0 z-10"
          aria-label={uiStrings.project.openCaseStudy(project.title)}
        />

        {/* Banner Image Preview */}
        <div className="relative overflow-hidden aspect-[16/10] max-h-[300px] bg-overlay-faint">
          {project.image ? (
            <>
              <ProgressiveImage
                src={project.image}
                alt={project.altText || uiStrings.project.previewAlt(project.title)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                referrerPolicy="no-referrer"
                className="object-cover transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:contrast-[1.04] group-hover:saturate-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-overlay-faint via-transparent to-overlay-subtle text-muted">
              <Layers className="h-6 w-6 opacity-70" aria-hidden="true" />
            </div>
          )}

          {/* Top-left Frosted Category / Status Badges */}
          {(project.category || project.status) && (
            <div className="absolute top-3.5 left-3.5 right-32 flex flex-wrap items-center gap-2 pointer-events-none">
              {project.category && (
                <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-black/15 text-[11px] font-medium tracking-tight text-[#1d1d1f] shadow-[0_4px_14px_rgba(0,0,0,0.16)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f5d49]" />
                  <span>{project.category}</span>
                </div>
              )}
              {project.status && (
                <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-black/15 text-[11px] font-medium text-emerald-700 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
                  {project.status}
                </div>
              )}
            </div>
          )}

          {/* Right-most Floating Quick Look Chip — always light frosted pill for dark-text visibility */}
          {onQuickView && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                sensoryAudio.playClick()
                onQuickView()
              }}
              aria-label={uiStrings.project.quickViewAria(project.title)}
              className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-[#1d1d1f] shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200 hover:border-black/25 hover:bg-white hover:text-[#3f5d49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#3f5d49]" aria-hidden="true" />
              <span>{uiStrings.project.quickView.en}</span>
            </button>
          )}

          {/* Impact statistics overlaid on the thumbnail */}
          {metrics.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3.5 pt-12">
              {metrics.map((metric) => (
                <span
                  key={metric}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/95 px-2.5 py-1 text-[10.5px] font-medium tracking-tight text-[#1d1d1f] shadow-[0_2px_10px_rgba(0,0,0,0.18)] backdrop-blur-md"
                >
                  <TrendingUp className="h-3 w-3 shrink-0 text-[#3f5d49]" aria-hidden="true" />
                  {metric}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-6 md:p-7 flex-1 flex flex-col justify-between space-y-5">
          <div>
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

            <h3 className="text-xl md:text-2xl font-semibold text-ink tracking-tight leading-snug group-hover:text-accent transition-colors">
              {project.title}
            </h3>

            {(project.summary || project.description) && (
              <p className="mt-2.5 text-sm text-muted leading-relaxed line-clamp-3 font-normal">
                {project.summary || project.description}
              </p>
            )}

            {project.phases && project.phases.length > 0 && (
              <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay-hairline text-[11px] text-ink-secondary">
                <Layers className="w-3 h-3 text-accent" />
                <span>{uiStrings.project.executionPhases(project.phases.length)}</span>
              </div>
            )}
          </div>

          {hasFooterActions && (
            <div className="relative z-20 pt-4 border-t border-line-hairline flex flex-wrap items-center gap-2 text-xs">
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
          )}
        </div>
      </article>
    </Card3D>
  )
}
