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
import { getPageCopy } from '@/lib/site-content'

function value(profile: Record<string, unknown>, key: string) {
  const raw = profile[key]
  return typeof raw === 'string' && raw.trim() ? raw : undefined
}

export default async function AboutContent() {
  const copy = (await getPageCopy()).about
  const sections = copy?.sections

  const [profile, experienceRaw, educationRaw, skillsRaw, certificatesRaw, galleryItemsRaw] =
    await Promise.all([
      getProfileContent(),
      getExperienceItems(),
      getEducationItems(),
      getSkillsContent(),
      getPublishedCmsContent('Certificates'),
      getGalleryItems(4),
    ])

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

  const skills = skillsRaw.map((s) => ({
    category: typeof s.payload?.category === 'string' ? s.payload.category : s.title,
    items: Array.isArray(s.payload?.items) ? (s.payload.items as string[]) : [],
    level: typeof s.payload?.level === 'string' ? s.payload.level : undefined,
  }))

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

  const gallery = galleryItemsRaw.map((g) => ({
    id: g.id,
    title: g.title,
    imageUrl: typeof g.payload?.imageUrl === 'string' ? g.payload.imageUrl : '',
    category: typeof g.payload?.category === 'string' ? g.payload.category : undefined,
    description: typeof g.payload?.description === 'string' ? g.payload.description : '',
    location: typeof g.payload?.location === 'string' ? g.payload.location : undefined,
  }))

  const summary = value(profile as Record<string, unknown>, 'summary')
  const bio = value(profile as Record<string, unknown>, 'bio')
  const coordinates = [
    { label: value(profile as Record<string, unknown>, 'locationLabel'), value: value(profile as Record<string, unknown>, 'location') },
    { label: value(profile as Record<string, unknown>, 'focusLabel'), value: value(profile as Record<string, unknown>, 'focus') },
    { label: value(profile as Record<string, unknown>, 'availabilityLabel'), value: value(profile as Record<string, unknown>, 'availability') },
    { label: value(profile as Record<string, unknown>, 'educationLabel'), value: value(profile as Record<string, unknown>, 'education') },
  ].filter((item) => item.label && item.value)

  return (
    <PageShell>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? ''}
        accent={copy?.accent}
        description={copy?.description ?? summary}
      />

      {(bio || coordinates.length > 0) && (
        <section className="pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 md:gap-8 items-start">
          {bio && (
            <div className="space-y-4 text-sm md:text-base text-muted leading-relaxed">
              {bio.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}

          {coordinates.length > 0 && (
            <aside className="apple-card p-6 md:p-7 space-y-4 text-xs">
              {sections?.coordinates?.title && (
                <div className="pb-3 border-b border-line-subtle">
                  <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                    {sections.coordinates.title}
                  </h2>
                </div>
              )}
              <dl className="space-y-3">
                {coordinates.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{item.label}</dt>
                    <dd className="font-semibold text-ink text-right">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </section>
      )}

      {sections?.experience?.title && (
        <PageSection
          id="experience"
          eyebrow={sections.experience.eyebrow}
          krEyebrow={sections.experience.krEyebrow}
          title={sections.experience.title}
          accent={sections.experience.accent}
          description={sections.experience.description}
        >
          <ExperienceTimeline items={experience} type="experience" />
        </PageSection>
      )}

      {sections?.education?.title && (
        <PageSection
          id="education"
          eyebrow={sections.education.eyebrow}
          krEyebrow={sections.education.krEyebrow}
          title={sections.education.title}
          accent={sections.education.accent}
          description={sections.education.description}
        >
          <ExperienceTimeline items={education} type="education" />
        </PageSection>
      )}

      {sections?.skills?.title && (
        <PageSection
          id="skills"
          eyebrow={sections.skills.eyebrow}
          krEyebrow={sections.skills.krEyebrow}
          title={sections.skills.title}
          accent={sections.skills.accent}
          description={sections.skills.description}
        >
          <SkillDisplay skills={skills} />
        </PageSection>
      )}

      {sections?.certificates?.title && certificates.length > 0 && (
        <PageSection
          id="certificates"
          eyebrow={sections.certificates.eyebrow}
          krEyebrow={sections.certificates.krEyebrow}
          title={sections.certificates.title}
          accent={sections.certificates.accent}
          description={sections.certificates.description}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id || cert.title} certificate={cert} />
            ))}
          </div>
        </PageSection>
      )}

      {sections?.gallery?.title && gallery.length > 0 && (
        <PageSection
          id="gallery"
          eyebrow={sections.gallery.eyebrow}
          krEyebrow={sections.gallery.krEyebrow}
          title={sections.gallery.title}
          accent={sections.gallery.accent}
          description={sections.gallery.description}
          linkHref={sections.gallery.href}
          linkLabel={sections.gallery.meta}
        >
          <GalleryGrid items={gallery} columns={4} />
        </PageSection>
      )}

      {sections?.github?.title && (
        <PageSection
          id="github"
          eyebrow={sections.github.eyebrow}
          krEyebrow={sections.github.krEyebrow}
          title={sections.github.title}
          accent={sections.github.accent}
          description={sections.github.description}
        >
          {profile.github && (
            <GitHubActivitySparkline username={profile.github} showRecentCommits={true} />
          )}
        </PageSection>
      )}

      <PageNav />
    </PageShell>
  )
}
