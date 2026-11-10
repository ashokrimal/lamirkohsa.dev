import Link from 'next/link'
import type { CSSProperties } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Compass,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react'
import {
  getHeroSectionConfig,
  getHomepageSectionsConfig,
  getProfileContent,
  getFeaturedProjects,
  getGalleryItems,
  getExperienceItems,
  getSkillsContent,
  getMediaPreviews,
  getSocialLinks,
} from '@/app/actions/content-cms'
import { getSiteConfig } from '@/lib/site-content'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { ProjectsPreviewGrid } from '@/components/ui/ProjectsPreviewGrid'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { MediaCard } from '@/components/ui/MediaCard'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { ContactSection } from '@/components/ui/ContactSection'
import { SpotifyWidget } from '@/components/ui/SpotifyWidget'
import { DitherSparkline } from '@/components/ui/DitherKit'
import { FilterableMediaShelf } from '@/components/ui/FilterableMediaShelf'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'
import { Card3D } from '@/components/ui/Card3D'
import { Apple3DCanvas } from '@/components/ui/Apple3DCanvas'
import type { MusicItemData, AnimeItemData, MangaItemData } from '@/components/ui/MediaCard'

export default async function HomeContent() {
  // Fetch ALL homepage content directly from the CMS (Single Source of Truth)
  const [
    heroData,
    sectionsConfig,
    profile,
    featuredProjectsRaw,
    galleryItemsRaw,
    experienceItemsRaw,
    skillsRaw,
    mediaPreviews,
    socialLinksRaw,
    site,
  ] = await Promise.all([
    getHeroSectionConfig(),
    getHomepageSectionsConfig(),
    getProfileContent(),
    getFeaturedProjects(3),
    getGalleryItems(4),
    getExperienceItems(),
    getSkillsContent(),
    getMediaPreviews(),
    getSocialLinks(),
    getSiteConfig(),
  ])

  // Extract hero image style per existing design
  const heroImageUrl = typeof heroData.imageUrl === 'string' ? heroData.imageUrl : undefined
  const heroStyle = (heroImageUrl
    ? { '--hero-image': `url("${heroImageUrl}")` }
    : {}) as CSSProperties

  // Transform CMS projects to ProjectData
  const featuredProjects: ProjectData[] = featuredProjectsRaw.map((p) => {
    const payload = p.payload || {}
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: typeof payload.category === 'string' ? payload.category : 'Web',
      summary:
        typeof payload.summary === 'string' ? payload.summary : String(payload.description || ''),
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
      status: typeof payload.status === 'string' ? payload.status : 'Active',
      featured: payload.featured === true,
      completionDate:
        typeof payload.completionDate === 'string' ? payload.completionDate : undefined,
      phases: Array.isArray(payload.phases) ? (payload.phases as any) : undefined,
    }
  })

function dedupe<T>(items: T[], keyFn: (item: T) => string | number | undefined): T[] {
  const seen = new Set<string | number>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (key === undefined || key === '' || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

  // Transform Gallery items
  const galleryItems = dedupe(
    galleryItemsRaw.map((g) => ({
      id: g.id,
      title: g.title,
      imageUrl: typeof g.payload?.imageUrl === 'string' ? g.payload.imageUrl : '',
      category: typeof g.payload?.category === 'string' ? g.payload.category : 'Photography',
      description: typeof g.payload?.description === 'string' ? g.payload.description : '',
      location: typeof g.payload?.location === 'string' ? g.payload.location : undefined,
    })),
    (g) => g.title || g.imageUrl || g.id
  )

  // Transform Experience items
  const experienceItems = dedupe(
    experienceItemsRaw.map((e) => ({
      id: e.id,
      title: e.title,
      organization: typeof e.payload?.organization === 'string' ? e.payload.organization : '',
      period: typeof e.payload?.period === 'string' ? e.payload.period : '',
      location: typeof e.payload?.location === 'string' ? e.payload.location : undefined,
      description: typeof e.payload?.description === 'string' ? e.payload.description : '',
      highlights: Array.isArray(e.payload?.highlights)
        ? (e.payload.highlights as string[])
        : undefined,
    })),
    (e) => `${e.title}::${e.organization}` || e.id
  )

  // Transform Skills
  const skills = dedupe(
    skillsRaw.map((s) => ({
      category: typeof s.payload?.category === 'string' ? s.payload.category : s.title,
      items: Array.isArray(s.payload?.items) ? (s.payload.items as string[]) : [],
      level: typeof s.payload?.level === 'string' ? s.payload.level : undefined,
    })),
    (s) => s.category
  )

  // Transform Social Links
  const socialLinks = dedupe(
    socialLinksRaw.map((s) => ({
      id: s.id,
      label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
      href: typeof s.payload?.href === 'string' ? s.payload.href : '#',
      handle: typeof s.payload?.handle === 'string' ? s.payload.handle : undefined,
    })),
    (s) => s.href || s.label
  )

  // Transform Media items for FilterableMediaShelf
  const musicShelfItems: MusicItemData[] = dedupe(
    mediaPreviews.music.map((item) => ({
      id: item.id,
      title: item.title,
      artist: String(item.payload.artist || 'Unknown Artist'),
      album: item.payload.album ? String(item.payload.album) : undefined,
      coverUrl: item.payload.coverUrl ? String(item.payload.coverUrl) : undefined,
      audioUrl: item.payload.audioUrl ? String(item.payload.audioUrl) : undefined,
      mood: item.payload.mood ? String(item.payload.mood) : undefined,
    })),
    (m) => `${m.title}::${m.artist}` || m.id
  )

  const animeShelfItems: AnimeItemData[] = dedupe(
    mediaPreviews.anime.map((item) => ({
      id: item.id,
      title: item.title,
      score: item.payload.score ? String(item.payload.score) : undefined,
      status: item.payload.status ? String(item.payload.status) : undefined,
      progress: item.payload.progress ? String(item.payload.progress) : undefined,
      imageUrl: item.payload.imageUrl ? String(item.payload.imageUrl) : undefined,
      synopsis: item.payload.synopsis ? String(item.payload.synopsis) : undefined,
    })),
    (a) => a.title || a.id
  )

  const mangaShelfItems: MangaItemData[] = dedupe(
    mediaPreviews.manga.map((item) => ({
      id: item.id,
      title: item.title,
      kind: item.payload.kind ? String(item.payload.kind) : 'Manga',
      score: item.payload.score ? String(item.payload.score) : undefined,
      status: item.payload.status ? String(item.payload.status) : undefined,
      progress: item.payload.progress ? String(item.payload.progress) : undefined,
      imageUrl: item.payload.imageUrl ? String(item.payload.imageUrl) : undefined,
      synopsis: item.payload.synopsis ? String(item.payload.synopsis) : undefined,
    })),
    (m) => m.title || m.id
  )

  // Section order, visibility and copy all come from the CMS. There are no
  // local fallbacks: an empty configuration simply renders no sections.
  const { order = [], enabled = {} } = sectionsConfig
  const meta = sectionsConfig.sectionMeta || {}

  const profileData = profile as Record<string, unknown>
  const profileText = (key: string) => {
    const raw = profileData[key]
    return typeof raw === 'string' && raw.trim() ? (raw as string) : undefined
  }

  const renderSection = (key: string) => {
    if (enabled[key] === false) return null

    switch (key) {
      // 1. ABOUT ME PREVIEW
      case 'about':
        return (
          <section
            key="about"
            className="py-16 md:py-24 border-t border-line"
            aria-labelledby="about-preview-heading"
          >
            <SectionHeader
              eyebrow={meta.about?.eyebrow}
              krEyebrow={meta.about?.kr}
              title={meta.about?.title ?? ''}
              accent={meta.about?.accent}
              description={meta.about?.description}
              linkHref={meta.about?.href}
              linkLabel={meta.about?.primaryLabel}
            />

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              <div className="space-y-6 text-sm md:text-base text-muted leading-relaxed">
                {profileText('summary') && (
                  <p className="text-base md:text-xl text-ink font-normal leading-relaxed tracking-tight">
                    {profileText('summary')}
                  </p>
                )}
                {profileText('bio') && <p>{profileText('bio')}</p>}

                {(profileText('location') || profileText('headline')) && (
                  <div className="pt-2 flex flex-wrap gap-3 text-xs">
                    {profileText('location') && (
                      <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle text-ink shadow-xs">
                        <Compass className="w-3.5 h-3.5 text-accent" />
                        <span>{profileText('location')}</span>
                      </span>
                    )}
                    {profileText('headline') && (
                      <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle text-ink shadow-xs">
                        <Code2 className="w-3.5 h-3.5 text-accent" />
                        <span>{profileText('headline')}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Card3D maxTilt={5}>
                <div className="apple-card p-6 md:p-7 space-y-5">
                  {(meta.about?.secondaryLabel || profileText('availability')) && (
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-line-subtle">
                      {meta.about?.secondaryLabel && (
                        <span className="text-xs uppercase tracking-wider text-muted font-medium">
                          {meta.about.secondaryLabel}
                        </span>
                      )}
                      {profileText('availability') && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {profileText('availability')}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative h-44 w-full rounded-2xl bg-overlay-faint border border-line-faint overflow-hidden flex items-center justify-center">
                    <Apple3DCanvas className="w-full h-full" />
                  </div>

                  {(profileText('focus') || profileText('education')) && (
                    <div className="space-y-3 text-xs leading-relaxed">
                      {profileText('focus') && <p className="text-ink">{profileText('focus')}</p>}
                      {profileText('education') && (
                        <p className="text-muted">{profileText('education')}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card3D>
            </div>
          </section>
        )

      // 2. GALLERY PREVIEW
      case 'gallery':
        return (
          <section
            key="gallery"
            className="py-16 md:py-24 border-t border-line"
            aria-labelledby="gallery-preview-heading"
          >
            <SectionHeader
              eyebrow={meta.gallery?.eyebrow}
              krEyebrow={meta.gallery?.kr}
              title={meta.gallery?.title ?? ''}
              accent={meta.gallery?.accent}
              description={meta.gallery?.description}
              linkHref={meta.gallery?.href}
              linkLabel={meta.gallery?.primaryLabel}
            />
            <div className="mt-8">
              <GalleryGrid items={galleryItems} columns={4} />
            </div>
          </section>
        )

      // 3. PROJECTS PREVIEW
      case 'projects':
        return (
          <section
            key="projects"
            className="py-16 md:py-24 border-t border-line"
            aria-labelledby="projects-preview-heading"
          >
            <SectionHeader
              eyebrow={meta.projects?.eyebrow}
              krEyebrow={meta.projects?.kr}
              title={meta.projects?.title ?? ''}
              accent={meta.projects?.accent}
              description={meta.projects?.description}
              linkHref={meta.projects?.href}
              linkLabel={meta.projects?.primaryLabel}
            />

            <div className="mt-8">
              <ProjectsPreviewGrid projects={featuredProjects} />
            </div>

            {meta.projects?.secondaryLabel && meta.projects?.href && (
              <div className="mt-8 pt-4 flex justify-end">
                <Link href={meta.projects.href} className="apple-btn-primary">
                  <span>{meta.projects.secondaryLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </section>
        )

      // 4. MEDIA PREVIEW
      case 'media':
        return (
          <section
            key="media"
            className="py-16 md:py-24 border-t border-line"
            aria-labelledby="media-preview-heading"
          >
            <SectionHeader
              eyebrow={meta.media?.eyebrow}
              krEyebrow={meta.media?.kr}
              title={meta.media?.title ?? ''}
              accent={meta.media?.accent}
              description={meta.media?.description}
              linkHref={meta.media?.href}
              linkLabel={meta.media?.primaryLabel}
            />

            <div className="mt-8">
              <FilterableMediaShelf
                music={musicShelfItems}
                anime={animeShelfItems}
                manga={mangaShelfItems}
              />
            </div>
          </section>
        )

      // 5. EXPERIENCE & HIGHLIGHTS PREVIEW
      case 'experience':
        return (
          <section
            key="experience"
            className="py-16 md:py-24 border-t border-line"
            aria-labelledby="experience-preview-heading"
          >
            <SectionHeader
              eyebrow={meta.experience?.eyebrow}
              krEyebrow={meta.experience?.kr}
              title={meta.experience?.title ?? ''}
              accent={meta.experience?.accent}
              description={meta.experience?.description}
              linkHref={meta.experience?.href}
              linkLabel={meta.experience?.primaryLabel}
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              <div>
                {meta.experience?.secondaryLabel && (
                  <h3 className="text-xs uppercase tracking-wider text-muted font-medium mb-4">
                    {meta.experience.secondaryLabel}
                  </h3>
                )}
                <ExperienceTimeline items={experienceItems.slice(0, 2)} type="experience" />
              </div>

              <div className="space-y-4">
                {meta.experience?.meta && (
                  <h3 className="text-xs uppercase tracking-wider text-muted font-medium mb-4">
                    {meta.experience.meta}
                  </h3>
                )}
                <SkillDisplay skills={skills} limit={2} />

                {meta.experience?.primaryLabel && (
                  <div className="mt-4">
                    <DitherSparkline label={meta.experience.primaryLabel} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              {profile.github && (
                <GitHubActivitySparkline username={profile.github} showRecentCommits={true} />
              )}
            </div>
          </section>
        )

      // 6. CONTACT PREVIEW
      case 'contact':
        return (
          <section
            key="contact"
            className="py-16 md:py-24 border-t border-line"
            aria-labelledby="contact-preview-heading"
          >
            <ContactSection
              eyebrow={meta.contact?.eyebrow}
              title={meta.contact?.title ?? ''}
              accent={meta.contact?.accent}
              description={meta.contact?.description}
              socialLinks={socialLinks}
              email={site.contact.email}
              location={site.contact.location}
              timeZone={site.contact.timeZone || site.contact.timezone}
              timezoneLabel={site.contact.timezoneLabel}
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
            {heroData.stats && heroData.stats.length > 0 && (
              <div className="hero-stats">
                {heroData.stats.map((stat, index) => (
                  <span key={index}>
                    <strong>{stat.value}</strong>
                    <small>{stat.label}</small>
                  </span>
                ))}
              </div>
            )}

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
            {heroData.location && (
              <p>
                {heroData.location.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {(heroData.metaLeft || heroData.metaRight) && (
          <div className="hero-meta">
            <span>{heroData.metaLeft}</span>
            <span>{heroData.metaRight}</span>
          </div>
        )}
      </section>

      <div className="shell-width">{order.map((sectionKey) => renderSection(sectionKey))}</div>
    </div>
  )
}
