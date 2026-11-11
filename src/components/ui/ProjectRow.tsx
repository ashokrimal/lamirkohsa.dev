'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Github, Layers } from 'lucide-react'
import { TechStack } from '@/components/ui/TechStack'
import { sensoryAudio } from '@/lib/sensory-audio'
import { toSlug } from '@/lib/slug'
import { uiStrings } from '@/lib/ui-strings'
import { isRepositoryUrl } from '@/lib/urls'
import type { ProjectData } from '@/components/ui/ProjectCard'

interface ProjectRowProps {
  project: ProjectData & { description?: string }
  index: number
}

/**
 * A single editorial project row. Media and copy swap sides on alternate rows,
 * and the entire row opens the case study; outbound links sit above the overlay.
 */
export function ProjectRow({ project, index }: ProjectRowProps) {
  const detailHref = `/projects/${project.slug || toSlug(project.title)}`
  const reversed = index % 2 === 1
  const summary = project.summary || project.description
  const sourceUrl = isRepositoryUrl(project.github) ? project.github : undefined

  return (
    <article className="project-row relative border-t border-line-hairline pt-8 md:pt-10">
      <Link
        href={detailHref}
        className="absolute inset-0 z-10"
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
            <span className="font-mono">{String(index + 1).padStart(2, '0')}</span>
            {project.category && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                {project.category}
              </span>
            )}
            {project.completionDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-accent" aria-hidden="true" />
                {project.completionDate}
              </span>
            )}
            {project.status && <span className="text-emerald-600">{project.status}</span>}
          </div>

          <h3 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-ink md:text-3xl">
            {project.title}
          </h3>

          {summary && (
            <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-2">{summary}</p>
          )}

          {project.techStack && project.techStack.length > 0 && (
            <TechStack items={project.techStack} limit={5} className="mt-4" />
          )}

          <div className="relative z-20 mt-5 flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-accent">
              {uiStrings.project.openProject.en}
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </span>
            {project.live && project.live !== '#' && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                onClick={() => sensoryAudio.playClick()}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-subtle px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-medium hover:bg-overlay-medium"
              >
                {uiStrings.project.liveDemo.en}
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => sensoryAudio.playClick()}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-subtle px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-medium hover:bg-overlay-medium"
              >
                <Github className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                {uiStrings.project.code.en}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
