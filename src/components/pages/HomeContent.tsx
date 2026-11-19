import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Code2,
  Compass,
  FolderGit2,
  Github,
  ImageOff,
  Sparkles,
} from 'lucide-react'
import {
  getHeroSectionConfigResult,
  getHomepageSectionsConfigResult,
  getProfileContentResult,
  getPublishedCmsContentResult,
  type HomepageSectionsConfig,
} from '@/app/actions/content-cms'
import { getPublicProfileSettingsResult } from '@/app/actions/media'
import { EMPTY_SITE_CONFIG, getMediaCollections, getSiteConfig } from '@/lib/site-content'
import { getProjectsResult } from '@/lib/projects'
import { CMS_COLLECTIONS, SECTIONS, type SiteSectionDefinition } from '@/lib/cms-schema'
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

function dedupe<T>(items: T[], keyFn: (item: T) => string | number | undefined): T[] {
  const seen = new Set<string | number>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (key === undefined || key === '' || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * The homepage: hero, introduction, featured projects + technology distribution,
 * media shelf and GitHub status, in the fixed order from `SECTIONS`.
 *
 * It renders through the same page frame as every other public page — hero,
 * numbered section headers, rules and card components — so the home page reads
 * as the first page of one site rather than a separate experience. Section
 * numbers are derived from that registry and the published records, never typed.
 * A section with no published records keeps its place and shows its own empty state.
 */
export default async function HomeContent() {
  const [
    heroResult,
    sectionsResult,
    profileResult,
    projectsResult,
    socialLinksResult,
    siteResult,
    mediaCollectionsResult,
    publicSettingsResult,
  ] = await Promise.all([
    getHeroSectionConfigResult(),
    getHomepageSectionsConfigResult(),
    getProfileContentResult(),
    getProjectsResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
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
  const socialLinksRaw = socialLinksResult.status === 'ok' ? socialLinksResult.data : []
  const dataError = [socialLinksResult, siteResult].find(
    (result) => result.status === 'error',
  ) as { status: 'error'; message: string } | undefined

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

  const socialLinks = dedupe(
    socialLinksRaw.map((s) => ({
      id: s.id,
      label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
      href: typeof s.payload?.href === 'string' ? s.payload.href : '',
      handle: typeof s.payload?.handle === 'string' ? s.payload.handle : undefined,
    })),
    (s) => s.href || s.label,
  ).filter((s) => s.href)

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
  // A hero image set in the CMS keeps its place as the introduction portrait.
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
      // 1. ABOUT / INTRODUCTION
      case 'about': {
        const hasAbout = Boolean(
          profileText('summary') ||
            profileText('bio') ||
            portraitImage ||
            profileText('headline') ||
            socialLinks.length,
        )
        if (profileResult.status === 'error') {
          return <CmsErrorState message={profileResult.message} />
        }
        if (!hasAbout) {
          return (
            <EmptyState
              icon={Compass}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
              actionLabel={section.emptyState.actionLabel}
              actionHref={section.emptyState.actionHref}
            />
          )
        }

        return (
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

              {socialLinks.length > 0 && (
                <ul className="flex flex-wrap gap-2.5 pt-2 text-xs">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-3 py-1.5 text-ink-secondary transition-colors hover:border-line-medium hover:text-accent"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )
      }

      // 2. FEATURED PROJECTS & TECHNOLOGY DISTRIBUTION
      case 'projects': {
        if (projectsResult.status === 'error') {
          return <CmsErrorState message={projectsResult.message} />
        }
        if (featuredProjects.length === 0) {
          return (
            <EmptyState
              icon={FolderGit2}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
              actionLabel={section.emptyState.actionLabel}
              actionHref={section.emptyState.actionHref}
            />
          )
        }
        return (
          <div className="space-y-10 md:space-y-12">
            <FeaturedProjectsCollection
              projects={featuredProjects}
              previewCount={sectionMeta?.previewCount ?? PREVIEW_COUNT}
              viewAllHref={sectionMeta?.href || section.route}
              viewAllLabel={sectionMeta?.primaryLabel || uiStrings.projects.viewAll.en}
              ariaLabel={uiStrings.projects.featuredAria.en}
            />
            <HomeTechDistribution projects={projects} />
          </div>
        )
      }

      // 6. MEDIA PREVIEW
      case 'media': {
        const mediaError = mediaSections.find((entry) => entry.error)?.error
        if (mediaError) return <CmsErrorState message={mediaError} />
        if (mediaPreview.length === 0) {
          return (
            <EmptyState
              icon={ImageOff}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
              actionLabel={section.emptyState.actionLabel}
              actionHref={section.emptyState.actionHref}
            />
          )
        }
        return (
          <MediaShelf
            items={mediaPreview}
            viewAllHref={sectionMeta?.href || section.route}
            viewAllLabel={sectionMeta?.primaryLabel || uiStrings.home.viewAllMedia.en}
          />
        )
      }

      // 7. GITHUB STATUS
      case 'github': {
        if (publicSettingsResult.status === 'error') {
          return <CmsErrorState message={publicSettingsResult.message} />
        }
        if (!githubUsername) {
          return (
            <EmptyState
              icon={Github}
              message={section.emptyState.message}
              hint={section.emptyState.hint}
              actionLabel={section.emptyState.actionLabel}
              actionHref={section.emptyState.actionHref}
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
