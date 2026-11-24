import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Github, Globe, Target, Wrench } from 'lucide-react'
import type { StudioProject } from '@/lib/studio/data'
import { isRepositoryUrl } from '@/lib/urls'
import { getProjectStatusVisual } from '@/lib/project-status'
import { PageHero, PageSection, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { JsonLd } from '@/components/seo/JsonLd'
import { caseStudyJsonLd } from '@/lib/structured-data'

/**
 * Case study detail for a studio `projects` row that has no `cmsContent`
 * Projects record.
 *
 * `/projects/[slug]` is the one canonical case study route: `/work/[slug]`
 * permanently redirects here. A project created only in Studio → Case studies
 * still resolves, but renders the studio fields it actually has instead of the
 * richer CMS dossier, which would otherwise be invented.
 */
export function StudioCaseStudyView({
  project,
  nextProject,
}: {
  project: StudioProject
  nextProject?: StudioProject
}) {
  const repoUrl = isRepositoryUrl(project.repoUrl) ? project.repoUrl : undefined
  const statusVisual = getProjectStatusVisual(project.status)

  const metaParts = [
    project.category,
    project.featuredOrder !== undefined ? 'Featured' : undefined,
  ].filter(Boolean)

  return (
    <PageShell>
      <JsonLd
        data={caseStudyJsonLd({
          title: project.title,
          description: project.summary ?? undefined,
          path: `/projects/${project.slug}`,
          image: project.coverMediaUrl ?? undefined,
          publishedTime: project.completionDate,
          modifiedTime: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
          technologies: project.techStack,
          liveUrl: project.liveUrl ?? undefined,
        })}
      />
      <PageHero
        eyebrow={project.category || 'Project Case Study'}
        title={project.title}
        description={project.summary}
        meta={
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusVisual.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusVisual.dotClass}`} aria-hidden="true" />
              <span>{statusVisual.lifecycle}</span>
            </span>
            {metaParts.map((part, idx) => (
              <span key={`${part}-${idx}`} className="inline-flex items-center gap-2.5">
                <span aria-hidden="true">·</span>
                <span>{part}</span>
              </span>
            ))}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="apple-btn-primary"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Visit live site</span>
              </a>
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="apple-btn-secondary"
              >
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Source code</span>
              </a>
            )}
          </div>
        }
      />

      {project.coverMediaUrl && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line-subtle bg-overlay-faint">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={project.coverMediaUrl}
              alt={project.title}
              fill
              sizes="100vw"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {(project.problem || project.solution) && (
        <PageSection
          number={0}
          eyebrow="01 / The brief"
          title="Problem and"
          accent="approach."
          description="What needed to change, and the engineering direction that got it there."
          linkHref="/contact"
          linkLabel="Start a conversation"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {project.problem && (
              <article className="apple-card p-6 md:p-7">
                <h2 className="flex items-center gap-2 text-xs font-medium text-muted">
                  <Target className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  The problem
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-secondary md:text-[15px]">
                  {project.problem}
                </p>
              </article>
            )}
            {project.solution && (
              <article className="apple-card p-6 md:p-7">
                <h2 className="flex items-center gap-2 text-xs font-medium text-muted">
                  <Wrench className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  The solution
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-secondary md:text-[15px]">
                  {project.solution}
                </p>
              </article>
            )}
          </div>
        </PageSection>
      )}

      <PageSection
        number={1}
        eyebrow="02 / Stack"
        title="Built with"
        accent="these tools."
        description="The technologies that carry the build."
        linkHref="/projects"
        linkLabel="All projects"
      >
        {project.techStack.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-line-subtle bg-overlay-faint px-3 py-1 text-xs font-medium text-ink-secondary"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Stack details are not published for this project.</p>
        )}
      </PageSection>

      <section className="mt-12 rounded-2xl border border-line-subtle bg-surface p-6 md:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Have a similar problem?</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Tell me what you are building and where it is stuck. I reply to every serious inquiry.
        </p>
        <Link href="/contact" className="apple-btn-primary mt-5 inline-flex items-center gap-1.5">
          <span>Start a conversation</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>

      <PageNav
        backHref="/projects"
        backLabel="All projects"
        nextHref={nextProject ? `/projects/${nextProject.slug}` : undefined}
        nextLabel={nextProject ? `Next case study: ${nextProject.title}` : undefined}
      />
    </PageShell>
  )
}
