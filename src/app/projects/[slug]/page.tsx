import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Clock,
  FolderTree,
  GitBranch,
  Target,
  Wrench,
} from 'lucide-react'
import {
  buildProjectDossier,
  getProjectsResult,
  type ProjectEntry,
} from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'
import { PageHero, PageSection, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { ProjectDocumentation } from '@/components/projects/ProjectDocumentation'
import { ProjectGanttChart } from '@/components/projects/ProjectGanttChart'
import { ProjectPhaseRoadmap } from '@/components/projects/ProjectPhaseRoadmap'
import { CaseStudyHeroImage } from '@/components/projects/CaseStudyHeroImage'
import { StudioCaseStudyView } from '@/components/projects/StudioCaseStudyView'
import { getProjectBySlug, getPublishedProjects } from '@/lib/studio/data'
import { CaseStudyLayerTooltip } from '@/components/projects/CaseStudyLayerTooltip'
import { ShareProjectButton } from '@/components/projects/ShareProjectButton'
import { DownloadCaseStudyPdfButton } from '@/components/projects/DownloadCaseStudyPdfButton'
import { CmsErrorState } from '@/components/ui/CmsState'
import type { CmsResult } from '@/lib/cms-schema'
import { articleMetadata } from '@/lib/seo'
import { breadcrumbJsonLd, caseStudyJsonLd, cmsDate } from '@/lib/structured-data'
import { snippet } from '@/lib/snippets'
import { bumpSlugRedirectHit, resolveSlugRedirect } from '@/lib/slug-history'
import { JsonLd } from '@/components/seo/JsonLd'
import { isRepositoryUrl } from '@/lib/urls'
import { getProjectStatusVisual } from '@/lib/project-status'

export const dynamic = 'force-dynamic'

async function findProjectWithNeighbors(slug: string): Promise<
  CmsResult<{
    project?: ProjectEntry
    previousProject?: ProjectEntry
    nextProject?: ProjectEntry
  }>
> {
  const result = await getProjectsResult({ fresh: true })
  if (result.status !== 'ok') return result

  const index = result.data.findIndex((project) => project.slug === slug)
  if (index === -1) return { status: 'ok', data: {} }

  const project = result.data[index]
  const nextProject =
    result.data.length > 1 ? result.data[(index + 1) % result.data.length] : undefined
  const previousProject =
    result.data.length > 1
      ? result.data[(index - 1 + result.data.length) % result.data.length]
      : undefined

  return { status: 'ok', data: { project, previousProject, nextProject } }
}

/**
 * A project created in Studio → Case studies has no `cmsContent` record, so the
 * canonical route falls back to the studio row. Without this, retiring `/work`
 * would have 404'd every studio-only case study.
 */
async function findStudioProjectWithNeighbors(slug: string) {
  const project = await getProjectBySlug(slug)
  if (!project) return undefined

  const all = await getPublishedProjects()
  const index = all.findIndex((entry) => entry.slug === project.slug)
  const nextProject = all.length > 1 && index >= 0 ? all[(index + 1) % all.length] : undefined
  const previousProject =
    all.length > 1 && index >= 0 ? all[(index - 1 + all.length) % all.length] : undefined
  return { project, previousProject, nextProject }
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const result = await findProjectWithNeighbors(params.slug)
  if (result.status === 'error') return {}

  if (result.status !== 'ok' || !result.data.project) {
    const studio = await findStudioProjectWithNeighbors(params.slug)
    if (!studio) {
      const renamed = await resolveSlugRedirect(`/projects/${params.slug}`)
      if (renamed) permanentRedirect(renamed)
      notFound()
    }
    return articleMetadata({
      title: studio.project.title,
      description: snippet(studio.project.summary),
      path: `/projects/${studio.project.slug}`,
      image: studio.project.coverMediaUrl,
      publishedTime: cmsDate(studio.project.completionDate),
      modifiedTime: studio.project.updatedAt,
    })
  }

  const project = result.data.project
  const description = snippet(project.summary || project.description)

  // The same dates the TechArticle JSON-LD uses, so the Open Graph tags and the
  // structured data can never disagree about when the case study changed.
  return articleMetadata({
    title: project.title,
    description,
    path: `/projects/${project.slug}`,
    image: project.image,
    publishedTime: cmsDate(project.completionDate),
    modifiedTime: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
  })
}

export default async function ProjectCaseStudyPage(
  props: {
    params: Promise<{ slug: string }>
  }
) {
  const params = await props.params;
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

  if (lookupResult.status !== 'ok' || !lookupResult.data.project) {
    const studio = await findStudioProjectWithNeighbors(params.slug)
    if (!studio) {
      // A slug corrected in the studio keeps its old URL working.
      const renamed = await resolveSlugRedirect(`/projects/${params.slug}`)
      if (renamed) {
        await bumpSlugRedirectHit(`/projects/${params.slug}`)
        permanentRedirect(renamed)
      }
      notFound()
    }
    return (
      <StudioCaseStudyView
        project={studio.project}
        previousProject={studio.previousProject}
        nextProject={studio.nextProject}
      />
    )
  }

  const { project, previousProject, nextProject } = lookupResult.data
  const copy = copyResult.status === 'ok' ? copyResult.data : {}
  const pageCopy = copy['project-case-study']
  const sections = pageCopy?.sections
  const sourceUrl = isRepositoryUrl(project.github) ? project.github : undefined
  const dossier = buildProjectDossier(project)
  const costTooltipLayers = dossier.cost.breakdown.map((item) => ({
    layer: item.layer,
    context: item.cost,
  }))
  const techTooltipLayers = dossier.techDetails.map((tech) => ({
    layer: tech.layer,
    context: tech.name,
  }))

  const statusVisual = getProjectStatusVisual(project.status)
  const secondaryStageLabel =
    project.status &&
    project.status.trim().toLowerCase() !== statusVisual.lifecycle.toLowerCase()
      ? project.status.trim()
      : undefined

  const headerMetaParts = [
    project.category,
    project.period || project.completionDate,
    secondaryStageLabel,
  ].filter(Boolean)

  return (
    <PageShell>
      <JsonLd
        data={caseStudyJsonLd({
          title: project.title,
          description: project.summary || project.description,
          path: `/projects/${project.slug}`,
          image: project.image,
          publishedTime: project.completionDate,
          modifiedTime: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
          technologies: dossier.techDetails.map((tech) => tech.name),
          liveUrl: project.live,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
      <PageHero
        eyebrow={pageCopy?.eyebrow || project.category || 'Project Case Study'}
        krEyebrow={pageCopy?.krEyebrow}
        title={project.title}
        accent={pageCopy?.accent}
        description={project.summary || project.description || pageCopy?.description}
        meta={
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusVisual.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusVisual.dotClass}`} aria-hidden="true" />
              <span>{statusVisual.lifecycle}</span>
            </span>
            {headerMetaParts.map((part, idx) => (
              <span key={`${part}-${idx}`} className="inline-flex items-center gap-2.5">
                <span aria-hidden="true">·</span>
                <span>{part}</span>
              </span>
            ))}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <DownloadCaseStudyPdfButton project={project} dossier={dossier} />
            <ShareProjectButton projectTitle={project.title} slug={project.slug} />
          </div>
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
            <CaseStudyLayerTooltip kind="cost" layers={costTooltipLayers} />
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
            <CaseStudyLayerTooltip kind="tech" layers={techTooltipLayers} />
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
        <CaseStudyHeroImage
          src={project.image}
          alt={project.altText || project.title}
        />
      )}

      {/* 01. CASE STUDY PLAN: Problem, Approach, Gantt Chart & Execution Phases */}
      {(dossier.challengeText ||
        dossier.solutionText ||
        dossier.caseStudyPlanText ||
        dossier.gantt.tracks.length > 0 ||
        project.phases.length > 0) && (
        <PageSection
          number={0}
          eyebrow={sections?.problem?.eyebrow || 'Case Study Plan'}
          krEyebrow={sections?.problem?.krEyebrow}
          title={sections?.problem?.title || 'The brief and execution'}
          accent={sections?.problem?.accent || 'plan.'}
          description={
            sections?.problem?.description ||
            'Problem definition, architectural direction, Gantt schedule, and step-by-step milestone execution.'
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
              <h3 className="text-xs font-medium text-muted">Execution &amp; research plan</h3>
              <p className="mt-3 text-sm md:text-[15px] text-ink-secondary leading-relaxed whitespace-pre-line">
                {dossier.caseStudyPlanText}
              </p>
            </article>
          )}

          <ProjectGanttChart gantt={dossier.gantt} projectTitle={project.title} />

          <ProjectPhaseRoadmap
            phases={project.phases}
            projectTitle={project.title}
            headingTitle={
              sections?.phases?.title
                ? `${sections.phases.title} ${sections.phases.accent ?? ''}`.trim()
                : undefined
            }
          />
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
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Release state</dt>
                <dd
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusVisual.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusVisual.dotClass}`} aria-hidden="true" />
                  <span>
                    {secondaryStageLabel
                      ? `${statusVisual.lifecycle} · ${secondaryStageLabel}`
                      : statusVisual.lifecycle}
                  </span>
                </dd>
              </div>
            </dl>
          </article>

          <article className="apple-card p-6 md:p-7 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Cost breakdown</span>
                <CaseStudyLayerTooltip
                  kind="cost"
                  size="md"
                  align="end"
                  layers={costTooltipLayers}
                />
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

      {/* 03. TECH STACK ARCHITECTURE, STRUCTURE, TOOLS & DELIVERED FEATURES */}
      {(dossier.techDetails.length > 0 ||
        project.features.length > 0 ||
        dossier.toolsUsed.length > 0) && (
        <PageSection
          number={2}
          eyebrow={sections?.details?.eyebrow || 'Architecture & Capabilities'}
          krEyebrow={sections?.details?.krEyebrow}
          title={sections?.details?.title || 'Tech stack, structure and'}
          accent={sections?.details?.accent || 'tools.'}
          description={
            sections?.details?.description ||
            'Each technology selected for its architectural responsibility, codebase structure, engineering tools used, and shipped capabilities.'
          }
        >
          {(dossier.techDetails.length > 0 || project.features.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
              {dossier.techDetails.length > 0 && (
                <article className="apple-card p-6 md:p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-muted">
                      {sections?.details?.secondaryLabel || 'Technology stack & roles'}
                    </h3>
                    <CaseStudyLayerTooltip
                      kind="tech"
                      size="md"
                      align="end"
                      layers={techTooltipLayers}
                    />
                  </div>
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
          )}

          {/* Project Structure & Tools Used */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <article className="apple-card p-6 md:p-7 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                  <FolderTree className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                  <span>Project structure</span>
                </div>
                <h3 className="text-base font-semibold text-ink tracking-tight">
                  {dossier.structure.architectureStyle}
                </h3>
              </div>

              <pre className="overflow-x-auto rounded-xl border border-line-hairline bg-overlay-faint px-4 py-3.5 font-mono text-[11px] sm:text-xs leading-relaxed text-ink">
                <code>{dossier.structure.tree}</code>
              </pre>

              <dl className="divide-y divide-line-hairline border-t border-line-hairline pt-2 text-xs">
                {dossier.structure.modules.map((mod) => (
                  <div
                    key={mod.path}
                    className="py-2.5 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                  >
                    <dt className="font-mono font-medium text-accent shrink-0 sm:w-32 truncate">
                      {mod.path}
                    </dt>
                    <dd className="text-ink-secondary leading-relaxed">{mod.purpose}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="apple-card p-6 md:p-7 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                  <Wrench className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                  <span>Tools &amp; engineering ecosystem</span>
                </div>
                <h3 className="text-base font-semibold text-ink tracking-tight">
                  Tools used across build &amp; delivery
                </h3>
              </div>

              <div className="space-y-5">
                {dossier.toolsUsed.map((group) => (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-hairline pb-1.5">
                      <h4 className="text-xs font-semibold text-ink tracking-tight">
                        {group.category}
                      </h4>
                      <span className="text-[11px] text-muted tabular-nums">
                        {group.items.length} {group.items.length === 1 ? 'tool' : 'tools'}
                      </span>
                    </div>

                    <ul className="space-y-2.5">
                      {group.items.map((tool) => (
                        <li key={tool.name} className="flex items-start gap-3 text-xs">
                          <span className="inline-block shrink-0 rounded-md border border-line-subtle bg-overlay-faint px-2 py-0.5 font-mono text-[11px] font-medium text-ink">
                            {tool.name}
                          </span>
                          <span className="text-ink-secondary leading-relaxed pt-0.5">
                            {tool.role}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
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
        previousHref={previousProject ? `/projects/${previousProject.slug}` : undefined}
        previousLabel={
          previousProject ? `Previous case study: ${previousProject.title}` : undefined
        }
        nextHref={nextProject ? `/projects/${nextProject.slug}` : undefined}
        nextLabel={nextProject ? `Next case study: ${nextProject.title}` : undefined}
      />
    </PageShell>
  )
}
