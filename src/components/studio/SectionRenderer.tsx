import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Code2, Compass, Film, FolderGit2, Github, PieChart, Sparkles, User } from 'lucide-react'
import { getProfileContentResult } from '@/app/actions/content-cms'
import { getPublicProfileSettingsResult } from '@/app/actions/media'
import { getMediaCollections } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'
import { getProjectsResult } from '@/lib/projects'
import { getPublishedProjects, type StudioProject } from '@/lib/studio/data'
import { uiStrings } from '@/lib/ui-strings'
import { MediaShelf, type MediaShelfEntry } from '@/components/ui/MediaShelf'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'
import { HomeTechDistribution } from '@/components/projects/HomeTechDistribution'
import { MetaChip, PageSection } from '@/components/ui/PageChrome'
import { Reveal } from '@/components/ui/Reveal'
import type { SectionContent } from '@/lib/studio/sections'
import type { StudioPageSection } from '@/lib/studio/data'
import { MediaCollectionsBody } from '@/components/media/MediaHomeContent'
import {
  ContactSectionBody,
  ExperienceSectionBody,
  InterestsSectionBody,
  SkillsSectionBody,
  SocialsSectionBody,
  TechnologySectionBody,
} from '@/components/studio/SectionBodies'

/**
 * Section bodies for studio-managed pages.
 *
 * `SectionRenderer` owns the heading chrome and the enabled/order logic; these
 * components render only the body. Each one loads its own records on the
 * server, so a section can be moved or hidden without touching another one.
 */

function profileValue(profile: Record<string, unknown>, key: string) {
  const raw = profile[key]
  return typeof raw === 'string' && raw.trim() ? raw : undefined
}

export async function IntroductionSectionBody({ content }: { content: SectionContent }) {
  const [profileResult, projectsResult] = await Promise.all([
    getProfileContentResult(),
    getProjectsResult(),
  ])

  if (profileResult.status === 'error') return <CmsErrorState message={profileResult.message} />

  const profile = (profileResult.status === 'ok' ? profileResult.data : {}) as Record<string, unknown>
  const projects = projectsResult.status === 'ok' ? projectsResult.data : []
  const portrait = profileValue(profile, 'avatarUrl') || profileValue(profile, 'imageUrl') || content.imageUrl
  const summary = profileValue(profile, 'summary')
  const bio = profileValue(profile, 'bio')
  const headline = profileValue(profile, 'headline')
  const location = profileValue(profile, 'location')
  const availability = profileValue(profile, 'availability')
  const displayName = profileValue(profile, 'fullName') || ''

  if (!summary && !bio && !portrait && !content.description) {
    return (
      <EmptyState
        eyebrow="Introduction"
        icon={User}
        message="No introduction published yet."
        hint="Publish a biography in the studio to fill this section."
      />
    )
  }

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        {portrait && (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-line-subtle bg-overlay-faint">
            <Image
              src={portrait}
              alt={content.imageAlt || displayName || 'Portrait'}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="space-y-5 text-sm leading-relaxed text-muted md:text-base">
          {summary && (
            <p className="text-lg leading-relaxed tracking-tight text-ink md:text-2xl">{summary}</p>
          )}
          {content.description && content.description !== summary && <p>{content.description}</p>}
          {bio && <p>{bio}</p>}
          {(headline || location || availability) && (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {headline && <MetaChip icon={Code2}>{headline}</MetaChip>}
              {location && <MetaChip icon={Compass}>{location}</MetaChip>}
              {availability && <MetaChip icon={Sparkles}>{availability}</MetaChip>}
            </div>
          )}
        </div>
      </div>

      {projects.length > 0 && content.animation?.enabled !== false ? (
        <HomeTechDistribution projects={projects} />
      ) : projectsResult.status !== 'error' ? (
        <EmptyState
          eyebrow="Stack Telemetry"
          icon={PieChart}
          message="No technology distribution data yet."
          hint="Technology weights appear once published projects include stack tags."
        />
      ) : null}
    </div>
  )
}

function studioToCard(project: StudioProject) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    summary: project.summary,
    techStack: project.techStack,
    image: project.coverMediaUrl,
    featured: project.featuredOrder !== undefined,
    description: project.summary,
  }
}

function clampHomeCardCount(raw?: number, fallback = 4): number {
  const value = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : fallback
  return Math.min(4, Math.max(3, value))
}

export async function ProjectsSectionBody({
  content,
  previewCount,
}: {
  content: SectionContent
  previewCount?: number
}) {
  const targetCount = clampHomeCardCount(previewCount ?? content.previewCount, 4)
  const studioProjects = await getPublishedProjects()
  // Before the seed has run, keep showing the case studies the site already has.
  const legacyResult = studioProjects.length === 0 ? await getProjectsResult() : null
  const legacyList = legacyResult?.status === 'ok' ? legacyResult.data : []

  if (studioProjects.length === 0 && legacyList.length === 0) {
    return (
      <EmptyState
        eyebrow="Selected Works"
        icon={FolderGit2}
        message="No projects published yet."
        hint="Publish a case study in the studio to fill this section."
      />
    )
  }

  const orderedStudio =
    studioProjects.length > 0
      ? [
          ...studioProjects.filter((project) => project.featuredOrder !== undefined),
          ...studioProjects.filter((project) => project.featuredOrder === undefined),
        ]
      : []

  const orderedLegacy =
    legacyList.length > 0
      ? [
          ...legacyList.filter((project) => project.featured),
          ...legacyList.filter((project) => !project.featured),
        ]
      : []

  const cards =
    orderedStudio.length > 0
      ? orderedStudio.slice(0, targetCount).map(studioToCard)
      : orderedLegacy.slice(0, targetCount).map((project) => ({
          id: project.id,
          title: project.title,
          slug: project.slug,
          category: project.category,
          summary: project.summary ?? project.description,
          techStack: project.techStack,
          image: project.image,
          featured: project.featured,
        }))

  const hrefFor = (slug: string) => (studioProjects.length > 0 ? `/work/${slug}` : `/projects/${slug}`)
  const gridColsClass = cards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div className={`grid grid-cols-1 gap-5 ${gridColsClass}`}>
      {cards.map((project) => (
        <Link
          key={`${project.slug}-${project.id}`}
          href={hrefFor(project.slug)}
          className="group apple-card flex flex-col gap-4 p-5 transition-colors hover:border-line-medium md:p-6"
        >
          {project.image && (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line-hairline bg-overlay-faint">
              <ProgressiveImage
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-muted">
            {project.category && <span>{project.category}</span>}
            {project.featured && (
              <span className="rounded-full border border-line-subtle px-2 py-0.5 text-accent">
                Featured
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-ink group-hover:text-accent md:text-xl">
            {project.title}
          </h3>
          {project.summary && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
          )}
          {project.techStack.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {project.techStack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-line-subtle bg-overlay-faint px-2 py-0.5 text-[10px] font-medium text-ink-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent">
            Read the case study
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}

export async function MediaSectionBody({ content }: { content?: SectionContent }) {
  const collectionsResult = await getMediaCollections()
  if (collectionsResult.status === 'error') {
    return <CmsErrorState message={collectionsResult.message} />
  }
  const collections = collectionsResult.status === 'ok' ? collectionsResult.data : []
  const sections = await getMediaSections(collections)
  const error = sections.find((entry) => entry.error)?.error
  if (error) return <CmsErrorState message={error} />

  const targetCount = clampHomeCardCount(content?.previewCount, 4)

  // Interleave items round-robin across non-empty categories so 3–4 shelf cards represent varied media
  const activeSections = sections.filter((section) => section.items.length > 0)
  const items: MediaShelfEntry[] = []
  let round = 0
  while (items.length < targetCount) {
    let addedInRound = false
    for (const section of activeSections) {
      const candidate = section.items[round]
      if (candidate) {
        items.push({ kind: section.kind, item: candidate })
        addedInRound = true
        if (items.length >= targetCount) break
      }
    }
    if (!addedInRound) break
    round += 1
  }

  if (items.length === 0) {
    return (
      <EmptyState
        eyebrow="Media Archive"
        icon={Film}
        message="No media items published yet."
        hint="Recently logged music, films, anime, and manga appear here once published."
      />
    )
  }

  return <MediaShelf items={items} limit={targetCount} />
}

export async function GithubSectionBody({ content }: { content: SectionContent }) {
  const settingsResult = await getPublicProfileSettingsResult()
  if (settingsResult.status === 'error') {
    return <CmsErrorState message={settingsResult.message} />
  }
  const username = content.username || (settingsResult.status === 'ok' ? settingsResult.data?.githubUsername : '')
  if (!username) {
    return (
      <EmptyState
        eyebrow="GitHub Activity"
        icon={Github}
        message="GitHub status is not connected yet."
        hint="Add a GitHub username in the studio to stream public activity here."
      />
    )
  }
  return <GitHubActivitySparkline username={username} showRecentCommits={false} />
}

/**
 * Renders enabled sections in `sort_order`, skipping unknown keys. The heading
 * chrome always carries a CTA, so every section has a working next step.
 */
export async function SectionRenderer({ sections }: { sections: StudioPageSection[] }) {
  const visible = sections
    .filter((section) => section.isEnabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (visible.length === 0) {
    return (
      <p className="mt-12 rounded-xl border border-dashed border-line-subtle px-5 py-6 text-sm text-muted">
        This page has no sections enabled. Add or enable sections in Studio → Pages.
      </p>
    )
  }

  return (
    <div>
      {visible.map((section, index) => {
        const content = section.content as SectionContent
        const body = (() => {
          switch (section.sectionKey) {
            case 'introduction':
              return <IntroductionSectionBody content={content} />
            case 'projects':
              return (
                <ProjectsSectionBody
                  content={content}
                  previewCount={content.previewCount ?? 4}
                />
              )
            case 'media':
              return content.layout === 'index' ? (
                <MediaCollectionsBody />
              ) : (
                <MediaSectionBody content={content} />
              )
            case 'github':
              return <GithubSectionBody content={content} />
            case 'education':
              return <ExperienceSectionBody kind="education" />
            case 'experience':
              return <ExperienceSectionBody kind="experience" />
            case 'skills':
              return <SkillsSectionBody />
            case 'interests':
              return <InterestsSectionBody />
            case 'socials':
              return <SocialsSectionBody />
            case 'technology':
              return <TechnologySectionBody />
            case 'contact':
              return <ContactSectionBody />
            default:
              return null
          }
        })()

        if (!body) return null

        const sectionNode = (
          <PageSection
            key={section.sectionKey}
            id={section.sectionKey}
            number={index}
            eyebrow={content.eyebrow}
            krEyebrow={content.krEyebrow}
            title={content.title ?? section.sectionKey}
            accent={content.accent}
            description={content.description}
            linkHref={content.ctaHref}
            linkLabel={content.ctaLabel || uiStrings.projects.viewAll.en}
          >
            {body}
          </PageSection>
        )

        // The CMS can disable motion per section; reduced-motion is handled by Reveal.
        return content.animation?.enabled === false ? (
          <div key={section.sectionKey}>{sectionNode}</div>
        ) : (
          <Reveal key={section.sectionKey}>{sectionNode}</Reveal>
        )
      })}
    </div>
  )
}
