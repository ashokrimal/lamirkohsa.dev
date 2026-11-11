import {
  getProfileContentResult,
  getPublishedCmsContentResult,
 } from '@/app/actions/content-cms'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { GitHubActivitySparkline } from '@/components/ui/GitHubActivitySparkline'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { ABOUT_SECTIONS, CMS_COLLECTIONS, CMS_SCHEMA } from '@/lib/cms-schema'
import { uiStrings } from '@/lib/ui-strings'
import { Compass, Globe, Heart, Sparkles } from 'lucide-react'
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
  const copyResult = await getPageCopy()
  const copy = copyResult.status === 'ok' ? copyResult.data.about : undefined
  const sections = copy?.sections

  const [profileResult, experienceResult, educationResult, skillsResult, socialResult] =
    await Promise.all([
      getProfileContentResult(),
      getPublishedCmsContentResult(CMS_COLLECTIONS.experience),
      getPublishedCmsContentResult(CMS_COLLECTIONS.education),
      getPublishedCmsContentResult(CMS_COLLECTIONS.skills),
      getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
    ])

  const experienceRaw = experienceResult.status === 'ok' ? experienceResult.data : []
  const educationRaw = educationResult.status === 'ok' ? educationResult.data : []
  const skillsRaw = skillsResult.status === 'ok' ? skillsResult.data : []
  const socialRaw = socialResult.status === 'ok' ? socialResult.data : []

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

  const profile = profileResult.status === 'ok' ? profileResult.data : {}
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
    { label: uiStrings.about.fullName.en, value: value(profileData, 'fullName') },
    { label: uiStrings.about.professionalTitle.en, value: value(profileData, 'headline') },
    { label: uiStrings.about.location.en, value: value(profileData, 'location') },
    { label: uiStrings.about.availability.en, value: value(profileData, 'availability') },
    { label: uiStrings.about.focus.en, value: value(profileData, 'focus') },
    { label: uiStrings.about.email.en, value: value(profileData, 'email') },
  ].filter((row) => row.value)

  // Section numbers come from the about registry, so they stay consecutive.
  const sectionIndex = (id: string) => ABOUT_SECTIONS.findIndex((section) => section.id === id)

  return (
    <PageShell>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? CMS_SCHEMA.sections.pages.about.label}
        accent={copy?.accent}
        description={copy?.description ?? summary}
      />

      {copyResult.status === 'error' && (
        <CmsErrorState message={copyResult.message} className="mt-10" />
      )}

      {/* 1. BIOGRAPHY + PROFILE */}
      {bio || summary || profileImage ? (
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
      ) : profileResult.status === 'error' ? (
        <section className="pt-10 md:pt-14">
          <CmsErrorState message={profileResult.message} />
        </section>
      ) : (
        <section className="pt-10 md:pt-14">
          <EmptyState
            icon={Compass}
            message={CMS_SCHEMA.sections.pages.about.emptyState.message}
            hint={CMS_SCHEMA.sections.pages.about.emptyState.hint}
            actionLabel={CMS_SCHEMA.sections.pages.about.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.sections.pages.about.emptyState.actionHref}
          />
        </section>
      )}

      {/* 2. EDUCATION */}
      <PageSection
        id="education"
        number={sectionIndex('education')}
        eyebrow={sections?.education?.eyebrow}
        krEyebrow={sections?.education?.krEyebrow}
        title={sections?.education?.title ?? CMS_SCHEMA.collections.education.label}
        accent={sections?.education?.accent}
        description={sections?.education?.description}
      >
        {educationResult.status === 'error' ? (
          <CmsErrorState message={educationResult.message} />
        ) : (
          <ExperienceTimeline
            items={education}
            type="education"
            emptyMessage={CMS_SCHEMA.collections.education.emptyState.message}
            emptyHint={CMS_SCHEMA.collections.education.emptyState.hint}
            emptyActionLabel={CMS_SCHEMA.collections.education.emptyState.actionLabel}
            emptyActionHref={CMS_SCHEMA.collections.education.emptyState.actionHref}
          />
        )}
      </PageSection>

      {/* 3. PROFESSIONAL EXPERIENCE */}
      <PageSection
        id="experience"
        number={sectionIndex('experience')}
        eyebrow={sections?.experience?.eyebrow}
        krEyebrow={sections?.experience?.krEyebrow}
        title={sections?.experience?.title ?? CMS_SCHEMA.collections.experience.label}
        accent={sections?.experience?.accent}
        description={sections?.experience?.description}
      >
        {experienceResult.status === 'error' ? (
          <CmsErrorState message={experienceResult.message} />
        ) : (
          <ExperienceTimeline
            items={experience}
            type="experience"
            emptyMessage={CMS_SCHEMA.collections.experience.emptyState.message}
            emptyHint={CMS_SCHEMA.collections.experience.emptyState.hint}
            emptyActionLabel={CMS_SCHEMA.collections.experience.emptyState.actionLabel}
            emptyActionHref={CMS_SCHEMA.collections.experience.emptyState.actionHref}
          />
        )}
      </PageSection>

      {/* 4. TECHNICAL SKILLS */}
      <PageSection
        id="skills"
        number={sectionIndex('skills')}
        eyebrow={sections?.skills?.eyebrow}
        krEyebrow={sections?.skills?.krEyebrow}
        title={sections?.skills?.title ?? CMS_SCHEMA.collections.skills.label}
        accent={sections?.skills?.accent}
        description={sections?.skills?.description}
      >
        {skillsResult.status === 'error' ? (
          <CmsErrorState message={skillsResult.message} />
        ) : skills.length > 0 ? (
          <SkillDisplay skills={skills} />
        ) : (
          <EmptyState
            icon={Sparkles}
            message={CMS_SCHEMA.collections.skills.emptyState.message}
            hint={CMS_SCHEMA.collections.skills.emptyState.hint}
            actionLabel={CMS_SCHEMA.collections.skills.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.collections.skills.emptyState.actionHref}
          />
        )}
      </PageSection>

      {/* 5. PERSONAL INTERESTS */}
      <PageSection
        id="interests"
        number={sectionIndex('interests')}
        eyebrow={sections?.interests?.eyebrow}
        krEyebrow={sections?.interests?.krEyebrow}
        title={sections?.interests?.title ?? CMS_SCHEMA.collections.interests.label}
        accent={sections?.interests?.accent}
        description={sections?.interests?.description}
      >
        {profileResult.status === 'error' ? (
          <CmsErrorState message={profileResult.message} />
        ) : interests.length > 0 ? (
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
        ) : (
          <EmptyState
            icon={Heart}
            message={CMS_SCHEMA.collections.interests.emptyState.message}
            hint={CMS_SCHEMA.collections.interests.emptyState.hint}
            actionLabel={CMS_SCHEMA.collections.interests.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.collections.interests.emptyState.actionHref}
          />
        )}
      </PageSection>

      {/* 6. SOCIAL LINKS */}
      <PageSection
        id="socials"
        number={sectionIndex('socials')}
        eyebrow={sections?.socials?.eyebrow}
        krEyebrow={sections?.socials?.krEyebrow}
        title={sections?.socials?.title ?? CMS_SCHEMA.collections.socialLinks.label}
        accent={sections?.socials?.accent}
        description={sections?.socials?.description}
      >
        {socialResult.status === 'error' ? (
          <CmsErrorState message={socialResult.message} />
        ) : socialLinks.length > 0 ? (
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
        ) : (
          <EmptyState
            icon={Globe}
            message={CMS_SCHEMA.collections.socialLinks.emptyState.message}
            hint={CMS_SCHEMA.collections.socialLinks.emptyState.hint}
            actionLabel={CMS_SCHEMA.collections.socialLinks.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.collections.socialLinks.emptyState.actionHref}
          />
        )}
      </PageSection>

      {/* 7. GITHUB ACTIVITY — always the final section */}
      <PageSection
        id="github"
        number={sectionIndex('github')}
        eyebrow={sections?.github?.eyebrow}
        krEyebrow={sections?.github?.krEyebrow}
        title={sections?.github?.title ?? CMS_SCHEMA.sections.home.github.label}
        accent={sections?.github?.accent}
        description={sections?.github?.description}
      >
        {profileResult.status === 'error' ? (
          <CmsErrorState message={profileResult.message} />
        ) : profile.github ? (
          <GitHubActivitySparkline username={profile.github} showRecentCommits={true} />
        ) : (
          <EmptyState
            icon={Globe}
            message={CMS_SCHEMA.sections.home.github.emptyState.message}
            hint={CMS_SCHEMA.sections.home.github.emptyState.hint}
            actionLabel={CMS_SCHEMA.sections.home.github.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.sections.home.github.emptyState.actionHref}
          />
        )}
      </PageSection>

      <PageNav />
    </PageShell>
  )
}
