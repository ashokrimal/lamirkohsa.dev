import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Code2,
  Compass,
  Film,
  FolderGit2,
  Github,
  PieChart,
  Sparkles,
  User,
} from 'lucide-react'
import {
  getHeroSectionConfigResult,
  getHomepageSectionsConfigResult,
  getProfileContentResult,
  type HomepageSectionsConfig,
} from '@/app/actions/content-cms'
import { getPublicProfileSettingsResult } from '@/app/actions/media'
import { EMPTY_SITE_CONFIG, getMediaCollections, getSiteConfig } from '@/lib/site-content'
import { getProjectsResult } from '@/lib/projects'
import { CMS_SETTINGS_RECORDS, SECTIONS, type SiteSectionDefinition } from '@/lib/cms-schema'
import { getMediaSections } from '@/lib/media-content'
import { uiStrings } from '@/lib/ui-strings'
import { type ProjectData } from '@/components/ui/ProjectCard'
import { FeaturedProjectsCollection } from '@/components/projects/FeaturedProjectsCollection'
import { HomeTechDistribution } from '@/components/projects/HomeTechDistribution'
import { MediaShelf } from '@/components/ui/MediaShelf'
import { Reveal } from '@/components/ui/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'
import { MetaChip, PageHero, PageSection, PageShell } from '@/components/ui/PageChrome'

const PREVIEW_COUNT = 5

/** The link each home section offers beside its heading. */
const SECTION_LINKS: Record<string, { href: string; label: string }> = {
  about: { href: '/about', label: 'Read more' },
  projects: { href: '/projects', label: 'All projects' },
  media: { href: '/media', label: 'Open media' },
  github: { href: '/about/github', label: 'GitHub activity' },
}

/**
 * The homepage: hero, introduction + compact technology distribution,
 * featured projects, media shelf and GitHub status, in the fixed order from `SECTIONS`.
 */
export default async function HomeContent() {
  const [
    heroResult,
    sectionsResult,
    profileResult,
    projectsResult,
    siteResult,
    mediaCollectionsResult,
    publicSettingsResult,
  ] = await Promise.all([
    getHeroSectionConfigResult(),
    getHomepageSectionsConfigResult(),
    getProfileContentResult(),
    getProjectsResult({ fresh: true }),
    getSiteConfig(),
    getMediaCollections(),
    getPublicProfileSettingsResult(),
  ])

  const heroData = heroResult.status === 'ok' ? heroResult.data : {}
  const sectionsConfig: HomepageSectionsConfig =
    sectionsResult.status === 'ok'
      ? sectionsResult.data
      : { order: [], enabled: {}, sectionMeta: {} }
  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG
  const mediaCollections = mediaCollectionsResult.status === 'ok' ? mediaCollectionsResult.data : []
  const projects = projectsResult.status === 'ok' ? projectsResult.data : []
  const profile = profileResult.status === 'ok' ? profileResult.data : {}
  const dataError = siteResult.status === 'error' ? siteResult : undefined

  const mediaSections = await getMediaSections(mediaCollections)

  const heroImageUrl = typeof heroData.imageUrl === 'string' ? heroData.imageUrl : undefined
  const heroImageAlt =
    typeof heroData.imageAlt === 'string' && heroData.imageAlt.trim()
      ? heroData.imageAlt
      : undefined

  // Featured projects lead the row; if nothing is featured yet, published
  // projects fill it so the section never claims there is no work.
  const projectCandidates = projects.some((project) => project.featured)
    ? projects.filter((project) => project.featured)
    : projects

  const featuredProjects: ProjectData[] = projectCandidates
    .slice(0, PREVIEW_COUNT)
    .map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      category: project.category,
      summary: project.summary,
      description: project.description,
      challenge: project.challenge,
      solution: project.solution,
      duration: project.duration,
      cost: project.cost,
      model: project.model,
      features: project.features,
      techStack: project.techStack,
      techDefinitions: project.techDefinitions,
      image: project.image,
      altText: project.altText,
      live: project.live,
      github: project.github,
      status: project.status,
      featured: project.featured,
      completionDate: project.completionDate,
      phases: project.phases,
    }))

  const mediaPreview = mediaSections.flatMap((section) =>
    section.items.map((item) => ({ kind: section.kind, item, href: section.href })),
  )

  const meta = sectionsConfig.sectionMeta || {}
  const githubUsername =
    publicSettingsResult.status === 'ok' ? publicSettingsResult.data?.githubUsername || '' : ''

  const profileData = profile as Record<string, unknown>
  const profileText = (key: string) => {
    const raw = profileData[key]
    return typeof raw === 'string' && raw.trim() ? (raw as string) : undefined
  }
  const profileImage = profileText('avatarUrl') || profileText('imageUrl')
  const portraitImage = heroImageUrl || profileImage
  const displayName = profileText('fullName') || site.brand.name || ''
  const heroHeading = heroData.heading?.trim() || displayName
  const heroSubtitle = heroData.subtitle?.trim() || profileText('summary')
  const heroEyebrow = profileText('headline') || site.brand.role || 'Portfolio'
  const heroLocation =
    heroData.location?.trim() || profileText('location') || site.contact.location || ''
  const availability =
    profileText('availability') ||
    profileText('status') ||
    site.contact.availability ||
    site.footer.availabilityText

  const renderSectionBody = (section: SiteSectionDefinition) => {
    const sectionMeta = meta[section.id]

    switch (section.id) {
      // 1. ABOUT / INTRODUCTION + TECHNOLOGY DISTRIBUTION
      case 'about': {
        const hasAbout = Boolean(
          profileText('summary') ||
            profileText('bio') ||
            portraitImage ||
            profileText('headline'),
        )
        if (profileResult.status === 'error') {
          return <CmsErrorState message={profileResult.message} />
        }
        if (!hasAbout) {
          return (
            <EmptyState
              eyebrow="Introduction"
              icon={User}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
            />
          )
        }

        return (
          <div className="space-y-10 md:space-y-12">
            <div className="grid grid-cols-1 items-start gap-8 md:gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              {portraitImage && (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-line-subtle bg-overlay-faint">
                  <Image
                    src={portraitImage}
                    alt={heroImageAlt || displayName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="space-y-5 text-sm leading-relaxed text-muted md:text-base">
                {profileText('summary') && (
                  <p className="text-lg leading-relaxed tracking-tight text-ink md:text-2xl">
                    {profileText('summary')}
                  </p>
                )}
                {profileText('bio') && <p>{profileText('bio')}</p>}

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {profileText('headline') && (
                    <MetaChip icon={Code2}>{profileText('headline')}</MetaChip>
                  )}
                  {heroLocation && <MetaChip icon={Compass}>{heroLocation}</MetaChip>}
                  {availability && <MetaChip icon={Sparkles}>{availability}</MetaChip>}
                </div>
              </div>
            </div>

            {projects.length > 0 ? (
              <HomeTechDistribution projects={projects} />
            ) : projectsResult.status !== 'error' ? (
              <EmptyState
                eyebrow="Stack Telemetry"
                icon={PieChart}
                message="No technology distribution data yet."
                hint="Technology weights and category filters will populate once published projects include stack tags."
              />
            ) : null}
          </div>
        )
      }

      // 2. FEATURED PROJECTS (Fetched directly from CMS)
      case 'projects': {
        if (projectsResult.status === 'error') {
          return <CmsErrorState message={projectsResult.message} />
        }
        if (featuredProjects.length === 0) {
          return (
            <EmptyState
              eyebrow="Selected Works"
              icon={FolderGit2}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
            />
          )
        }
        return (
          <FeaturedProjectsCollection
            projects={featuredProjects}
            previewCount={sectionMeta?.previewCount ?? PREVIEW_COUNT}
            viewAllHref={sectionMeta?.href || section.route}
            viewAllLabel={sectionMeta?.primaryLabel || uiStrings.projects.viewAll.en}
            ariaLabel={uiStrings.projects.featuredAria.en}
          />
        )
      }

      // 3. MEDIA PREVIEW
      case 'media': {
        const mediaError = mediaSections.find((entry) => entry.error)?.error
        if (mediaError) return <CmsErrorState message={mediaError} />
        if (mediaPreview.length === 0) {
          return (
            <EmptyState
              eyebrow="Media Archive"
              icon={Film}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
            />
          )
        }
        return <MediaShelf items={mediaPreview} />
      }

      // 4. GITHUB STATUS
      case 'github': {
        if (publicSettingsResult.status === 'error') {
          return <CmsErrorState message={publicSettingsResult.message} />
        }
        if (!githubUsername) {
          return (
            <EmptyState
              eyebrow="GitHub Activity"
              icon={Github}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
            />
          )
        }
        return <GitHubActivitySparkline username={githubUsername} showRecentCommits={false} />
      }

      default:
        return null
    }
  }

  return (
    <PageShell>
      {heroResult.status === 'error' ? (
        <CmsErrorState message={heroResult.message} />
      ) : !heroHeading && !heroSubtitle ? (
        <div className="pt-8 md:pt-12">
          <EmptyState
            eyebrow="Hero"
            icon={Compass}
            message={CMS_SETTINGS_RECORDS.hero.emptyState.message}
            hint={CMS_SETTINGS_RECORDS.hero.emptyState.hint}
          />
        </div>
      ) : (
        <PageHero
          eyebrow={heroEyebrow}
          title={heroHeading.replace(/\.$/, '')}
          description={heroSubtitle}
          meta={
            heroLocation || availability ? (
              <>
                {heroLocation && <MetaChip icon={Compass}>{heroLocation}</MetaChip>}
                {availability && <MetaChip icon={Sparkles}>{availability}</MetaChip>}
              </>
            ) : undefined
          }
          actions={
            <>
              <Link href="/projects" className="apple-btn-primary">
                <span>View projects</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="apple-btn-secondary">
                <span>Get in touch</span>
              </Link>
            </>
          }
        />
      )}

      {(sectionsResult.status === 'error' || dataError) && (
        <CmsErrorState
          message={
            sectionsResult.status === 'error' ? sectionsResult.message : dataError?.message
          }
          className="mt-10"
        />
      )}

      <div>
        {SECTIONS.map((section, index) => {
          const sectionMeta = meta[section.id]
          const link = SECTION_LINKS[section.id]

          return (
            <Reveal key={section.id}>
              <PageSection
                id={section.id}
                number={index}
                eyebrow={sectionMeta?.eyebrow ?? section.label}
                krEyebrow={sectionMeta?.kr}
                title={sectionMeta?.title ?? section.label}
                accent={sectionMeta?.accent}
                description={sectionMeta?.description}
                linkHref={sectionMeta?.href || link?.href || section.route}
                linkLabel={sectionMeta?.primaryLabel || link?.label || 'View all'}
              >
                {renderSectionBody(section)}
              </PageSection>
            </Reveal>
          )
        })}
      </div>
    </PageShell>
  )
}
