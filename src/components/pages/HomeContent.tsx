import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Compass,
  FolderGit2,
  Layers,
  Mail,
  MapPin,
} from 'lucide-react'
import {
  getProfileContentResult,
  getPublishedCmsContentResult,
  type CmsRecord,
} from '@/app/actions/content-cms'
import { getPublicProfileSettingsResult } from '@/app/actions/media'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { getGalleryResult } from '@/lib/gallery'
import { getMediaSections } from '@/lib/media-content'
import { buildProjectDossier, getProjectsResult } from '@/lib/projects'
import { EMPTY_SITE_CONFIG, getMediaCollections, getSiteConfig } from '@/lib/site-content'
import { toSlug } from '@/lib/slug'
import { uiStrings } from '@/lib/ui-strings'
import { PageShell } from '@/components/ui/PageChrome'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Card3D } from '@/components/ui/Card3D'
import {
  HomeDepthSection,
  HomeHeroParallax,
  HomeScrollProgressBar,
  HomeStaggerGrid,
  HomeStaggerItem,
} from '@/components/home/HomeMotionPrimitives'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'

function readingMinutes(record: CmsRecord): number {
  const payload = record.payload || {}
  const body =
    (typeof payload.content === 'string' && payload.content) ||
    (typeof payload.description === 'string' && payload.description) ||
    (typeof payload.body === 'string' && payload.body) ||
    ''
  const words = body.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string | number | undefined): T[] {
  const seen = new Set<string | number>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (key === undefined || key === '' || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Curated Front Door Homepage.
 *
 * Uses the same PageShell, SectionHeader, hairline dividers, and .apple-card
 * surfaces as subpages while keeping full archives on their dedicated routes
 * (/about, /projects, /media, /blogs, /contact).
 */
export default async function HomeContent() {
  const [
    profileResult,
    projectsResult,
    galleryResult,
    experienceResult,
    educationResult,
    blogsResult,
    socialLinksResult,
    siteResult,
    mediaCollectionsResult,
    publicSettingsResult,
  ] = await Promise.all([
    getProfileContentResult(),
    getProjectsResult(),
    getGalleryResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.experience),
    getPublishedCmsContentResult(CMS_COLLECTIONS.education),
    getPublishedCmsContentResult(CMS_COLLECTIONS.blogs),
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
    getSiteConfig(),
    getMediaCollections(),
    getPublicProfileSettingsResult(),
  ])

  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG
  const profile = (profileResult.status === 'ok' ? profileResult.data : {}) as Record<
    string,
    unknown
  >
  const projects = projectsResult.status === 'ok' ? projectsResult.data : []
  const gallery = galleryResult.status === 'ok' ? galleryResult.data : []
  const experience = experienceResult.status === 'ok' ? experienceResult.data : []
  const education = educationResult.status === 'ok' ? educationResult.data : []
  const blogs = blogsResult.status === 'ok' ? blogsResult.data : []
  const socialLinksRaw = socialLinksResult.status === 'ok' ? socialLinksResult.data : []
  const mediaCollections = mediaCollectionsResult.status === 'ok' ? mediaCollectionsResult.data : []
  const mediaSections = await getMediaSections(mediaCollections)
  const githubUsername =
    publicSettingsResult.status === 'ok' ? publicSettingsResult.data?.githubUsername || '' : ''

  const profileText = (key: string) => {
    const raw = profile[key]
    return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
  }

  const displayName = profileText('fullName') || site.brand.name || 'Ashok Rimal'
  const roleHeadline =
    profileText('headline') || site.brand.role || 'Full-Stack Engineer & Product Builder'
  const summary = profileText('summary')
  const bio = profileText('bio')
  const profileImage = profileText('avatarUrl') || profileText('imageUrl')
  const location = profileText('location') || site.contact.location
  const availability = profileText('availability') || site.contact.availability || site.footer.availabilityText
  const focus = profileText('focus')
  const email = profileText('email') || site.contact.email

  const socialLinks = dedupeBy(
    socialLinksRaw
      .map((s) => ({
        id: s.id,
        label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
        href: typeof s.payload?.href === 'string' ? s.payload.href : '',
      }))
      .filter((s) => s.label && s.href),
    (s) => s.href || s.label,
  )

  const featuredProjects = (
    projects.some((project) => project.featured)
      ? projects.filter((project) => project.featured)
      : projects
  ).slice(0, 3)

  const latestNotes = blogs.slice(0, 3)
  const totalMediaItems = mediaSections.reduce((sum, s) => sum + s.items.length, 0)
  const latestRole = experience[0]
  const latestEducation = education[0]

  const directoryItems = [
    {
      index: '01',
      title: 'About',
      href: '/about',
      metric: `${experience.length + education.length} milestones`,
      summary: 'Career history, education, technical toolkit & GitHub.',
    },
    {
      index: '02',
      title: 'Projects',
      href: '/projects',
      metric: `${projects.length} case studies`,
      summary: 'Architecture dossiers, process models, timelines & docs.',
    },
    {
      index: '03',
      title: 'Media',
      href: '/media',
      metric: `${totalMediaItems} entries`,
      summary: 'Music rotation, cinema, anime library & manga archive.',
    },
    {
      index: '04',
      title: 'Journal',
      href: '/blogs',
      metric: `${blogs.length} notes`,
      summary: 'Essays on interfaces, systems architecture & teaching.',
    },
  ]

  const metaParts = [location, focus, availability].filter(Boolean)

  return (
    <PageShell>
      <HomeScrollProgressBar />

      {/* 0. CURATED FRONT DOOR HERO */}
      <section className="pb-12 md:pb-16">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
            <span>{roleHeadline}</span>
            {site.brand.korean && (
              <span lang="ko" className="font-korean normal-case tracking-normal">
                · {site.brand.korean}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.05em] leading-[0.98] text-ink max-w-3xl text-balance">
            {displayName}
            <span className="text-accent">.</span>
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-stretch">
          {/* Left: Core positioning & direct paths */}
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {summary ? (
                <p className="text-lg md:text-2xl text-ink leading-snug tracking-tight max-w-2xl">
                  {summary}
                </p>
              ) : (
                <p className="text-lg md:text-2xl text-ink leading-snug tracking-tight max-w-2xl">
                  Designing and engineering thoughtful full-stack web products, calm interfaces,
                  and dependable systems.
                </p>
              )}

              {bio && (
                <p className="text-sm md:text-base text-muted leading-relaxed max-w-2xl line-clamp-4">
                  {bio}
                </p>
              )}

              {metaParts.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-xs text-muted">
                  {metaParts.map((part, idx) => (
                    <span key={`${part}-${idx}`} className="inline-flex items-center gap-2.5">
                      {idx > 0 && <span aria-hidden="true">·</span>}
                      <span>{part}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/projects" className="apple-btn-primary">
                  <span>Explore projects</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <Link href="/about" className="apple-btn-secondary">
                  <span>About & background</span>
                </Link>
              </div>

              {socialLinks.length > 0 && (
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-accent transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Portrait when present, or At-a-Glance Portfolio Snapshot */}
          <HomeHeroParallax className="flex flex-col">
            {profileImage ? (
              <div className="relative min-h-[280px] lg:h-full w-full rounded-[24px] overflow-hidden border border-line-subtle bg-overlay-faint">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <aside className="apple-card p-6 md:p-7 h-full flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Current snapshot</span>
                    <Compass className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  </div>

                  <dl className="divide-y divide-line-hairline text-xs">
                    {latestRole && (
                      <div className="py-2.5 first:pt-0 space-y-0.5">
                        <dt className="text-muted">Recent role</dt>
                        <dd className="font-semibold text-ink">{latestRole.title}</dd>
                      </div>
                    )}
                    {latestEducation && (
                      <div className="py-2.5 space-y-0.5">
                        <dt className="text-muted">Academic background</dt>
                        <dd className="font-semibold text-ink">{latestEducation.title}</dd>
                      </div>
                    )}
                    <div className="py-2.5 last:pb-0 flex items-center justify-between">
                      <dt className="text-muted">Published work</dt>
                      <dd className="font-mono font-semibold text-ink tabular-nums">
                        {projects.length} projects · {gallery.length} frames
                      </dd>
                    </div>
                  </dl>
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-between border-t border-line-hairline pt-4 text-xs font-medium text-ink hover:text-accent transition-colors"
                >
                  <span>Available for collaboration</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                </Link>
              </aside>
            )}
          </HomeHeroParallax>
        </div>

        {/* Dedicated Pages Directory Strip */}
        <nav aria-label="Site directory" className="mt-12 md:mt-14 border-y border-line">
          <HomeStaggerGrid
            staggerDelay={0.05}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line"
          >
            {directoryItems.map((item) => (
              <HomeStaggerItem key={item.href}>
                <Link
                  href={item.href}
                  className="group h-full py-5 sm:px-5 first:sm:pl-0 last:lg:pr-0 flex flex-col justify-between gap-2 transition-colors hover:bg-overlay-faint/60"
                >
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-mono tabular-nums">{item.index}</span>
                    <span className="font-mono tabular-nums">{item.metric}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
                      {item.title}
                    </h2>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{item.summary}</p>
                </Link>
              </HomeStaggerItem>
            ))}
          </HomeStaggerGrid>
        </nav>
      </section>

      {/* 1. SELECTED WORK SPOTLIGHT */}
      <HomeDepthSection>
        <section className="py-12 md:py-16">
          <SectionHeader
            number={0}
            eyebrow="Selected Work"
            krEyebrow="주요 프로젝트"
            title="Featured case"
            accent="studies."
            description="Highlights from shipped systems and prototypes. Open any project for its plan, stack, process model, timeline, cost, and documentation."
            linkHref="/projects"
            linkLabel={uiStrings.projects.viewAll.en}
          />

          <div className="mt-8">
            {projectsResult.status === 'error' ? (
              <CmsErrorState message={projectsResult.message} />
            ) : featuredProjects.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                message="No projects published yet"
                hint="Published projects appear here and on the projects page."
                actionHref="/projects"
                actionLabel="Open projects"
              />
            ) : (
              <HomeStaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProjects.map((project, index) => {
                  const dossier = buildProjectDossier(project)
                  const detailHref = `/projects/${project.slug || toSlug(project.title)}`
                  const metaItems = [
                    project.category,
                    dossier.duration.headline,
                    project.status,
                  ].filter(Boolean)

                  return (
                    <HomeStaggerItem key={project.id} className="h-full">
                      <Card3D maxTilt={4.5} glare className="h-full">
                        <article className="apple-card group relative flex h-full flex-col justify-between overflow-hidden transition-colors hover:border-line-medium">
                          <Link
                            href={detailHref}
                            className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={uiStrings.project.openCaseStudy(project.title)}
                          />

                          <div>
                            <div className="relative aspect-[16/10] bg-overlay-faint border-b border-line-hairline overflow-hidden">
                              {project.image ? (
                                <Image
                                  src={project.image}
                                  alt={project.altText || uiStrings.project.previewAlt(project.title)}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  referrerPolicy="no-referrer"
                                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                />
                              ) : (
                                <div className="flex h-full flex-col justify-between p-5">
                                  <span className="font-mono text-[11px] text-muted tabular-nums">
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                  <div className="flex items-center justify-between text-xs text-muted">
                                    <span className="font-medium text-ink-secondary truncate">
                                      {dossier.model.name}
                                    </span>
                                    <Layers className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="p-6 space-y-3">
                              {metaItems.length > 0 && (
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted tabular-nums">
                                  {metaItems.map((item, idx) => (
                                    <span key={`${item}-${idx}`} className="inline-flex items-center gap-2">
                                      {idx > 0 && <span aria-hidden="true">·</span>}
                                      <span>{item}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <h3 className="text-xl font-semibold tracking-tight text-ink group-hover:text-accent transition-colors leading-snug">
                                {project.title}
                              </h3>

                              {(project.summary || project.description) && (
                                <p className="text-xs md:text-sm text-muted leading-relaxed line-clamp-2">
                                  {project.summary || project.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="px-6 pb-6 pt-3 border-t border-line-hairline flex items-center justify-between gap-3 text-xs">
                            <span className="text-muted truncate">
                              {project.techStack.slice(0, 3).join(' · ') || 'Case study'}
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium text-accent shrink-0">
                              <span>Case study</span>
                              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                            </span>
                          </div>
                        </article>
                      </Card3D>
                    </HomeStaggerItem>
                  )
                })}
              </HomeStaggerGrid>
            )}
          </div>
        </section>
      </HomeDepthSection>

      {/* 2. LATEST WRITING & DIRECT CONTACT */}
      <HomeDepthSection>
        <section className="pt-12 md:pt-16 border-t border-line">
          <SectionHeader
            number={1}
            eyebrow="Notes & Inquiries"
            krEyebrow="글과 연락"
            title="Recent writing and"
            accent="contact."
            description="Short notes from the journal alongside direct availability for engineering work."
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
            {/* Left: Latest Journal Notes + Media teaser */}
            <div className="apple-card p-6 md:p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <BookOpen className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>Latest from journal</span>
                  </div>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    <span>All notes</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>

                {latestNotes.length > 0 ? (
                  <ul className="divide-y divide-line-hairline">
                    {latestNotes.map((note, idx) => {
                      const slug = note.slug || toSlug(note.title)
                      const minutes = readingMinutes(note)
                      const category =
                        typeof note.payload?.category === 'string'
                          ? note.payload.category
                          : undefined
                      return (
                        <li key={note.id}>
                          <Link
                            href={`/blogs/${slug}`}
                            className="group flex items-baseline justify-between gap-4 py-3.5 first:pt-1 last:pb-1"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 text-[11px] text-muted tabular-nums">
                                <span className="font-mono">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                {category && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{category}</span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate">
                                {note.title}
                              </p>
                            </div>
                            <span className="text-[11px] font-mono text-muted tabular-nums shrink-0">
                              {minutes} min read
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted py-4">
                    Journal entries will appear here as they are published.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-line-hairline flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-muted">
                  Curated media shelf: {mediaSections.map((s) => `${s.label} (${s.items.length})`).join(' · ')}
                </span>
                <Link
                  href="/media"
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline shrink-0"
                >
                  <span>Browse media</span>
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right: Availability & Direct Conversation Card */}
            <aside className="apple-card p-6 md:p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Open for inquiries</span>
                  <Mail className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                </div>

                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  Let&apos;s build something considered.
                </h3>

                <dl className="space-y-2.5 text-xs pt-1">
                  {location && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="inline-flex items-center gap-1.5 text-muted">
                        <MapPin className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                        <span>Based in</span>
                      </dt>
                      <dd className="font-medium text-ink text-right">{location}</dd>
                    </div>
                  )}
                  {site.contact.timeZone && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="inline-flex items-center gap-1.5 text-muted">
                        <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                        <span>Timezone</span>
                      </dt>
                      <dd className="font-medium text-ink text-right tabular-nums">
                        {site.contact.timeZone}
                      </dd>
                    </div>
                  )}
                  {availability && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted">Status</dt>
                      <dd className="font-medium text-accent text-right">{availability}</dd>
                    </div>
                  )}
                  {githubUsername && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted">GitHub</dt>
                      <dd className="font-mono text-ink text-right">@{githubUsername}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link href="/contact" className="apple-btn-primary w-full justify-center">
                  <span>Start a conversation</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="block text-center text-xs text-muted hover:text-accent transition-colors"
                  >
                    {email}
                  </a>
                )}
              </div>
            </aside>
          </div>
        </section>
      </HomeDepthSection>
    </PageShell>
  )
}
