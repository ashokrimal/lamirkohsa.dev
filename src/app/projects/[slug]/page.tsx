import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowUpRight, Calendar, CheckCircle2, Circle, Github, Layers, Target } from 'lucide-react'
import { getProjectsResult, type ProjectEntry } from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'
import {
  MetaChip,
  PageHero,
  PageNav,
  PageSection,
  PageShell,
} from '@/components/ui/PageChrome'
import { TechStack } from '@/components/ui/TechStack'
import { CmsErrorState } from '@/components/ui/CmsState'
import type { CmsResult } from '@/lib/cms-schema'

export const revalidate = 300

async function findProject(slug: string): Promise<CmsResult<ProjectEntry | undefined>> {
  const result = await getProjectsResult()
  if (result.status !== 'ok') return result
  return { status: 'ok', data: result.data.find((project) => project.slug === slug) }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const result = await findProject(params.slug)
  if (result.status !== 'ok' || !result.data) return {}
  const project = result.data
  return {
    title: project.title,
    description: project.challenge,
  }
}

export default async function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const [projectResult, copyResult] = await Promise.all([findProject(params.slug), getPageCopy()])
  if (projectResult.status === 'error') {
    return (
      <PageShell>
        <CmsErrorState message={projectResult.message} className="mt-12" />
        <PageNav backHref="/projects" />
      </PageShell>
    )
  }
  if (projectResult.status !== 'ok' || !projectResult.data) notFound()
  const project = projectResult.data
  const copy = copyResult.status === 'ok' ? copyResult.data : {}
  const pageCopy = copy['project-case-study']
  const sections = pageCopy?.sections

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={project.title}
        accent={pageCopy?.accent}
        description={pageCopy?.description || project.challenge}
        meta={
          project.period || project.status || project.phases.length ? (
            <>
              {project.period && <MetaChip icon={Calendar}>{project.period}</MetaChip>}
              {project.status && <MetaChip icon={CheckCircle2}>{project.status}</MetaChip>}
              {project.phases.length > 0 && (
                <MetaChip icon={Layers}>{project.phases.length}</MetaChip>
              )}
            </>
          ) : undefined
        }
        actions={
          project.live || project.github ? (
            <>
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="apple-btn-primary"
                >
                  <span>Live</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="apple-btn-secondary"
                >
                  <Github className="w-3.5 h-3.5 text-muted" />
                  <span>GitHub</span>
                </a>
              )}
            </>
          ) : undefined
        }
      />

      {project.image && (
        <div className="mt-10 md:mt-14 apple-card overflow-hidden">
          <div className="relative aspect-[16/9] bg-overlay-faint">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              referrerPolicy="no-referrer"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {(project.challenge || project.solution) && sections?.problem?.title && (
        <PageSection
          eyebrow={sections.problem.eyebrow}
          krEyebrow={sections.problem.krEyebrow}
          title={sections.problem.title}
          accent={sections.problem.accent}
          description={sections.problem.description}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.challenge && (
              <article className="apple-card p-6 md:p-7">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {sections.problem.primaryLabel}
                </h3>
                <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                  {project.challenge}
                </p>
              </article>
            )}
            {project.solution && (
              <article className="apple-card p-6 md:p-7">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {sections.problem.secondaryLabel}
                </h3>
                <p className="mt-3 text-sm text-ink-secondary leading-relaxed">{project.solution}</p>
              </article>
            )}
          </div>
        </PageSection>
      )}

      {project.phases.length > 0 && sections?.phases?.title && (
        <PageSection
          eyebrow={sections.phases.eyebrow}
          krEyebrow={sections.phases.krEyebrow}
          title={sections.phases.title}
          accent={sections.phases.accent}
          description={sections.phases.description}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.phases.map((phase, index) => (
              <article key={`${phase.name}-${index}`} className="apple-card p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">{phase.phase}</span>
                  {phase.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-ink tracking-tight">{phase.name}</h3>
                {phase.period && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {phase.period}
                  </span>
                )}
                {phase.description && (
                  <p className="text-xs text-muted leading-relaxed">{phase.description}</p>
                )}
              </article>
            ))}
          </div>
        </PageSection>
      )}

      {(project.features.length > 0 || project.techStack.length > 0) && sections?.details?.title && (
        <PageSection
          eyebrow={sections.details.eyebrow}
          krEyebrow={sections.details.krEyebrow}
          title={sections.details.title}
          accent={sections.details.accent}
          description={sections.details.description}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
            {project.features.length > 0 && (
              <article className="apple-card p-6 md:p-7">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {sections.details.primaryLabel}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-secondary">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Target className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {project.techStack.length > 0 && (
              <article className="apple-card p-6 md:p-7">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {sections.details.secondaryLabel}
                </h3>
                <TechStack items={project.techStack} className="mt-4" />
              </article>
            )}
          </div>
        </PageSection>
      )}

      <PageNav backHref="/projects" />
    </PageShell>
  )
}
