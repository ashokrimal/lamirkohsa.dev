import Link from 'next/link'
import { ArrowUpRight, Award, Briefcase, Calendar, CheckCircle2, Code2, Compass, GraduationCap, MapPin, Terminal } from 'lucide-react'
import {
  getProfileContent,
  getExperienceItems,
  getEducationItems,
  getSkillsContent,
  getPublishedCmsContent,
  getGalleryItems,
} from '@/app/actions/content-cms'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { CertificateCard } from '@/components/ui/CertificateCard'
import { GalleryGrid } from '@/components/ui/GalleryGrid'

export default async function AboutContent() {
  // Fetch ALL About content directly from CMS (Single Source of Truth)
  const [
    profile,
    experienceRaw,
    educationRaw,
    skillsRaw,
    certificatesRaw,
    galleryItemsRaw,
  ] = await Promise.all([
    getProfileContent(),
    getExperienceItems(),
    getEducationItems(),
    getSkillsContent(),
    getPublishedCmsContent('Certificates'),
    getGalleryItems(4),
  ])

  // Transform Experience
  const experience = experienceRaw.map((e) => ({
    id: e.id,
    title: e.title,
    organization: typeof e.payload?.organization === 'string' ? e.payload.organization : '',
    period: typeof e.payload?.period === 'string' ? e.payload.period : '',
    location: typeof e.payload?.location === 'string' ? e.payload.location : undefined,
    description: typeof e.payload?.description === 'string' ? e.payload.description : '',
    highlights: Array.isArray(e.payload?.highlights) ? (e.payload.highlights as string[]) : undefined,
  }))

  // Transform Education
  const education = educationRaw.map((e) => ({
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

  // Transform Certificates
  const certificates = certificatesRaw.map((c) => ({
    id: c.id,
    title: c.title,
    organization: typeof c.payload?.organization === 'string' ? c.payload.organization : '',
    date: typeof c.payload?.date === 'string' ? c.payload.date : undefined,
    credentialUrl: typeof c.payload?.credentialUrl === 'string' ? c.payload.credentialUrl : undefined,
    credentialId: typeof c.payload?.credentialId === 'string' ? c.payload.credentialId : undefined,
    description: typeof c.payload?.description === 'string' ? c.payload.description : undefined,
  }))

  // Transform Gallery
  const gallery = galleryItemsRaw.map((g) => ({
    id: g.id,
    title: g.title,
    imageUrl: typeof g.payload?.imageUrl === 'string' ? g.payload.imageUrl : '',
    category: typeof g.payload?.category === 'string' ? g.payload.category : 'Photography',
    description: typeof g.payload?.description === 'string' ? g.payload.description : '',
    location: typeof g.payload?.location === 'string' ? g.payload.location : undefined,
  }))

  return (
    <main className="about-page shell-width py-12 md:py-20 space-y-16 md:space-y-24">
      {/* 1. ABOUT INTRO & BIOGRAPHY */}
      <section className="about-intro border-b border-[var(--line)] pb-12">
        <div className="max-w-4xl space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
            About / Software Developer
          </p>
          <h1 className="text-4xl md:text-7xl font-normal text-[var(--ink)] tracking-[-0.06em] leading-[0.95]">
            Making things <span className="font-serif italic text-[var(--accent)]">matter.</span>
          </h1>
          <p className="mt-4 text-base md:text-xl text-[var(--muted)] leading-relaxed">
            {profile.summary ||
              'A Bachelor of Computer Applications student and full-stack software developer focused on thoughtful interfaces, dependable backend systems, and the details that make software feel human.'}
          </p>
        </div>

        {/* Narrative & Snapshot Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div className="space-y-4 text-xs md:text-sm text-[var(--muted)] leading-relaxed">
            <p>
              {profile.bio ||
                'I enjoy turning open questions into clear, dependable digital experiences. My current focus is frontend development, useful products, AI, robotics, and learning through practice.'}
            </p>
            <p>
              My work sits between engineering execution and human curiosity. At Dursikshya Education, I instructed students on connecting Python software logic to physical Arduino microcontrollers, making abstract algorithms tactile and real.
            </p>
            <p>
              Outside of the terminal, I follow music, anime, photography, and the quiet architectures of everyday life.
            </p>
          </div>

          <div className="p-6 rounded-sm border border-[var(--line)] bg-[var(--surface)] space-y-3.5 text-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] pb-2 border-b border-[var(--line)]/60">
              Quick Coordinates
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Location:</span>
                <span className="font-semibold text-[var(--ink)]">{profile.location || 'Butwal, Nepal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Focus:</span>
                <span className="font-semibold text-[var(--ink)]">Full-Stack &amp; Interface Craft</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Availability:</span>
                <span className="font-semibold text-[var(--accent)]">Open for collaborations</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Education:</span>
                <span className="font-semibold text-[var(--ink)]">BCA · Crimson College</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPERIENCE TIMELINE */}
      <section id="experience" className="profile-section" aria-labelledby="experience-heading">
        <SectionHeader
          eyebrow="01 / Work Experience"
          title="Work in"
          accent="practice."
          description="Professional roles and teaching commitments where curiosity became practical impact."
        />
        <div className="mt-8">
          <ExperienceTimeline items={experience} type="experience" />
        </div>
      </section>

      {/* 3. EDUCATION */}
      <section id="education" className="profile-section" aria-labelledby="education-heading">
        <SectionHeader
          eyebrow="02 / Education"
          title="Learning with"
          accent="intention."
          description="Academic foundation in computer applications, distributed software, and algorithmic thinking."
        />
        <div className="mt-8">
          <ExperienceTimeline items={education} type="education" />
        </div>
      </section>

      {/* 4. TECHNICAL TOOLKIT & SKILLS */}
      <section id="skills" className="profile-section" aria-labelledby="skills-heading">
        <SectionHeader
          eyebrow="03 / Engineering Stack"
          title="Tools for turning"
          accent="ideas real."
          description="A practical, modern stack spanning frontend systems, backend services, and embedded hardware."
        />
        <div className="mt-8">
          <SkillDisplay skills={skills} />
        </div>
      </section>

      {/* 5. CERTIFICATES & RECOGNITION */}
      <section id="certificates" className="profile-section" aria-labelledby="certificates-heading">
        <SectionHeader
          eyebrow="04 / Verified Credentials"
          title="Verified"
          accent="milestones."
          description="Certificates and structured coursework in machine learning, full-stack development, and computer science."
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id || cert.title} certificate={cert} />
          ))}
        </div>
      </section>

      {/* 6. VISUAL JOURNAL / GALLERY */}
      <section id="gallery" className="profile-section" aria-labelledby="gallery-heading">
        <SectionHeader
          eyebrow="05 / Visual Journal"
          title="Beyond the"
          accent="screen."
          description="Photographic frames exploring quiet Nepal geometry, mountain landscapes, and desk setups."
          linkHref="/media"
          linkLabel="Explore complete media archives"
        />
        <div className="mt-8">
          <GalleryGrid items={gallery} showViewAll={true} viewAllHref="/media" columns={4} />
        </div>
      </section>

      {/* Footer CTA */}
      <div className="pt-8 border-t border-[var(--line)] flex items-center justify-between text-xs">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--ink)]">
          ← Return home
        </Link>
        <Link href="/projects" className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
          Explore technical projects &amp; case studies <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </main>
  )
}
