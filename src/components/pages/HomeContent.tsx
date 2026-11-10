import type { CSSProperties } from 'react'
import { Compass, Code2 } from 'lucide-react'
import {
  getHeroSectionConfig,
  getHomepageSectionsConfig,
  getProfileContent,
  getFeaturedProjects,
  getGalleryItems,
  getSocialLinks,
} from '@/app/actions/content-cms'
import { getMediaCollections, getPageCopy, getSiteConfig } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { PhotoCard } from '@/components/ui/PhotoCard'
import { MediaPoster } from '@/components/ui/MediaPoster'
import { HorizontalCollection } from '@/components/ui/HorizontalCollection'
import { ContactSection } from '@/components/ui/ContactSection'
import { HeroFacts } from '@/components/ui/HeroFacts'
import { Reveal } from '@/components/ui/Reveal'

const PREVIEW_COUNT = 5

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
 * The homepage: the existing hero, then Photos, About, Featured Projects, Media
 * and Contact. Order, visibility, copy and the number of preview cards all come
 * from the CMS; sections with no published records render nothing.
 */
export default async function HomeContent() {
  const [heroData, sectionsConfig, profile, featuredProjectsRaw, galleryItemsRaw, socialLinksRaw, site, copy, mediaCollections] =
    await Promise.all([
      getHeroSectionConfig(),
      getHomepageSectionsConfig(),
      getProfileContent(),
      getFeaturedProjects(PREVIEW_COUNT),
      getGalleryItems(PREVIEW_COUNT),
      getSocialLinks(),
      getSiteConfig(),
      getPageCopy(),
      getMediaCollections(),
    ])

  const mediaSections = await getMediaSections(mediaCollections)

  const heroImageUrl = typeof heroData.imageUrl === 'string' ? heroData.imageUrl : undefined
  const heroStyle = (heroImageUrl ? { '--hero-image': `url("${heroImageUrl}")` } : {}) as CSSProperties

  const featuredProjects: ProjectData[] = featuredProjectsRaw.map((p) => {
    const payload = p.payload || {}
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: typeof payload.category === 'string' ? payload.category : undefined,
      summary: typeof payload.summary === 'string' ? payload.summary : undefined,
      description: typeof payload.description === 'string' ? payload.description : '',
      techStack: Array.isArray(payload.techStack) ? (payload.techStack as string[]) : [],
      image:
        typeof payload.image === 'string'
          ? payload.image
          : typeof payload.imageUrl === 'string'
            ? payload.imageUrl
            : undefined,
      live: typeof payload.live === 'string' ? payload.live : undefined,
      github: typeof payload.github === 'string' ? payload.github : undefined,
      status: typeof payload.status === 'string' ? payload.status : undefined,
      featured: payload.featured === true,
      completionDate: typeof payload.completionDate === 'string' ? payload.completionDate : undefined,
      phases: Array.isArray(payload.phases) ? (payload.phases as ProjectData['phases']) : undefined,
    }
  })

  const galleryItems = dedupe(
    galleryItemsRaw.map((g) => ({
      id: g.id,
      title: g.title,
      imageUrl: typeof g.payload?.imageUrl === 'string' ? g.payload.imageUrl : '',
      category: typeof g.payload?.category === 'string' ? g.payload.category : undefined,
      description: typeof g.payload?.description === 'string' ? g.payload.description : '',
      location: typeof g.payload?.location === 'string' ? g.payload.location : undefined,
    })),
    (g) => g.title || g.imageUrl || g.id,
  ).filter((g) => g.imageUrl)

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

  const { order = [], enabled = {} } = sectionsConfig
  const meta = sectionsConfig.sectionMeta || {}

  const profileData = profile as Record<string, unknown>
  const profileText = (key: string) => {
    const raw = profileData[key]
    return typeof raw === 'string' && raw.trim() ? (raw as string) : undefined
  }
  const profileImage = profileText('avatarUrl') || profileText('imageUrl')

  const renderSection = (key: string) => {
    if (enabled[key] === false) return null

    switch (key) {
      // 1. PHOTOS / GALLERY
      case 'gallery': {
        if (galleryItems.length === 0) return null
        return (
          <section key="gallery" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.gallery?.eyebrow}
              krEyebrow={meta.gallery?.kr}
              title={meta.gallery?.title ?? ''}
              accent={meta.gallery?.accent}
              description={meta.gallery?.description}
            />
            <div className="mt-8">
              <HorizontalCollection
                items={galleryItems.map((item) => (
                  <PhotoCard key={item.id} item={item} />
                ))}
                previewCount={meta.gallery?.previewCount ?? PREVIEW_COUNT}
                viewAllHref={meta.gallery?.href || '/about/gallery'}
                viewAllLabel={meta.gallery?.primaryLabel || 'View all photographs'}
                ariaLabel="Photography collection"
              />
            </div>
          </section>
        )
      }

      // 2. ABOUT ME
      case 'about': {
        const hasAbout = Boolean(
          profileText('summary') || profileText('bio') || profileImage || profileText('headline'),
        )
        if (!hasAbout) return null
        return (
          <section key="about" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.about?.eyebrow}
              krEyebrow={meta.about?.kr}
              title={meta.about?.title ?? profileText('fullName') ?? ''}
              accent={meta.about?.accent}
              description={meta.about?.description}
            />

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 md:gap-10 items-start">
              {profileImage && (
                <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden border border-line-subtle bg-overlay-faint">
                  {/* Plain img keeps CMS-provided hosts working without config changes. */}
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
          </section>
        )
      }

      // 3. FEATURED PROJECTS
      case 'projects': {
        if (featuredProjects.length === 0) return null
        return (
          <section key="projects" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.projects?.eyebrow}
              krEyebrow={meta.projects?.kr}
              title={meta.projects?.title ?? ''}
              accent={meta.projects?.accent}
              description={meta.projects?.description}
            />

            <div className="mt-8">
              <HorizontalCollection
                items={featuredProjects.map((project) => (
                  <ProjectCard key={project.id ?? project.title} project={project} />
                ))}
                previewCount={meta.projects?.previewCount ?? PREVIEW_COUNT}
                viewAllHref={meta.projects?.href || '/projects'}
                viewAllLabel={meta.projects?.primaryLabel || 'View all projects'}
                ariaLabel="Featured projects"
              />
            </div>
          </section>
        )
      }

      // 4. MEDIA PREVIEW
      case 'media': {
        if (mediaPreview.length === 0) return null
        return (
          <section key="media" className="py-16 md:py-24 border-t border-line">
            <SectionHeader
              eyebrow={meta.media?.eyebrow}
              krEyebrow={meta.media?.kr}
              title={meta.media?.title ?? ''}
              accent={meta.media?.accent}
              description={meta.media?.description}
            />

            <div className="mt-8">
              <HorizontalCollection
                items={mediaPreview.map(({ kind, item }) => (
                  <MediaPoster key={`${kind}-${item.id}`} kind={kind} item={item} />
                ))}
                previewCount={meta.media?.previewCount ?? PREVIEW_COUNT}
                viewAllHref={meta.media?.href || '/media'}
                viewAllLabel={meta.media?.primaryLabel || 'View all media'}
                ariaLabel="Media preview"
              />
            </div>
          </section>
        )
      }

      // 5. CONTACT PREVIEW
      case 'contact':
        return (
          <section key="contact" className="py-16 md:py-24 border-t border-line">
            <ContactSection
              eyebrow={meta.contact?.eyebrow}
              title={meta.contact?.title ?? copy.contact?.title ?? ''}
              accent={meta.contact?.accent}
              description={meta.contact?.description || copy.contact?.description}
              socialLinks={socialLinks}
              email={site.contact.email}
              phone={site.contact.phone}
              location={site.contact.location}
              timeZone={site.contact.timeZone || site.contact.timezone}
              timezoneLabel={site.contact.timezoneLabel}
              availability={site.contact.availability}
              showForm={site.contact.formEnabled !== false}
            />
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="portfolio-home home-redesign">
      <section className="hero-section shell-width" style={heroStyle} aria-labelledby="hero-heading">
        <div className="hero-editorial">
          <div className="hero-copy-block">
            {heroData.heading && (
              <h1 id="hero-heading" className="hero-heading">
                {heroData.heading.replace(/\.$/, '')}
                <span>.</span>
              </h1>
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
        {order.map((sectionKey) => (
          <Reveal key={sectionKey}>{renderSection(sectionKey)}</Reveal>
        ))}
      </div>
    </div>
  )
}
