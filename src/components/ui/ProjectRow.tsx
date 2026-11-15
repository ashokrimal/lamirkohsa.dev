'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Eye, Layers } from 'lucide-react'
import { TechStack } from '@/components/ui/TechStack'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'
import { uiStrings } from '@/lib/ui-strings'
import type { ProjectData } from '@/components/ui/ProjectCard'
import type { CmsTechDefinition } from '@/lib/tech-metadata'

interface ProjectRowProps {
  project: ProjectData & { description?: string }
  index: number
  globalTechDefinitions?: Record<string, CmsTechDefinition>
  onQuickView?: () => void
}

/**
 * A single editorial project row. Media and copy swap sides on alternate rows,
 * clicking the card opens the full case study, and Quick view opens a drawer preview.
 */
export function ProjectRow({
  project,
  index,
  globalTechDefinitions,
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
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line-hairline bg-overlay-faint">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.altText || uiStrings.project.previewAlt(project.title)}
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                referrerPolicy="no-referrer"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                <Layers className="h-6 w-6" aria-hidden="true" />
              </div>
            )}
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

          {project.techStack && project.techStack.length > 0 && (
            <TechStack
              items={project.techStack}
              limit={5}
              definitions={project.techDefinitions}
              globalDefinitions={globalTechDefinitions}
              projectTitle={project.title}
              projectCategory={project.category}
              className="relative z-20 mt-4"
            />
          )}

          <div className="relative z-20 mt-5 flex flex-wrap items-center gap-3">
            {onQuickView && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  sensoryAudio.playClick()
                  onQuickView()
                }}
                aria-label={uiStrings.project.quickViewAria(project.title)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-overlay-faint px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:bg-overlay hover:text-accent cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>{uiStrings.project.quickView.en}</span>
              </button>
            )}

            <span className="pointer-events-none inline-flex items-center gap-1 text-xs font-medium text-accent">
              <span>{uiStrings.project.viewCaseStudy.en}</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
