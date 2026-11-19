'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Eye, Layers } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'
import { uiStrings } from '@/lib/ui-strings'
import type { ProjectData } from '@/components/ui/ProjectCard'

interface ProjectRowProps {
  project: ProjectData & { description?: string }
  index: number
  onQuickView?: () => void
}

/**
 * A single editorial project row. Media and copy swap sides on alternate rows,
 * clicking the card opens the case study, and the floating Quick look chip opens a drawer preview.
 */
export function ProjectRow({
  project,
  index,
  onQuickView,
}: ProjectRowProps) {
  const detailHref = `/projects/${project.slug || toSlug(project.title)}`
  const summary = project.summary || project.description
  const reversed = index % 2 === 1

  return (
    <article className="project-row group relative cursor-pointer border-t border-line-hairline pt-8 md:pt-10">
      <Link
        href={detailHref}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        aria-label={uiStrings.project.openCaseStudy(project.title)}
      />

      <div className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
        <div className={`md:col-span-7 ${reversed ? 'md:order-2' : ''}`}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line-hairline bg-overlay-faint transition-[border-color,box-shadow] duration-500 ease-out group-hover:border-line-medium group-hover:shadow-md">
            {project.image ? (
              <>
                <Image
                  src={project.image}
                  alt={project.altText || uiStrings.project.previewAlt(project.title)}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  referrerPolicy="no-referrer"
                  className="object-cover transition-[transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:contrast-[1.04] group-hover:saturate-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-overlay-faint via-transparent to-overlay-subtle text-muted transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Layers className="h-6 w-6 opacity-70 transition-opacity duration-300 group-hover:opacity-40" aria-hidden="true" />
              </div>
            )}

            {/* Floating Quick Look Chip — right-most corner of the project banner */}
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
                className={`absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full backdrop-blur-md px-3 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 cursor-pointer ${
                  project.image
                    ? 'border border-white/25 bg-black/55 text-white hover:bg-black/75 hover:border-white/45'
                    : 'border border-line-subtle bg-surface/90 text-ink hover:border-accent hover:text-accent'
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>{uiStrings.project.quickView.en}</span>
              </button>
            )}

            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5 opacity-0 translate-y-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 motion-reduce:transition-none motion-reduce:translate-y-0 ${
                project.image ? 'text-white' : 'bg-gradient-to-t from-surface/95 via-surface/75 to-transparent text-ink'
              }`}
              aria-hidden="true"
            >
              <div className="min-w-0 space-y-0.5">
                {project.category && (
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.16em] truncate ${
                      project.image ? 'text-white/75' : 'text-muted'
                    }`}
                  >
                    {project.category}
                  </p>
                )}
                <p className="text-xs sm:text-sm font-medium truncate">
                  {project.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`md:col-span-5 ${reversed ? 'md:order-1' : ''}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            <span className="font-mono tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            {project.category && (
              <>
                <span aria-hidden="true">·</span>
                <span>{project.category}</span>
              </>
            )}
            {project.completionDate && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-accent" aria-hidden="true" />
                  {project.completionDate}
                </span>
              </>
            )}
            {project.status && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 dark:text-emerald-400">{project.status}</span>
              </>
            )}
          </div>

          <h3 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-accent md:text-3xl">
            {project.title}
          </h3>

          {summary && (
            <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-2">{summary}</p>
          )}
        </div>
      </div>
    </article>
  )
}
