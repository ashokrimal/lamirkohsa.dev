import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Cpu,
  GitBranch,
  Target,
} from 'lucide-react'
import {
  buildProjectDossier,
  getProjectsResult,
  type ProjectEntry,
} from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'
import {
  PageHero,
  PageNav,
  PageSection,
  PageShell,
} from '@/components/ui/PageChrome'
import { ProjectDocumentation } from '@/components/projects/ProjectDocumentation'
import { CmsErrorState } from '@/components/ui/CmsState'
import type { CmsResult } from '@/lib/cms-schema'
import { isRepositoryUrl } from '@/lib/urls'

export const revalidate = 300

async function findProjectWithNeighbors(slug: string): Promise<
  CmsResult<{
    project?: ProjectEntry
    nextProject?: ProjectEntry
  }>
> {
  const result = await getProjectsResult()
  if (result.status !== 'ok') return result

  const index = result.data.findIndex((project) => project.slug === slug)
  if (index === -1) return { status: 'ok', data: {} }

  const project = result.data[index]
  const nextProject =
    result.data.length > 1 ? result.data[(index + 1) % result.data.length] : undefined

  return { status: 'ok', data: { project, nextProject } }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const result = await findProjectWithNeighbors(params.slug)
  if (result.status === 'error') return {}
  if (result.status !== 'ok' || !result.data.project) notFound()
  const project = result.data.project
  const description = project.summary || project.description
  return {
    title: project.title,
    ...(description ? { description } : {}),
    ...(project.image
      ? {
          openGraph: {
            title: project.title,
            ...(description ? { description } : {}),
            images: [{ url: project.image }],
          },
        }
      : {}),
  }
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: { slug: string }
}) {
  const [lookupResult, copyResult] = await Promise.all([
    findProjectWithNeighbors(params.slug),
    getPageCopy(),
  ])

  if (lookupResult.status === 'error') {
    return (
      <PageShell>
        <CmsErrorState message={lookupResult.message} className="mt-12" />
        <PageNav backHref="/projects" backLabel="All projects" />
      </PageShell>
    )
  }

  if (lookupResult.status !== 'ok' || !lookupResult.data.project) notFound()

  const { project, nextProject } = lookupResult.data
  const copy = copyResult.status === 'ok' ? copyResult.data : {}
  const pageCopy = copy['project-case-study']
  const sections = pageCopy?.sections
  const sourceUrl = isRepositoryUrl(project.github) ? project.github : undefined
  const dossier = buildProjectDossier(project)

  const headerMetaParts = [
    project.category,
    project.period || project.completionDate,
    project.status,
  ].filter(Boolean)

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow || project.category || 'Project Case Study'}
        krEyebrow={pageCopy?.krEyebrow}
        title={project.title}
        accent={pageCopy?.accent}
        description={project.summary || project.description || pageCopy?.description}
        meta={
          headerMetaParts.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
              {headerMetaParts.map((part, idx) => (
                <span key={`${part}-${idx}`} className="inline-flex items-center gap-2.5">
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span>{part}</span>
                </span>
              ))}
            </div>
          ) : undefined
        }
      />

      {/* Project Specification Summary Strip: Model, Duration, Cost & Stack */}
      <section
        aria-label="Project specifications"
        className="mt-8 border-y border-line grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line"
      >
        <div className="py-5 sm:pr-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <GitBranch className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Model followed</span>
          </div>
          <p className="text-sm font-semibold text-ink tracking-tight">{dossier.model.name}</p>
          <p className="text-xs text-muted leading-snug">{dossier.model.cadence}</p>
        </div>

        <div className="py-5 sm:px-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Clock className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Time taken</span>
          </div>
          <p className="text-sm font-semibold text-ink tracking-tight tabular-nums">
            {dossier.duration.headline}
          </p>
          <p className="text-xs text-muted leading-snug">
            {dossier.duration.period || dossier.duration.completionDate || 'Delivery schedule'}
          </p>
        </div>

        <div className="py-5 sm:px-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Coins className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Project cost</span>
          </div>
          <p className="text-sm font-semibold text-ink tracking-tight tabular-nums">
            {dossier.cost.headline}
          </p>
          <p className="text-xs text-muted leading-snug">
            {dossier.cost.breakdown.length} resource layers tracked
          </p>
        </div>

        <div className="py-5 sm:pl-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Cpu className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Tech stack</span>
          </div>
          <p className="text-sm font-semibold text-ink tracking-tight tabular-nums">
            {dossier.techDetails.length}{' '}
            {dossier.techDetails.length === 1 ? 'technology' : 'technologies'}
          </p>
          <p className="text-xs text-muted leading-snug truncate">
            {dossier.techDetails.length > 0
              ? dossier.techDetails.map((t) => t.name).join(' · ')
              : 'Stack details documented below'}
          </p>
        </div>
      </section>

      {project.image && (
        <div className="mt-10 md:mt-12 apple-card overflow-hidden">
          <div className="relative aspect-[16/9] bg-overlay-faint">
            <Image
              src={project.image}
              alt={project.altText || project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              referrerPolicy="no-referrer"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* 01. CASE STUDY PLAN: Problem, Approach & Execution Phases */}
      {(dossier.challengeText ||
        dossier.solutionText ||
        dossier.caseStudyPlanText ||
        project.phases.length > 0) && (
        <PageSection
          number={0}
          eyebrow={sections?.problem?.eyebrow || 'Case Study Plan'}
          krEyebrow={sections?.problem?.krEyebrow}
          title={sections?.problem?.title || 'The brief and execution'}
          accent={sections?.problem?.accent || 'plan.'}
          description={
            sections?.problem?.description ||
            'Problem definition, architectural direction, and step-by-step milestone execution.'
          }
        >
          {(dossier.challengeText || dossier.solutionText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dossier.challengeText && (
                <article className="apple-card p-6 md:p-7">
                  <h3 className="text-xs font-medium text-muted">
                    {sections?.problem?.primaryLabel || 'The challenge'}
                  </h3>
                  <p className="mt-3 text-sm md:text-[15px] text-ink-secondary leading-relaxed">
                    {dossier.challengeText}
                  </p>
                </article>
              )}
              {dossier.solutionText && (
                <article className="apple-card p-6 md:p-7">
                  <h3 className="text-xs font-medium text-muted">
                    {sections?.problem?.secondaryLabel || 'Engineering approach'}
                  </h3>
                  <p className="mt-3 text-sm md:text-[15px] text-ink-secondary leading-relaxed">
                    {dossier.solutionText}
                  </p>
                </article>
              )}
            </div>
          )}

          {dossier.caseStudyPlanText && (
            <article className="mt-6 apple-card p-6 md:p-7">
              <h3 className="text-xs font-medium text-muted">Execution & research plan</h3>
              <p className="mt-3 text-sm md:text-[15px] text-ink-secondary leading-relaxed whitespace-pre-line">
                {dossier.caseStudyPlanText}
              </p>
            </article>
          )}

          {project.phases.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h3 className="text-base font-semibold text-ink tracking-tight">
                  {sections?.phases?.title
                    ? `${sections.phases.title} ${sections.phases.accent ?? ''}`.trim()
                    : 'Phase-by-phase execution roadmap'}
                </h3>
                <span className="text-xs text-muted tabular-nums">
                  {project.phases.length} sequential phases
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {project.phases.map((phase, index) => (
                  <article
                    key={`${phase.name}-${index}`}
                    className="apple-card p-5 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-muted tabular-nums">
                          {phase.phase || `Phase ${index + 1}`}
                        </span>
                        {phase.completed ? (
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-accent shrink-0"
                            aria-label="Completed"
                          />
                        ) : (
                          <Circle
                            className="w-3.5 h-3.5 text-muted shrink-0"
                            aria-label="Planned"
                          />
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-ink tracking-tight leading-snug">
                        {phase.name}
                      </h4>
                      {phase.description && (
                        <p className="text-xs text-muted leading-relaxed">{phase.description}</p>
                      )}
                    </div>

                    {phase.period && (
                      <div className="pt-2.5 border-t border-line-hairline text-[11px] font-mono text-muted tabular-nums">
                        {phase.period}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </PageSection>
      )}

      {/* 02. PROCESS MODEL, DURATION & COST BREAKDOWN */}
      <PageSection
        number={1}
        eyebrow="Delivery & Resources"
        title="Model, timeline and"
        accent="cost."
        description="Engineering methodology followed, total calendar duration, and infrastructure cost profile."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="apple-card p-6 md:p-7 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Process model followed</span>
                <GitBranch className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-ink tracking-tight">
                {dossier.model.name}
              </h3>
              <p className="text-xs font-medium text-accent">{dossier.model.cadence}</p>
              <p className="text-sm text-ink-secondary leading-relaxed">
                {dossier.model.rationale}
              </p>
            </div>
          </article>

          <article className="apple-card p-6 md:p-7 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Duration & schedule</span>
                <Clock className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-ink tracking-tight tabular-nums">
                {dossier.duration.headline}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                {dossier.duration.detail}
              </p>
            </div>

            <dl className="pt-3 border-t border-line-hairline space-y-2 text-xs">
              {dossier.duration.period && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Window</dt>
                  <dd className="font-mono text-ink tabular-nums">{dossier.duration.period}</dd>
                </div>
              )}
              {dossier.duration.completionDate && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Completed</dt>
                  <dd className="font-mono text-ink tabular-nums">
                    {dossier.duration.completionDate}
                  </dd>
                </div>
              )}
              {project.status && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Release state</dt>
                  <dd className="font-medium text-ink">{project.status}</dd>
                </div>
              )}
            </dl>
          </article>

          <article className="apple-card p-6 md:p-7 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Cost breakdown</span>
                <Coins className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-ink tracking-tight tabular-nums">
                {dossier.cost.headline}
              </h3>
              <p className="text-xs text-muted leading-relaxed">{dossier.cost.summary}</p>
            </div>

            <dl className="pt-3 border-t border-line-hairline space-y-2.5 text-xs">
              {dossier.cost.breakdown.map((item) => (
                <div key={item.layer} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted min-w-0 truncate" title={item.provider}>
                    {item.layer}
                  </dt>
                  <dd className="font-mono font-medium text-ink tabular-nums shrink-0">
                    {item.cost}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </PageSection>

      {/* 03. TECH STACK ARCHITECTURE & DELIVERED FEATURES */}
      {(dossier.techDetails.length > 0 || project.features.length > 0) && (
        <PageSection
          number={2}
          eyebrow={sections?.details?.eyebrow || 'Architecture & Capabilities'}
          krEyebrow={sections?.details?.krEyebrow}
          title={sections?.details?.title || 'Tech stack and'}
          accent={sections?.details?.accent || 'features.'}
          description={
            sections?.details?.description ||
            'Each technology selected for its specific architectural responsibility alongside shipped product capabilities.'
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            {dossier.techDetails.length > 0 && (
              <article className="apple-card p-6 md:p-7">
                <h3 className="text-xs font-medium text-muted">
                  {sections?.details?.secondaryLabel || 'Technology stack & roles'}
                </h3>
                <ul className="mt-4 divide-y divide-line-hairline">
                  {dossier.techDetails.map((tech) => (
                    <li key={tech.name} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-ink">{tech.name}</span>
                        <span className="text-xs font-mono text-muted">{tech.layer}</span>
                      </div>
                      <p className="text-xs text-ink-secondary leading-relaxed">{tech.role}</p>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {project.features.length > 0 && (
              <article className="apple-card p-6 md:p-7">
                <h3 className="text-xs font-medium text-muted">
                  {sections?.details?.primaryLabel || 'Shipped capabilities'}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-ink-secondary">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Target className="w-3.5 h-3.5 text-accent mt-1 shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </PageSection>
      )}

      {/* 04. STRUCTURED PROJECT DOCUMENTATION */}
      <PageSection
        number={3}
        eyebrow="Documentation"
        title="Process and product"
        accent="documentation."
        description="Complete software records pairing Process Documentation (SRS, QA test plans, runbooks) with Product Documentation (architecture, ADRs, API contracts, README, user guide)."
      >
        <ProjectDocumentation
          projectTitle={project.title}
          sections={dossier.documentationSections}
          workflowSteps={dossier.workflowSteps}
          recommendedTools={dossier.recommendedTools}
          liveUrl={project.live}
          repoUrl={sourceUrl}
          hasCustomDocumentation={dossier.hasCustomDocumentation}
        />
      </PageSection>

      <PageNav
        backHref="/projects"
        backLabel="All projects"
        nextHref={nextProject ? `/projects/${nextProject.slug}` : undefined}
        nextLabel={nextProject ? `Next case study: ${nextProject.title}` : undefined}
      />
    </PageShell>
  )
}
