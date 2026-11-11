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
import { getPublicProfileSettings } from '@/app/actions/media'
import { EMPTY_SITE_CONFIG, getMediaCollections, getSiteConfig } from '@/lib/site-content'
import { getProjectsResult } from '@/lib/projects'
import { getGalleryResult } from '@/lib/gallery'
import { CMS_COLLECTIONS, CMS_SCHEMA, CMS_SETTINGS_RECORDS } from '@/lib/cms-schema'
import { getMediaSections } from '@/lib/media-content'
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

/** Structural sections the homepage owns; CMS order wins, missing ones append. */
const DEFAULT_SECTION_ORDER = ['about', 'gallery', 'experience', 'education', 'projects', 'media', 'github']

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
 * projects, media and GitHub status. Structure is always present; sections with
 * no published CMS records show an empty state with an admin action instead of
 * fabricated content.
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
    publicSettings,
  ] = await Promise.all([
    getHeroSectionConfigResult(),
    getHomepageSectionsConfigResult(),
    getProfileContentResult(),
    getProjectsResult(),
    getGalleryResult(PREVIEW_COUNT),
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
    getSiteConfig(),
    getMediaCollections(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.experience),
    getPublishedCmsContentResult(CMS_COLLECTIONS.education),
    getPublicProfileSettings(),
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

  const featuredProjects: ProjectData[] = projects
    .filter((project) => project.featured === true)
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

  const { enabled = {} } = sectionsConfig
  const configuredOrder = sectionsConfig.order || []
  const order = [
    ...configuredOrder,
    ...DEFAULT_SECTION_ORDER.filter((key) => !configuredOrder.includes(key)),
  ].filter((sectionKey) => sectionKey !== 'contact')
  const meta = sectionsConfig.sectionMeta || {}
  const experience = mapTimeline(experienceRaw)
  const education = mapTimeline(educationRaw)
  const githubUsername = publicSettings?.githubUsername || ''

  const profileData = profile as Record<string, unknown>
  const profileText = (key: string) => {
    const raw = profileData[key]
    return typeof raw === 'string' && raw.trim() ? (raw as string) : undefined
  }
  const profileImage = profileText('avatarUrl') || profileText('imageUrl')

  const renderSection = (key: string) => {
    if (enabled[key] === false) return null

    switch (key) {
      // 1. ABOUT / INTRODUCTION
      case 'about': {
        const hasAbout = Boolean(
          profileText('summary') || profileText('bio') || profileImage || profileText('headline') || socialLinks.length,
        )
        return (
          <section key="about" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.about?.eyebrow}
              krEyebrow={meta.about?.kr}
              title={meta.about?.title ?? profileText('fullName') ?? CMS_SCHEMA.sections.home.about.label}
              accent={meta.about?.accent}
              description={meta.about?.description}
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
                  message={CMS_SCHEMA.sections.home.about.emptyState.message}
                  hint={CMS_SCHEMA.sections.home.about.emptyState.hint}
                  actionLabel={CMS_SCHEMA.sections.home.about.emptyState.actionLabel}
                  actionHref={CMS_SCHEMA.sections.home.about.emptyState.actionHref}
                />
              </div>
            )}
          </section>
        )
      }

      // 2. PHOTOS / GALLERY
      case 'gallery': {
        return (
          <section key="gallery" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.gallery?.eyebrow}
              krEyebrow={meta.gallery?.kr}
              title={meta.gallery?.title ?? CMS_SCHEMA.sections.home.gallery.label}
              accent={meta.gallery?.accent}
              description={meta.gallery?.description}
            />
            <div className="mt-8">
              {galleryResult.status === 'error' ? (
                <CmsErrorState message={galleryResult.message} />
              ) : galleryItems.length === 0 ? (
                <EmptyState
                  icon={Camera}
                  message={CMS_SCHEMA.sections.home.gallery.emptyState.message}
                  hint={CMS_SCHEMA.sections.home.gallery.emptyState.hint}
                  actionLabel={CMS_SCHEMA.sections.home.gallery.emptyState.actionLabel}
                  actionHref={CMS_SCHEMA.sections.home.gallery.emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={galleryItems.map((item) => (
                    <PhotoCard key={item.id} item={item} />
                  ))}
                  previewCount={meta.gallery?.previewCount ?? PREVIEW_COUNT}
                  viewAllHref={meta.gallery?.href || '/about/gallery'}
                  viewAllLabel={meta.gallery?.primaryLabel || 'View all photographs'}
                  ariaLabel="Photography collection"
                />
              )}
            </div>
          </section>
        )
      }

      // 3. EXPERIENCE
      case 'experience': {
        return (
          <section key="experience" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.experience?.eyebrow}
              krEyebrow={meta.experience?.kr}
              title={meta.experience?.title ?? CMS_SCHEMA.sections.home.experience.label}
              accent={meta.experience?.accent}
              description={meta.experience?.description}
            />
            <div className="mt-8">
              {experienceResult.status === 'error' ? (
                <CmsErrorState message={experienceResult.message} />
              ) : (
                <ExperienceTimeline
                  items={experience}
                  type="experience"
                  emptyMessage={CMS_SCHEMA.sections.home.experience.emptyState.message}
                  emptyHint={CMS_SCHEMA.sections.home.experience.emptyState.hint}
                  emptyActionLabel={CMS_SCHEMA.sections.home.experience.emptyState.actionLabel}
                  emptyActionHref={CMS_SCHEMA.sections.home.experience.emptyState.actionHref}
                />
              )}
            </div>
          </section>
        )
      }

      // 4. EDUCATION
      case 'education': {
        return (
          <section key="education" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.education?.eyebrow}
              krEyebrow={meta.education?.kr}
              title={meta.education?.title ?? CMS_SCHEMA.sections.home.education.label}
              accent={meta.education?.accent}
              description={meta.education?.description}
            />
            <div className="mt-8">
              {educationResult.status === 'error' ? (
                <CmsErrorState message={educationResult.message} />
              ) : (
                <ExperienceTimeline
                  items={education}
                  type="education"
                  emptyMessage={CMS_SCHEMA.sections.home.education.emptyState.message}
                  emptyHint={CMS_SCHEMA.sections.home.education.emptyState.hint}
                  emptyActionLabel={CMS_SCHEMA.sections.home.education.emptyState.actionLabel}
                  emptyActionHref={CMS_SCHEMA.sections.home.education.emptyState.actionHref}
                />
              )}
            </div>
          </section>
        )
      }

      // 5. FEATURED PROJECTS
      case 'projects': {
        return (
          <section key="projects" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.projects?.eyebrow}
              krEyebrow={meta.projects?.kr}
              title={meta.projects?.title ?? CMS_SCHEMA.sections.home.projects.label}
              accent={meta.projects?.accent}
              description={meta.projects?.description}
            />

            <div className="mt-8">
              {projectsResult.status === 'error' ? (
                <CmsErrorState message={projectsResult.message} />
              ) : featuredProjects.length === 0 ? (
                <EmptyState
                  icon={FolderGit2}
                  message={CMS_SCHEMA.sections.home.projects.emptyState.message}
                  hint={CMS_SCHEMA.sections.home.projects.emptyState.hint}
                  actionLabel={CMS_SCHEMA.sections.home.projects.emptyState.actionLabel}
                  actionHref={CMS_SCHEMA.sections.home.projects.emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={featuredProjects.map((project) => (
                    <ProjectCard key={project.id ?? project.title} project={project} />
                  ))}
                  previewCount={meta.projects?.previewCount ?? PREVIEW_COUNT}
                  viewAllHref={meta.projects?.href || '/projects'}
                  viewAllLabel={meta.projects?.primaryLabel || 'View all projects'}
                  ariaLabel="Featured projects"
                />
              )}
            </div>
          </section>
        )
      }

      // 6. MEDIA PREVIEW
      case 'media': {
        return (
          <section key="media" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.media?.eyebrow}
              krEyebrow={meta.media?.kr}
              title={meta.media?.title ?? CMS_SCHEMA.sections.home.media.label}
              accent={meta.media?.accent}
              description={meta.media?.description}
            />

            <div className="mt-8">
              {mediaSections.some((section) => section.error) ? (
                <CmsErrorState
                  message={mediaSections.find((section) => section.error)?.error}
                />
              ) : mediaPreview.length === 0 ? (
                <EmptyState
                  icon={ImageOff}
                  message={CMS_SCHEMA.sections.home.media.emptyState.message}
                  hint={CMS_SCHEMA.sections.home.media.emptyState.hint}
                  actionLabel={CMS_SCHEMA.sections.home.media.emptyState.actionLabel}
                  actionHref={CMS_SCHEMA.sections.home.media.emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={mediaPreview.map(({ kind, item }) => (
                    <MediaPoster key={`${kind}-${item.id}`} kind={kind} item={item} />
                  ))}
                  previewCount={meta.media?.previewCount ?? PREVIEW_COUNT}
                  viewAllHref={meta.media?.href || '/media'}
                  viewAllLabel={meta.media?.primaryLabel || 'View all media'}
                  ariaLabel="Media preview"
                />
              )}
            </div>
          </section>
        )
      }

      // 7. GITHUB STATUS
      case 'github': {
        return (
          <section key="github" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.github?.eyebrow}
              krEyebrow={meta.github?.kr}
              title={meta.github?.title ?? CMS_SCHEMA.sections.home.github.label}
              accent={meta.github?.accent}
              description={meta.github?.description}
            />
            <div className="mt-8">
              {githubUsername ? (
                <GitHubActivitySparkline username={githubUsername} showRecentCommits={false} />
              ) : (
                <EmptyState
                  icon={Github}
                  message={CMS_SCHEMA.sections.home.github.emptyState.message}
                  hint={CMS_SCHEMA.sections.home.github.emptyState.hint}
                  actionLabel={CMS_SCHEMA.sections.home.github.emptyState.actionLabel}
                  actionHref={CMS_SCHEMA.sections.home.github.emptyState.actionHref}
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

        {(heroData.metaLeft || heroData.metaRight) && (
          <div className="hero-meta">
            <span>{heroData.metaLeft}</span>
            <span>{heroData.metaRight}</span>
          </div>
        )}
      </section>

      <HeroFacts stats={heroData.stats} location={heroData.location} />

      <div className="shell-width">
        {(sectionsResult.status === 'error' || dataError) && (
          <CmsErrorState
            message={
              sectionsResult.status === 'error' ? sectionsResult.message : dataError?.message
            }
            className="mt-10"
          />
        )}
        {order.map((sectionKey) => (
          <Reveal key={sectionKey}>{renderSection(sectionKey)}</Reveal>
        ))}
      </div>
    </div>
  )
}
