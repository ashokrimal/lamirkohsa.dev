import {
  getProfileContent,
  getExperienceItems,
  getEducationItems,
  getSkillsContent,
  getSocialLinks,
} from '@/app/actions/content-cms'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'
import { PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'
import { getPageCopy } from '@/lib/site-content'

function value(profile: Record<string, unknown>, key: string) {
  const raw = profile[key]
  return typeof raw === 'string' && raw.trim() ? raw : undefined
}

function stringValue(payload: Record<string, unknown> | undefined, key: string) {
  const raw = payload?.[key]
  return typeof raw === 'string' ? raw : ''
}

/**
 * About page, in the required order: biography, profile information, education,
 * experience, skills, interests, social links, then GitHub last.
 * Each block is shown only when the CMS has content for it.
 */
export default async function AboutContent() {
  const copy = (await getPageCopy()).about
  const sections = copy?.sections

  const [profile, experienceRaw, educationRaw, skillsRaw, socialRaw] = await Promise.all([
    getProfileContent(),
    getExperienceItems(),
    getEducationItems(),
    getSkillsContent(),
    getSocialLinks(),
  ])

  function dedupeItems<T>(items: T[], keyFn: (item: T) => string | number | undefined): T[] {
    const seen = new Set<string | number>()
    return items.filter((item) => {
      const key = keyFn(item)
      if (key === undefined || key === '' || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const experience = dedupeItems(
    experienceRaw.map((e) => ({
      id: e.id,
      title: e.title,
      organization: stringValue(e.payload, 'organization'),
      period: stringValue(e.payload, 'period'),
      location: stringValue(e.payload, 'location') || undefined,
      description: stringValue(e.payload, 'description'),
      highlights: Array.isArray(e.payload?.highlights)
        ? (e.payload.highlights as string[])
        : undefined,
    })),
    (e) => `${e.title}::${e.organization}` || e.id,
  )

  const education = dedupeItems(
    educationRaw.map((e) => ({
      id: e.id,
      title: e.title,
      organization: stringValue(e.payload, 'organization'),
      period: stringValue(e.payload, 'period'),
      location: stringValue(e.payload, 'location') || undefined,
      description: stringValue(e.payload, 'description'),
      highlights: Array.isArray(e.payload?.highlights)
        ? (e.payload.highlights as string[])
        : undefined,
    })),
    (e) => `${e.title}::${e.organization}` || e.id,
  )

  const skills = dedupeItems(
    skillsRaw.map((s) => ({
      category: stringValue(s.payload, 'category') || s.title,
      items: Array.isArray(s.payload?.items) ? (s.payload.items as string[]) : [],
      level: stringValue(s.payload, 'level') || undefined,
    })),
    (s) => s.category,
  ).filter((s) => s.items.length > 0)

  const socialLinks = dedupeItems(
    socialRaw.map((s) => ({
      id: s.id,
      label: stringValue(s.payload, 'label') || s.title,
      href: stringValue(s.payload, 'href'),
      handle: stringValue(s.payload, 'handle') || undefined,
    })),
    (s) => s.href || s.label,
  ).filter((s) => s.href)

  const profileData = profile as Record<string, unknown>
  const summary = value(profileData, 'summary')
  const bio = value(profileData, 'bio')
  const profileImage = value(profileData, 'avatarUrl') || value(profileData, 'imageUrl')
  const interests = Array.isArray(profile.interests)
    ? (profile.interests as unknown[]).filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
    : []

  const infoRows = [
    { label: 'Full name', value: value(profileData, 'fullName') },
    { label: 'Professional title', value: value(profileData, 'headline') },
    { label: 'Location', value: value(profileData, 'location') },
    { label: 'Availability', value: value(profileData, 'availability') },
    { label: 'Focus', value: value(profileData, 'focus') },
    { label: 'Email', value: value(profileData, 'email') },
  ].filter((row) => row.value)

  return (
    <PageShell>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? ''}
        accent={copy?.accent}
        description={copy?.description ?? summary}
      />

      {/* 1. BIOGRAPHY + PROFILE */}
      {(bio || summary || profileImage) && (
        <section className="pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 md:gap-8 items-start">
          <div className="space-y-4 text-sm md:text-base text-muted leading-relaxed">
            {summary && <p className="text-lg md:text-2xl text-ink leading-relaxed">{summary}</p>}
            {bio &&
              bio
                .split(/\n{2,}/)
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>

          <div className="space-y-5">
            {profileImage && (
              <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden border border-line-subtle bg-overlay-faint">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImage}
                  alt={value(profileData, 'fullName') || ''}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {infoRows.length > 0 && (
              <aside className="apple-card p-6 md:p-7 space-y-4 text-xs">
                <dl className="space-y-3">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4">
                      <dt className="text-muted">{row.label}</dt>
                      <dd className="font-semibold text-ink text-right">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            )}
          </div>
        </section>
      )}

      {/* 2. EDUCATION */}
      {sections?.education?.title && education.length > 0 && (
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

      {/* 3. PROFESSIONAL EXPERIENCE */}
      {sections?.experience?.title && experience.length > 0 && (
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

      {/* 4. TECHNICAL SKILLS */}
      {sections?.skills?.title && skills.length > 0 && (
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

      {/* 5. PERSONAL INTERESTS */}
      {sections?.interests?.title && interests.length > 0 && (
        <PageSection
          id="interests"
          eyebrow={sections.interests.eyebrow}
          krEyebrow={sections.interests.krEyebrow}
          title={sections.interests.title}
          accent={sections.interests.accent}
          description={sections.interests.description}
        >
          <ul className="flex flex-wrap gap-2.5">
            {interests.map((interest) => (
              <li
                key={interest}
                className="inline-flex items-center rounded-full bg-overlay border border-line-hairline px-3.5 py-1.5 text-xs text-ink-secondary"
              >
                {interest}
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      {/* 6. SOCIAL LINKS */}
      {sections?.socials?.title && socialLinks.length > 0 && (
        <PageSection
          id="socials"
          eyebrow={sections.socials.eyebrow}
          krEyebrow={sections.socials.krEyebrow}
          title={sections.socials.title}
          accent={sections.socials.accent}
          description={sections.socials.description}
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-surface/80 border border-line-subtle hover:border-line-strong transition-colors text-ink"
                >
                  <span className="text-sm font-medium">{link.label}</span>
                  <span className="text-xs text-muted">{link.handle || link.href}</span>
                </a>
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      {/* 7. GITHUB ACTIVITY — always the final section */}
      {sections?.github?.title && profile.github && (
        <PageSection
          id="github"
          eyebrow={sections.github.eyebrow}
          krEyebrow={sections.github.krEyebrow}
          title={sections.github.title}
          accent={sections.github.accent}
          description={sections.github.description}
        >
          <GitHubActivitySparkline username={profile.github} showRecentCommits={true} />
        </PageSection>
      )}

      <PageNav />
    </PageShell>
  )
}
