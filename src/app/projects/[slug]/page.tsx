import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowUpRight, Calendar, CheckCircle2, Circle, Github, Layers, Target } from 'lucide-react'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { mapProjectRecords } from '@/lib/projects'
import { MetaChip, PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'

export const dynamic = 'force-dynamic'

const FALLBACK_TITLE = 'Project Case Study - Ashok Rimal'

async function findProject(slug: string) {
  const records = await getPublishedCmsContent('Projects')
  return mapProjectRecords(records).find((project) => project.slug === slug)
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const project = await findProject(params.slug)
  if (!project) return { title: FALLBACK_TITLE }
  return {
    title: `${project.title} — Case Study | Ashok Rimal`,
    description: project.challenge,
  }
}

export default async function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const project = await findProject(params.slug)
  if (!project) notFound()

  return (
    <PageShell>
      <PageHero
        eyebrow={`${project.category} Case Study`}
        krEyebrow="프로젝트 사례"
        title={project.title}
        description={project.challenge}
        meta={
          <>
            <MetaChip icon={Calendar}>{project.period || project.completionDate}</MetaChip>
            <MetaChip icon={CheckCircle2}>{project.status}</MetaChip>
            <MetaChip icon={Layers}>{project.phases.length || 0} delivery phases</MetaChip>
          </>
        }
        actions={
          <>
            {project.live && project.live !== '#' && (
              <a href={project.live} target="_blank" rel="noreferrer" className="apple-btn-primary">
                <span>View live product</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="apple-btn-secondary"
            >
              <Github className="w-3.5 h-3.5 text-muted" />
              <span>Source code</span>
            </a>
          </>
        }
      />

      <div className="mt-10 md:mt-14 apple-card overflow-hidden">
        <div className="relative aspect-[16/9] bg-overlay-faint">
          <Image
            src={project.image}
            alt={`${project.title} interface preview`}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            referrerPolicy="no-referrer"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <PageSection
        eyebrow="01 / Problem & Approach"
        krEyebrow="문제와 해결"
        title="The brief and the"
        accent="build."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="apple-card p-6 md:p-7">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Challenge
            </h3>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">{project.challenge}</p>
          </article>
          <article className="apple-card p-6 md:p-7">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Solution
            </h3>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">{project.solution}</p>
          </article>
        </div>
      </PageSection>

      {project.phases.length > 0 && (
        <PageSection
          eyebrow="02 / Delivery"
          krEyebrow="진행 단계"
          title="Phase by"
          accent="phase."
          description="The milestones that carried the build from concept to release."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.phases.map((phase, index) => (
              <article
                key={`${phase.phase}-${phase.name}`}
                className="apple-card p-5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">
                    {phase.phase || `0${index + 1}`}
                  </span>
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

      <PageSection
        eyebrow="03 / Details"
        krEyebrow="세부 사항"
        title="Capabilities and"
        accent="stack."
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <article className="apple-card p-6 md:p-7">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Key capabilities
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

          <article className="apple-card p-6 md:p-7">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Technologies
            </h3>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full border border-line-subtle bg-overlay px-3 py-1 text-[11px] font-medium text-ink-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </article>
        </div>
      </PageSection>

      <PageNav
        backHref="/projects"
        backLabel="All case studies"
        nextHref="/contact"
        nextLabel="Start a conversation"
      />
    </PageShell>
  )
}
