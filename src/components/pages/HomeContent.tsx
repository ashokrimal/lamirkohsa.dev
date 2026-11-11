import type { CSSProperties } from 'react'
import { Camera, Code2, Compass, FolderGit2, Github, ImageOff } from 'lucide-react'
import {
  getHeroSectionConfigResult,
  getHomepageSectionsConfigResult,
  getProfileContentResult,
  getPublishedCmsContentResult,
  type CmsRecord,
  type HomepageSectionsConfig,
} from '@/app/actions/content-cms'
import { getPublicProfileSettingsResult } from '@/app/actions/media'
import { EMPTY_SITE_CONFIG, getMediaCollections, getSiteConfig } from '@/lib/site-content'
import { getProjectsResult } from '@/lib/projects'
import { getGalleryResult } from '@/lib/gallery'
import {
  CMS_COLLECTIONS,
  CMS_SETTINGS_RECORDS,
  SECTIONS,
  type SiteSectionDefinition,
} from '@/lib/cms-schema'
import { getMediaSections } from '@/lib/media-content'
import { uiStrings } from '@/lib/ui-strings'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { PhotoCard } from '@/components/ui/PhotoCard'
import { MediaPoster } from '@/components/ui/MediaPoster'
import { HorizontalCollection } from '@/components/ui/HorizontalCollection'
import { HeroFacts } from '@/components/ui/HeroFacts'
import { Reveal } from '@/components/ui/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'

const PREVIEW_COUNT = 5

function mapTimeline(records: CmsRecord[]) {
  return records.map((record) => {
    const payload = record.payload || {}
    return {
      id: record.id,
      title: record.title,
      organization: typeof payload.organization === 'string' ? payload.organization : '',
      period: typeof payload.period === 'string' ? payload.period : '',
      location: typeof payload.location === 'string' ? payload.location : undefined,
      description: typeof payload.description === 'string' ? payload.description : '',
      highlights: Array.isArray(payload.highlights) ? (payload.highlights as string[]) : undefined,
    }
  })
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
 * The homepage: hero, introduction, gallery images, experience, education,
 * projects, media and GitHub status, in the fixed order from `SECTIONS`.
 * Section numbers and the hero's counts are derived from that registry and the
 * published records, never typed. A section with no published records keeps its
 * place and shows its own empty state.
 */
export default async function HomeContent() {
  const [
    heroResult,
    sectionsResult,
    profileResult,
    projectsResult,
    galleryResult,
    socialLinksResult,
    siteResult,
    mediaCollectionsResult,
    experienceResult,
    educationResult,
    publicSettingsResult,
  ] = await Promise.all([
    getHeroSectionConfigResult(),
    getHomepageSectionsConfigResult(),
    getProfileContentResult(),
    getProjectsResult(),
    getGalleryResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
    getSiteConfig(),
    getMediaCollections(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.experience),
    getPublishedCmsContentResult(CMS_COLLECTIONS.education),
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
  const galleryData = galleryResult.status === 'ok' ? galleryResult.data : []
  const profile = profileResult.status === 'ok' ? profileResult.data : {}
  const socialLinksRaw = socialLinksResult.status === 'ok' ? socialLinksResult.data : []
  const experienceRaw = experienceResult.status === 'ok' ? experienceResult.data : []
  const educationRaw = educationResult.status === 'ok' ? educationResult.data : []
  const dataError = [socialLinksResult, siteResult].find(
    (result) => result.status === 'error',
  ) as { status: 'error'; message: string } | undefined

  const mediaSections = await getMediaSections(mediaCollections)

  const heroImageUrl = typeof heroData.imageUrl === 'string' ? heroData.imageUrl : undefined
  const heroStyle = (heroImageUrl ? { '--hero-image': `url("${heroImageUrl}")` } : {}) as CSSProperties

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
      image: project.image,
      altText: project.altText,
      live: project.live,
      github: project.github,
      status: project.status,
      featured: project.featured,
      completionDate: project.completionDate,
      phases: project.phases,
    }))

  const galleryItems = dedupe(
    galleryData.map((photo) => ({
      id: photo.id,
      title: photo.title,
      imageUrl: photo.imageUrl,
      altText: photo.altText,
      category: photo.category,
      description: photo.description ?? '',
      location: photo.location,
    })),
    (photo) => photo.title || photo.imageUrl || photo.id,
  )

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
  const experience = mapTimeline(experienceRaw)
  const education = mapTimeline(educationRaw)
  const githubUsername =
    publicSettingsResult.status === 'ok' ? publicSettingsResult.data?.githubUsername || '' : ''

  const profileData = profile as Record<string, unknown>
  const profileText = (key: string) => {
    const raw = profileData[key]
    return typeof raw === 'string' && raw.trim() ? (raw as string) : undefined
  }
  const profileImage = profileText('avatarUrl') || profileText('imageUrl')

  // Hero numbers are derived from the projects actually shown, never typed in
  // the CMS, so the numbers can never disagree with the cards below them.
  const disciplineCount = new Set(
    featuredProjects
      .map((project) => project.category?.trim())
      .filter((category): category is string => Boolean(category)),
  ).size
  const heroStats =
    featuredProjects.length > 0
      ? [
          {
            label: uiStrings.hero.selectedProjects.en,
            value: String(featuredProjects.length).padStart(2, '0'),
          },
          ...(disciplineCount > 0
            ? [
                {
                  label: uiStrings.hero.disciplines.en,
                  value: String(disciplineCount).padStart(2, '0'),
                },
              ]
            : []),
        ]
      : undefined

  const renderSection = (section: SiteSectionDefinition, index: number) => {
    const sectionMeta = meta[section.id]

    switch (section.id) {
      // 1. ABOUT / INTRODUCTION
      case 'about': {
        const hasAbout = Boolean(
          profileText('summary') ||
            profileText('bio') ||
            profileImage ||
            profileText('headline') ||
            socialLinks.length,
        )
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? profileText('fullName') ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />

            {hasAbout ? (
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 md:gap-10 items-start">
                {profileImage && (
                  <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden border border-line-subtle bg-overlay-faint">
                    <img
                      src={profileImage}
                      alt={profileText('fullName') || ''}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="space-y-5 text-sm md:text-base text-muted leading-relaxed">
                  {profileText('summary') && (
                    <p className="text-lg md:text-2xl text-ink leading-relaxed tracking-tight">
                      {profileText('summary')}
                    </p>
                  )}
                  {profileText('bio') && <p>{profileText('bio')}</p>}

                  <div className="flex flex-wrap gap-3 pt-1 text-xs">
                    {profileText('headline') && (
                      <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle text-ink shadow-xs">
                        <Code2 className="w-3.5 h-3.5 text-accent" />
                        <span>{profileText('headline')}</span>
                      </span>
                    )}
                    {site.contact.location && (
                      <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle text-ink shadow-xs">
                        <Compass className="w-3.5 h-3.5 text-accent" />
                        <span>{site.contact.location}</span>
                      </span>
                    )}
                  </div>

                  {socialLinks.length > 0 && (
                    <ul className="flex flex-wrap gap-3 pt-2 text-xs">
                      {socialLinks.map((link) => (
                        <li key={link.id}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-subtle text-ink-secondary hover:text-accent hover:border-line-medium transition-colors"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : profileResult.status === 'error' ? (
              <div className="mt-8">
                <CmsErrorState message={profileResult.message} />
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState
                  icon={Compass}
                  message={section.emptyState.message}
                  hint={section.emptyState.hint}
                  actionLabel={section.emptyState.actionLabel}
                  actionHref={section.emptyState.actionHref}
                />
              </div>
            )}
          </section>
        )
      }

      // 2. PHOTOS / GALLERY
      case 'gallery': {
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />
            <div className="mt-8">
              {galleryResult.status === 'error' ? (
                <CmsErrorState message={galleryResult.message} />
              ) : galleryItems.length === 0 ? (
                <EmptyState
                  icon={Camera}
                  message={section.emptyState.message}
                  hint={section.emptyState.hint}
                  actionLabel={section.emptyState.actionLabel}
                  actionHref={section.emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={galleryItems.map((item) => (
                    <PhotoCard key={item.id} item={item} />
                  ))}
                  previewCount={sectionMeta?.previewCount ?? PREVIEW_COUNT}
                  viewAllHref={sectionMeta?.href || section.route}
                  viewAllLabel={sectionMeta?.primaryLabel || uiStrings.home.viewAllPhotographs.en}
                  ariaLabel={uiStrings.gallery.collectionAria.en}
                />
              )}
            </div>
          </section>
        )
      }

      // 3. EXPERIENCE
      case 'experience': {
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />
            <div className="mt-8">
              {experienceResult.status === 'error' ? (
                <CmsErrorState message={experienceResult.message} />
              ) : (
                <ExperienceTimeline
                  items={experience}
                  type="experience"
                  emptyMessage={section.emptyState.message}
                  emptyHint={section.emptyState.hint}
                  emptyActionLabel={section.emptyState.actionLabel}
                  emptyActionHref={section.emptyState.actionHref}
                />
              )}
            </div>
          </section>
        )
      }

      // 4. EDUCATION
      case 'education': {
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />
            <div className="mt-8">
              {educationResult.status === 'error' ? (
                <CmsErrorState message={educationResult.message} />
              ) : (
                <ExperienceTimeline
                  items={education}
                  type="education"
                  emptyMessage={section.emptyState.message}
                  emptyHint={section.emptyState.hint}
                  emptyActionLabel={section.emptyState.actionLabel}
                  emptyActionHref={section.emptyState.actionHref}
                />
              )}
            </div>
          </section>
        )
      }

      // 5. FEATURED PROJECTS
      case 'projects': {
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />

            <div className="mt-8">
              {projectsResult.status === 'error' ? (
                <CmsErrorState message={projectsResult.message} />
              ) : featuredProjects.length === 0 ? (
                <EmptyState
                  icon={FolderGit2}
                  message={section.emptyState.message}
                  hint={section.emptyState.hint}
                  actionLabel={section.emptyState.actionLabel}
                  actionHref={section.emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={featuredProjects.map((project) => (
                    <ProjectCard key={project.id ?? project.title} project={project} />
                  ))}
                  previewCount={sectionMeta?.previewCount ?? PREVIEW_COUNT}
                  viewAllHref={sectionMeta?.href || section.route}
                  viewAllLabel={sectionMeta?.primaryLabel || uiStrings.projects.viewAll.en}
                  ariaLabel={uiStrings.projects.featuredAria.en}
                />
              )}
            </div>
          </section>
        )
      }

      // 6. MEDIA PREVIEW
      case 'media': {
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />

            <div className="mt-8">
              {mediaSections.some((entry) => entry.error) ? (
                <CmsErrorState message={mediaSections.find((entry) => entry.error)?.error} />
              ) : mediaPreview.length === 0 ? (
                <EmptyState
                  icon={ImageOff}
                  message={section.emptyState.message}
                  hint={section.emptyState.hint}
                  actionLabel={section.emptyState.actionLabel}
                  actionHref={section.emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={mediaPreview.map(({ kind, item }) => (
                    <MediaPoster key={`${kind}-${item.id}`} kind={kind} item={item} />
                  ))}
                  previewCount={sectionMeta?.previewCount ?? PREVIEW_COUNT}
                  viewAllHref={sectionMeta?.href || section.route}
                  viewAllLabel={sectionMeta?.primaryLabel || uiStrings.home.viewAllMedia.en}
                  ariaLabel={uiStrings.media.previewAria.en}
                />
              )}
            </div>
          </section>
        )
      }

      // 7. GITHUB STATUS
      case 'github': {
        return (
          <section key={section.id} className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              number={index}
              eyebrow={sectionMeta?.eyebrow}
              krEyebrow={sectionMeta?.kr}
              title={sectionMeta?.title ?? section.label}
              accent={sectionMeta?.accent}
              description={sectionMeta?.description}
            />
            <div className="mt-8">
              {publicSettingsResult.status === 'error' ? (
                <CmsErrorState message={publicSettingsResult.message} />
              ) : githubUsername ? (
                <GitHubActivitySparkline username={githubUsername} showRecentCommits={false} />
              ) : (
                <EmptyState
                  icon={Github}
                  message={section.emptyState.message}
                  hint={section.emptyState.hint}
                  actionLabel={section.emptyState.actionLabel}
                  actionHref={section.emptyState.actionHref}
                />
              )}
            </div>
          </section>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="portfolio-home home-redesign">
      <section className="hero-section shell-width" style={heroStyle} aria-labelledby="hero-heading">
        <div className="hero-editorial">
          <div className="hero-copy-block">
            {heroResult.status === 'error' ? (
              <div className="max-w-xl">
                <CmsErrorState message={heroResult.message} />
              </div>
            ) : heroData.heading ? (
              <h1 id="hero-heading" className="hero-heading">
                {heroData.heading.replace(/\.$/, '')}
                <span>.</span>
              </h1>
            ) : (
              <div className="max-w-xl">
                <EmptyState
                  icon={Compass}
                  message={CMS_SETTINGS_RECORDS.hero.emptyState.message}
                  hint={CMS_SETTINGS_RECORDS.hero.emptyState.hint}
                  actionLabel={CMS_SETTINGS_RECORDS.hero.emptyState.actionLabel}
                  actionHref={CMS_SETTINGS_RECORDS.hero.emptyState.actionHref}
                />
              </div>
            )}

            {heroData.subtitle && <p className="hero-subtitle">{heroData.subtitle}</p>}
          </div>

          <div className="hero-portrait">
            <div className="portrait-frame">
              {heroData.initials && (
                <span className="portrait-initials" aria-hidden="true">
                  {heroData.initials}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hero-meta">
          <span>{uiStrings.hero.scrollHint.en}</span>
          <span>{uiStrings.hero.metaRight(1, SECTIONS.length)}</span>
        </div>
      </section>

      <HeroFacts stats={heroStats} location={heroData.location} />

      <div className="shell-width">
        {(sectionsResult.status === 'error' || dataError) && (
          <CmsErrorState
            message={
              sectionsResult.status === 'error' ? sectionsResult.message : dataError?.message
            }
            className="mt-10"
          />
        )}
        {SECTIONS.map((section, index) => (
          <Reveal key={section.id}>{renderSection(section, index)}</Reveal>
        ))}
      </div>
    </div>
  )
}
