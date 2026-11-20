import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, FolderGit2 } from 'lucide-react'
import { getPageMetadata, getPublishedProjects } from '@/lib/studio/data'
import { getProjectsResult } from '@/lib/projects'
import { getProjectStatusVisual } from '@/lib/project-status'
import { pageMetadata } from '@/lib/seo'
import { PageHero, PageShell } from '@/components/ui/PageChrome'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const studio = await getPageMetadata('/work')
  if (studio) {
    return pageMetadata(
      { title: studio.title, seoDescription: studio.description },
      { title: 'Work' },
      '/work',
    )
  }
  return pageMetadata(undefined, { title: 'Work' }, '/work')
}

/**
 * Case study index over the studio `projects` table. Before the studio seed has
 * run, the CMS projects the site already publishes fill the grid, so `/work` is
 * never empty on first deploy.
 */
export default async function WorkIndexPage() {
  const studioProjects = await getPublishedProjects()
  const legacy = studioProjects.length === 0 ? await getProjectsResult() : null
  const fallback = legacy?.status === 'ok' ? legacy.data : []

  const cards =
    studioProjects.length > 0
      ? studioProjects.map((project) => ({
          key: `studio-${project.id}`,
          href: `/work/${project.slug}`,
          title: project.title,
          category: project.category,
          status: project.status,
          summary: project.summary,
          image: project.coverMediaUrl,
          tech: project.techStack,
        }))
      : fallback.map((project) => ({
          key: `legacy-${project.id}`,
          href: `/projects/${project.slug}`,
          title: project.title,
          category: project.category,
          status: project.status,
          summary: project.summary ?? project.description,
          image: project.image,
          tech: project.techStack,
        }))

  return (
    <PageShell>
      <PageHero
        eyebrow="Selected Work · Case Studies"
        title="Engineering ideas into"
        accent="reality."
        description="Case studies from discovery to deployment, where architecture, performance and interface craft meet real-world utility."
      />

      {cards.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            eyebrow="Projects"
            icon={FolderGit2}
            message="No projects published yet."
            hint="Publish a case study in the studio to fill this page."
          />
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map((project) => {
            const statusVisual = getProjectStatusVisual(project.status)
            return (
              <Link
                key={project.key}
                href={project.href}
                className="group apple-card flex flex-col gap-4 p-5 transition-colors hover:border-line-medium md:p-6"
              >
                {project.image && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line-hairline bg-overlay-faint">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {project.category && (
                    <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted">
                      {project.category}
                    </p>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusVisual.badgeClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusVisual.dotClass}`}
                      aria-hidden="true"
                    />
                    <span>{statusVisual.lifecycle}</span>
                  </span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-ink group-hover:text-accent md:text-xl">
                  {project.title}
                </h2>
                {project.summary && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-accent">
                  Read the case study
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
