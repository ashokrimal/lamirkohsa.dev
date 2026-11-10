import {
  getProfileContent,
  getExperienceItems,
  getEducationItems,
  getSkillsContent,
  getPublishedCmsContent,
  getGalleryItems,
} from '@/app/actions/content-cms'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { CertificateCard } from '@/components/ui/CertificateCard'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'
import { PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'

export default async function AboutContent() {
  // Fetch ALL About content directly from CMS (Single Source of Truth)
  const [profile, experienceRaw, educationRaw, skillsRaw, certificatesRaw, galleryItemsRaw] =
    await Promise.all([
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
    highlights: Array.isArray(e.payload?.highlights)
      ? (e.payload.highlights as string[])
      : undefined,
  }))

  // Transform Education
  const education = educationRaw.map((e) => ({
    id: e.id,
    title: e.title,
    organization: typeof e.payload?.organization === 'string' ? e.payload.organization : '',
    period: typeof e.payload?.period === 'string' ? e.payload.period : '',
    location: typeof e.payload?.location === 'string' ? e.payload.location : undefined,
    description: typeof e.payload?.description === 'string' ? e.payload.description : '',
    highlights: Array.isArray(e.payload?.highlights)
      ? (e.payload.highlights as string[])
      : undefined,
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
    credentialUrl:
      typeof c.payload?.credentialUrl === 'string' ? c.payload.credentialUrl : undefined,
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
    <PageShell>
      <PageHero
        eyebrow="About / Software Developer"
        krEyebrow="소개"
        title="Making things"
        accent="matter."
        description={
          profile.summary ||
          'A Bachelor of Computer Applications student and full-stack software developer focused on thoughtful interfaces, dependable backend systems, and the details that make software feel human.'
        }
      />

      {/* Narrative & quick coordinates */}
      <section className="pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 md:gap-8 items-start">
        <div className="space-y-4 text-sm md:text-base text-muted leading-relaxed">
          <p>
            {profile.bio ||
              'I enjoy turning open questions into clear, dependable digital experiences. My current focus is frontend development, useful products, AI, robotics, and learning through practice.'}
          </p>
          <p>
            My work sits between engineering execution and human curiosity. At Dursikshya Education,
            I instructed students on connecting Python software logic to physical Arduino
            microcontrollers, making abstract algorithms tactile and real.
          </p>
          <p>
            Outside of the terminal, I follow music, anime, photography, and the quiet architectures
            of everyday life.
          </p>
        </div>

        <aside className="apple-card p-6 md:p-7 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-line-subtle">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Quick Coordinates
            </h2>
            <span lang="ko" className="font-korean text-[10px] text-muted">
              기본 정보
            </span>
          </div>
          <dl className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Location</dt>
              <dd className="font-semibold text-ink text-right">
                {profile.location || 'Butwal, Nepal'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Focus</dt>
              <dd className="font-semibold text-ink text-right">
                Full-Stack &amp; Interface Craft
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Availability</dt>
              <dd className="font-medium text-accent text-right">Open for collaborations</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Education</dt>
              <dd className="font-semibold text-ink text-right">BCA · Crimson College</dd>
            </div>
          </dl>
        </aside>
      </section>

      <PageSection
        id="experience"
        eyebrow="01 / Work Experience"
        krEyebrow="경력 사항"
        title="Work in"
        accent="practice."
        description="Professional roles and teaching commitments where curiosity became practical impact."
      >
        <ExperienceTimeline items={experience} type="experience" />
      </PageSection>

      <PageSection
        id="education"
        eyebrow="02 / Education"
        krEyebrow="학력 사항"
        title="Learning with"
        accent="intention."
        description="Academic foundation in computer applications, distributed software, and algorithmic thinking."
      >
        <ExperienceTimeline items={education} type="education" />
      </PageSection>

      <PageSection
        id="skills"
        eyebrow="03 / Engineering Stack"
        krEyebrow="기술 스택"
        title="Tools for turning"
        accent="ideas real."
        description="A practical, modern stack spanning frontend systems, backend services, and embedded hardware."
      >
        <SkillDisplay skills={skills} />
      </PageSection>

      <PageSection
        id="certificates"
        eyebrow="04 / Verified Credentials"
        krEyebrow="자격 증명"
        title="Verified"
        accent="milestones."
        description="Certificates and structured coursework in machine learning, full-stack development, and computer science."
      >
        {certificates.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id || cert.title} certificate={cert} />
            ))}
          </div>
        ) : (
          <div className="apple-card p-8 text-center text-sm text-muted">
            Credentials will appear here as they are published in the CMS.
          </div>
        )}
      </PageSection>

      <PageSection
        id="gallery"
        eyebrow="05 / Visual Journal"
        krEyebrow="시각 기록"
        title="Beyond the"
        accent="screen."
        description="Photographic frames exploring quiet Nepal geometry, mountain landscapes, and desk setups."
        linkHref="/gallery"
        linkLabel="Open the photography archive"
      >
        <GalleryGrid items={gallery} columns={4} />
      </PageSection>

      {/* GitHub status closes the page, after every curated section */}
      <PageSection
        id="github"
        eyebrow="06 / Live From GitHub"
        krEyebrow="깃허브 활동"
        title="Commit"
        accent="activity."
        description="A live view of public repositories, streaks and recent commits — the work-in-progress side of the story."
      >
        <GitHubActivitySparkline showRecentCommits={true} />
      </PageSection>

      <PageNav
        backLabel="Return home"
        nextHref="/projects"
        nextLabel="Explore technical projects & case studies"
      />
    </PageShell>
  )
}
