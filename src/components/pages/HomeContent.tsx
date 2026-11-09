import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ArrowUpRight, CheckCircle2, Code2, Compass, Layers, Sparkles, Terminal } from 'lucide-react'
import SkeletonReveal from '@/components/SkeletonReveal'
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
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { ProjectsPreviewGrid } from '@/components/ui/ProjectsPreviewGrid'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { MediaCard } from '@/components/ui/MediaCard'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { ContactSection } from '@/components/ui/ContactSection'

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
  ])

  // Extract hero image style per existing design
  const heroImageUrl =
    typeof heroData.imageUrl === 'string' && heroData.imageUrl
      ? heroData.imageUrl
      : '/images/hero-ashok.png'
  const heroStyle = { '--hero-image': `url("${heroImageUrl}")` } as CSSProperties

  // Transform CMS projects to ProjectData
  const featuredProjects: ProjectData[] = featuredProjectsRaw.map((p) => {
    const payload = p.payload || {}
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: typeof payload.category === 'string' ? payload.category : 'Web',
      summary: typeof payload.summary === 'string' ? payload.summary : String(payload.description || ''),
      description: typeof payload.description === 'string' ? payload.description : '',
      techStack: Array.isArray(payload.techStack) ? (payload.techStack as string[]) : [],
      image: typeof payload.image === 'string' ? payload.image : (typeof payload.imageUrl === 'string' ? payload.imageUrl : undefined),
      live: typeof payload.live === 'string' ? payload.live : undefined,
      github: typeof payload.github === 'string' ? payload.github : undefined,
      status: typeof payload.status === 'string' ? payload.status : 'Active',
      featured: payload.featured === true,
      completionDate: typeof payload.completionDate === 'string' ? payload.completionDate : undefined,
      phases: Array.isArray(payload.phases) ? (payload.phases as any) : undefined,
    }
  })

  // Transform Gallery items
  const galleryItems = galleryItemsRaw.map((g) => ({
    id: g.id,
    title: g.title,
    imageUrl: typeof g.payload?.imageUrl === 'string' ? g.payload.imageUrl : '',
    category: typeof g.payload?.category === 'string' ? g.payload.category : 'Photography',
    description: typeof g.payload?.description === 'string' ? g.payload.description : '',
    location: typeof g.payload?.location === 'string' ? g.payload.location : undefined,
  }))

  // Transform Experience items
  const experienceItems = experienceItemsRaw.map((e) => ({
    id: e.id,
    title: e.title,
    organization: typeof e.payload?.organization === 'string' ? e.payload.organization : '',
    period: typeof e.payload?.period === 'string' ? e.payload.period : '',
    location: typeof e.payload?.location === 'string' ? e.payload.location : undefined,
    description: typeof e.payload?.description === 'string' ? e.payload.description : '',
    highlights: Array.isArray(e.payload?.highlights) ? (e.payload.highlights as string[]) : undefined,
  }))

  // Transform Skills
  const skills = skillsRaw.map((s) => ({
    category: typeof s.payload?.category === 'string' ? s.payload.category : s.title,
    items: Array.isArray(s.payload?.items) ? (s.payload.items as string[]) : [],
    level: typeof s.payload?.level === 'string' ? s.payload.level : undefined,
  }))

  // Transform Social Links
  const socialLinks = socialLinksRaw.map((s) => ({
    id: s.id,
    label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
    href: typeof s.payload?.href === 'string' ? s.payload.href : '#',
    handle: typeof s.payload?.handle === 'string' ? s.payload.handle : undefined,
  }))

  // Section Ordering and Visibility from CMS
  const { order = ['about', 'gallery', 'projects', 'media', 'experience', 'contact'], enabled = {} } =
    sectionsConfig
  const meta = sectionsConfig.sectionMeta || {}

  // Helper to render sections dynamically
  const renderSection = (key: string) => {
    if (enabled[key] === false) return null

    switch (key) {
      // 1. ABOUT ME PREVIEW
      case 'about':
        return (
          <section key="about" className="py-16 md:py-24 border-t border-[var(--line)]" aria-labelledby="about-preview-heading">
            <SectionHeader
              eyebrow={meta.about?.eyebrow || '01 / About Me'}
              title={meta.about?.title || 'Useful by design.'}
              accent={meta.about?.accent || 'Quietly ambitious.'}
              description={meta.about?.description || 'I like the space between a rough idea and the moment it becomes obvious to use.'}
              linkHref="/about"
              linkLabel="Read complete biography & approach"
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
              {/* Left Column: Short introduction & professional background */}
              <div className="space-y-5 text-sm md:text-base text-[var(--muted)] leading-relaxed">
                <p className="text-base md:text-lg text-[var(--ink)] font-normal leading-relaxed">
                  {profile.summary ||
                    'A Bachelor of Computer Applications student and full-stack software developer focused on thoughtful interfaces, dependable backend systems, and human-centric software.'}
                </p>
                <p>
                  {profile.bio ||
                    'My work sits between interface craft, backend architecture, and teaching. I build accessible interfaces, dependable systems, and practical technology that helps people move forward.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[var(--ink)]">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[var(--surface)] border border-[var(--line)]">
                    <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Based in {profile.location || 'Nepal'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[var(--surface)] border border-[var(--line)]">
                    <Code2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{profile.headline || 'Full-Stack Developer'}</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Architectural Principles & Quick Snapshot */}
              <div className="p-6 md:p-7 rounded-sm border border-[var(--line)] bg-[var(--surface)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]/60">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                    Status &amp; Focus
                  </span>
                  <span className="text-[10px] font-mono text-[var(--accent)] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    Available
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-[var(--ink)]">Core Engineering Stack</h4>
                    <p className="text-[var(--muted)] font-mono text-[11px] mt-0.5">
                      Next.js 14/15 · React · TypeScript · Node.js · PostgreSQL · Tailwind CSS
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--ink)]">Educational Foundation</h4>
                    <p className="text-[var(--muted)] text-[11px] mt-0.5">
                      Bachelor of Computer Applications (BCA) · Crimson College of Technology
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--ink)]">Teaching &amp; Community</h4>
                    <p className="text-[var(--muted)] text-[11px] mt-0.5">
                      Mentored 60+ students in robotics, microcontrollers, and Python logic at Dursikshya Education.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    <span>Read full story, credentials &amp; toolkit</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )

      // 2. GALLERY PREVIEW
      case 'gallery':
        return (
          <section key="gallery" className="py-16 md:py-24 border-t border-[var(--line)]" aria-labelledby="gallery-preview-heading">
            <SectionHeader
              eyebrow={meta.gallery?.eyebrow || '02 / Visual Journal'}
              title={meta.gallery?.title || 'Moments in'}
              accent={meta.gallery?.accent || 'perspective.'}
              description={meta.gallery?.description || 'Personal photographs capturing quiet geometry, architecture, and light across Nepal.'}
              linkHref="/media"
              linkLabel="View all photographs"
            />
            <div className="mt-8">
              <GalleryGrid items={galleryItems} showViewAll={true} viewAllHref="/media" columns={4} />
            </div>
          </section>
        )

      // 3. PROJECTS PREVIEW
      case 'projects':
        return (
          <section key="projects" className="py-16 md:py-24 border-t border-[var(--line)]" aria-labelledby="projects-preview-heading">
            <SectionHeader
              eyebrow={meta.projects?.eyebrow || '03 / Selected Work'}
              title={meta.projects?.title || 'Systems built with'}
              accent={meta.projects?.accent || 'conviction.'}
              description={meta.projects?.description || 'Web and mobile applications engineered from user research to production delivery.'}
              linkHref="/projects"
              linkLabel="Browse project archive & execution timeline"
            />

            <div className="mt-8">
              <ProjectsPreviewGrid projects={featuredProjects} />
            </div>

            <div className="mt-8 pt-4 flex justify-end">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[#435d4c] transition shadow-2xs"
              >
                <span>Browse all case studies &amp; milestones</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )

      // 4. MEDIA PREVIEW (Music, Anime, Manga)
      case 'media':
        return (
          <section key="media" className="py-16 md:py-24 border-t border-[var(--line)]" aria-labelledby="media-preview-heading">
            <SectionHeader
              eyebrow={meta.media?.eyebrow || '04 / Cultural Influences'}
              title={meta.media?.title || 'Soundtrack &'}
              accent={meta.media?.accent || 'Stories.'}
              description={meta.media?.description || 'Music rotation, anime, and manga that inspire visual rhythm, focus, and narrative depth.'}
              linkHref="/media"
              linkLabel="Open complete media collections"
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Music Preview Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    Music / Rotation
                  </span>
                  <Link href="/media" className="text-[10px] font-mono text-[var(--accent)] hover:underline">
                    All tracks →
                  </Link>
                </div>
                <div className="space-y-3">
                  {mediaPreviews.music.slice(0, 2).map((item) => (
                    <MediaCard
                      key={item.id}
                      type="music"
                      item={{
                        id: item.id,
                        title: item.title,
                        artist: String(item.payload.artist || 'Unknown Artist'),
                        album: item.payload.album ? String(item.payload.album) : undefined,
                        coverUrl: item.payload.coverUrl ? String(item.payload.coverUrl) : undefined,
                        audioUrl: item.payload.audioUrl ? String(item.payload.audioUrl) : undefined,
                        mood: item.payload.mood ? String(item.payload.mood) : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Anime Preview Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    Anime / Catalog
                  </span>
                  <Link href="/media" className="text-[10px] font-mono text-[var(--accent)] hover:underline">
                    All anime →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {mediaPreviews.anime.slice(0, 2).map((item) => (
                    <MediaCard
                      key={item.id}
                      type="anime"
                      item={{
                        id: item.id,
                        title: item.title,
                        score: item.payload.score ? String(item.payload.score) : undefined,
                        status: item.payload.status ? String(item.payload.status) : undefined,
                        progress: item.payload.progress ? String(item.payload.progress) : undefined,
                        imageUrl: item.payload.imageUrl ? String(item.payload.imageUrl) : undefined,
                        synopsis: item.payload.synopsis ? String(item.payload.synopsis) : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Manga Preview Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    Manga &amp; Manhwa / Reading
                  </span>
                  <Link href="/media" className="text-[10px] font-mono text-[var(--accent)] hover:underline">
                    All titles →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {mediaPreviews.manga.slice(0, 2).map((item) => (
                    <MediaCard
                      key={item.id}
                      type="manga"
                      item={{
                        id: item.id,
                        title: item.title,
                        kind: item.payload.kind ? String(item.payload.kind) : 'Manga',
                        score: item.payload.score ? String(item.payload.score) : undefined,
                        status: item.payload.status ? String(item.payload.status) : undefined,
                        progress: item.payload.progress ? String(item.payload.progress) : undefined,
                        imageUrl: item.payload.imageUrl ? String(item.payload.imageUrl) : undefined,
                        synopsis: item.payload.synopsis ? String(item.payload.synopsis) : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )

      // 5. EXPERIENCE & HIGHLIGHTS PREVIEW
      case 'experience':
        return (
          <section key="experience" className="py-16 md:py-24 border-t border-[var(--line)]" aria-labelledby="experience-preview-heading">
            <SectionHeader
              eyebrow={meta.experience?.eyebrow || '05 / Career & Toolkit'}
              title={meta.experience?.title || 'Work in'}
              accent={meta.experience?.accent || 'practice.'}
              description={meta.experience?.description || 'Roles, teaching commitments, and practical technical proficiencies.'}
              linkHref="/about"
              linkLabel="View complete career & qualifications"
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              {/* Left Column: Timeline items */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-4">
                  Selected Milestones
                </h3>
                <ExperienceTimeline items={experienceItems.slice(0, 2)} type="experience" />
              </div>

              {/* Right Column: Skills preview */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-4">
                  Core Technical Disciplines
                </h3>
                <SkillDisplay skills={skills} limit={2} />

                <div className="mt-4 p-4 rounded-sm border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--muted)] flex items-center justify-between">
                  <span>Want to see verified credentials &amp; tools?</span>
                  <Link href="/about" className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                    About page <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )

      // 6. CONTACT PREVIEW
      case 'contact':
        return (
          <section key="contact" className="py-16 md:py-24 border-t border-[var(--line)]" aria-labelledby="contact-preview-heading">
            <ContactSection
              eyebrow={meta.contact?.eyebrow || '06 / Direct Dispatch'}
              title={meta.contact?.title || "Let's build something"}
              accent={meta.contact?.accent || 'thoughtful.'}
              description={meta.contact?.description || 'Open to software engineering roles, independent client contracts, and collaborative open-source builds.'}
              socialLinks={socialLinks}
              showForm={true}
            />
          </section>
        )

      default:
        return null
    }
  }

  return (
    <SkeletonReveal variant="home">
      <div className="portfolio-home home-redesign">
        {/* ========================================================================= */}
        {/* HERO SECTION: PRESERVED EXACTLY AS IS (DESIGN, TYPOGRAPHY, LAYOUT & META) */}
        {/* ========================================================================= */}
        <section className="hero-section shell-width" style={heroStyle} aria-labelledby="hero-heading">
          <div className="hero-editorial">
            <div className="hero-copy-block">
              <div className="hero-stats">
                <span>
                  <strong>{heroData.stats?.[0]?.value || '03+'}</strong>
                  <small>{heroData.stats?.[0]?.label || 'Selected projects'}</small>
                </span>
                <span>
                  <strong>{heroData.stats?.[1]?.value || '04'}</strong>
                  <small>{heroData.stats?.[1]?.label || 'Creative disciplines'}</small>
                </span>
              </div>
              <h1 id="hero-heading" className="hero-heading">
                {heroData.heading ? heroData.heading.replace(/\.$/, '') : 'Hello'}
                <span>.</span>
              </h1>
              <p className="hero-subtitle">
                {heroData.subtitle || "I'm Ashok, a developer building calm, useful digital experiences."}
              </p>
            </div>
            <div className="hero-portrait">
              <div className="portrait-frame">
                <span className="portrait-initials" aria-hidden="true">
                  {heroData.initials || 'AR'}
                </span>
              </div>
              <p>
                {heroData.location ? (
                  heroData.location.split('\n').map((line: string, i: number) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                ) : (
                  <>
                    Butwal, Nepal
                    <br />
                    Available for thoughtful collaborations
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="hero-meta">
            <span>{heroData.metaLeft || 'Scroll to explore ↓'}</span>
            <span>{heroData.metaRight || 'Selected work · 01 / 06'}</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DYNAMIC HOMEPAGE SECTIONS DRIVEN BY CMS (ORDER & VISIBILITY CONFIGURABLE)  */}
        {/* ========================================================================= */}
        <div className="shell-width">
          {order.map((sectionKey) => renderSection(sectionKey))}
        </div>
      </div>
    </SkeletonReveal>
  )
}
