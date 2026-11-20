import { ArrowUpRight, Clock, Globe, Heart, Link2, Mail, MapPin, PieChart } from 'lucide-react'
import { getProfileContentResult, getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { getSiteConfig } from '@/lib/site-content'
import { getPublishedProjects } from '@/lib/studio/data'
import { getProjectsResult } from '@/lib/projects'
import { CMS_COLLECTIONS, CMS_SCHEMA } from '@/lib/cms-schema'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { TechDistributionChart } from '@/components/projects/TechDistributionChart'
import ContactForm from '@/components/ContactForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'

/**
 * Section bodies that read the studio's record collections. They render only
 * the body; `SectionRenderer` supplies the numbered heading and CTA, so the
 * About, Media and Contact pages are editable from Pages & Sections.
 */

function stringValue(payload: Record<string, unknown> | undefined, key: string) {
  const raw = payload?.[key]
  return typeof raw === 'string' ? raw : ''
}

function dedupeItems<T>(items: T[], keyFn: (item: T) => string | number | undefined): T[] {
  const seen = new Set<string | number>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (key === undefined || key === '' || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function timelineItems(collection: string) {
  const result = await getPublishedCmsContentResult(collection)
  if (result.status !== 'ok') return { error: result.status === 'error' ? result.message : undefined, items: [] }
  const items = dedupeItems(
    result.data.map((entry) => ({
      id: entry.id,
      title: entry.title,
      organization: stringValue(entry.payload, 'organization'),
      period: stringValue(entry.payload, 'period'),
      location: stringValue(entry.payload, 'location') || undefined,
      description: stringValue(entry.payload, 'description'),
      highlights: Array.isArray(entry.payload?.highlights)
        ? (entry.payload.highlights as string[])
        : undefined,
    })),
    (entry) => `${entry.title}::${entry.organization}` || entry.id,
  )
  return { error: undefined, items }
}

export async function ExperienceSectionBody({ kind }: { kind: 'experience' | 'education' }) {
  const isEducation = kind === 'education'
  const { error, items } = await timelineItems(
    isEducation ? CMS_COLLECTIONS.education : CMS_COLLECTIONS.experience,
  )
  if (error) return <CmsErrorState message={error} />

  const schema = isEducation ? CMS_SCHEMA.collections.education : CMS_SCHEMA.collections.experience
  return (
    <ExperienceTimeline
      items={items}
      type={kind}
      emptyEyebrow={isEducation ? 'Education' : 'Experience'}
      emptyMessage={schema.emptyState.message}
      emptyHint={schema.emptyState.hint}
    />
  )
}

export async function SkillsSectionBody() {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.skills)
  if (result.status === 'error') return <CmsErrorState message={result.message} />

  const skills = dedupeItems(
    (result.status === 'ok' ? result.data : []).map((entry) => ({
      category: stringValue(entry.payload, 'category') || entry.title,
      items: Array.isArray(entry.payload?.items) ? (entry.payload.items as string[]) : [],
      level: stringValue(entry.payload, 'level') || undefined,
    })),
    (skill) => skill.category,
  ).filter((skill) => skill.items.length > 0)

  if (skills.length === 0) {
    return (
      <EmptyState
        eyebrow="Technical Skills"
        icon={PieChart}
        message={CMS_SCHEMA.collections.skills.emptyState.message}
        hint={CMS_SCHEMA.collections.skills.emptyState.hint}
      />
    )
  }

  return <SkillDisplay skills={skills} />
}

export async function InterestsSectionBody() {
  const profile = await getProfileContentResult()
  if (profile.status === 'error') return <CmsErrorState message={profile.message} />
  const profileInterests = profile.status === 'ok' ? profile.data.interests : undefined
  const interests = Array.isArray(profileInterests)
    ? profileInterests.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
    : []

  if (interests.length === 0) {
    return (
      <EmptyState
        eyebrow="Interests"
        icon={Heart}
        message={CMS_SCHEMA.collections.interests.emptyState.message}
        hint={CMS_SCHEMA.collections.interests.emptyState.hint}
      />
    )
  }

  return (
    <ul className="flex flex-wrap gap-2.5">
      {interests.map((interest) => (
        <li
          key={interest}
          className="inline-flex items-center rounded-full border border-line-hairline bg-overlay px-3.5 py-1.5 text-xs text-ink-secondary"
        >
          {interest}
        </li>
      ))}
    </ul>
  )
}

export async function SocialsSectionBody() {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks)
  if (result.status === 'error') return <CmsErrorState message={result.message} />

  const links = dedupeItems(
    (result.status === 'ok' ? result.data : [])
      .map((entry) => ({
        id: entry.id,
        label: stringValue(entry.payload, 'label') || entry.title,
        href: stringValue(entry.payload, 'href'),
        handle: stringValue(entry.payload, 'handle') || undefined,
      }))
      .filter((link) => link.href),
    (link) => link.href || link.label,
  )

  if (links.length === 0) {
    return (
      <EmptyState
        eyebrow="Social Channels"
        icon={Link2}
        message={CMS_SCHEMA.collections.socialLinks.emptyState.message}
        hint={CMS_SCHEMA.collections.socialLinks.emptyState.hint}
      />
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-line-subtle bg-surface/80 p-4 text-ink transition-colors hover:border-line-strong"
          >
            <span className="text-sm font-medium">{link.label}</span>
            <span className="truncate text-xs text-muted">{link.handle || link.href}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export async function TechnologySectionBody() {
  const studioProjects = await getPublishedProjects()
  const legacyResult = studioProjects.length > 0 ? null : await getProjectsResult()
  if (legacyResult?.status === 'error') return <CmsErrorState message={legacyResult.message} />

  const projects =
    studioProjects.length > 0
      ? studioProjects.map((project) => ({
          id: project.id,
          slug: project.slug,
          title: project.title,
          techStack: project.techStack,
          category: project.category,
          phases: [],
          features: [],
          featured: project.featuredOrder !== undefined,
        }))
      : legacyResult?.status === 'ok'
        ? legacyResult.data
        : []

  if (projects.length === 0) {
    return (
      <EmptyState
        eyebrow="Stack Telemetry"
        icon={PieChart}
        message="No technology distribution data yet."
        hint="Technology shares and stack categories will appear here once published projects declare stack tags."
      />
    )
  }

  // TechDistributionChart only reads id/title/techStack; the wider shape is
  // accepted so the legacy and studio project lists share the same chart.
  return <TechDistributionChart projects={projects as Parameters<typeof TechDistributionChart>[0]['projects']} />
}

function iconFor(label: string) {
  const key = label.toLowerCase()
  if (key.includes('mail') || key.includes('email')) return Mail
  return Globe
}

export async function ContactSectionBody() {
  const [siteResult, socialResult] = await Promise.all([
    getSiteConfig(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
  ])
  if (siteResult.status === 'error') return <CmsErrorState message={siteResult.message} />

  const site = siteResult.status === 'ok' ? siteResult.data : undefined
  const contact = site?.contact ?? {}
  const socials =
    socialResult.status === 'ok'
      ? socialResult.data
          .map((entry) => ({
            label: stringValue(entry.payload, 'label') || entry.title,
            href: stringValue(entry.payload, 'href'),
          }))
          .filter((link) => link.href)
      : []

  const formEnabled = contact.formEnabled !== false
  const hasChannels = Boolean(contact.email || contact.phone || socials.length > 0)
  if (!formEnabled && !hasChannels) {
    return (
      <EmptyState
        eyebrow="Contact Details"
        icon={Mail}
        message={CMS_SCHEMA.collections.siteSettings.records?.contactDetails.emptyState.message ?? 'Contact details are not published yet.'}
        hint={CMS_SCHEMA.collections.siteSettings.records?.contactDetails.emptyState.hint}
      />
    )
  }

  return (
    <div
      className={
        formEnabled
          ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]'
          : 'grid gap-6'
      }
    >
      {formEnabled && <ContactForm responseTime={contact.responseTime} />}

      <div className="space-y-6">
        {hasChannels && (
          <aside className="apple-card space-y-4 p-6 md:p-7">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-line-subtle bg-overlay-faint p-3 font-mono text-xs text-ink transition-colors hover:border-line-medium"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                  <span className="truncate">{contact.email}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-line-subtle bg-overlay-faint p-3 font-mono text-xs text-ink transition-colors hover:border-line-medium"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                  <span className="truncate">{contact.phone}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              </a>
            )}
            {socials.map((social) => {
              const Icon = iconFor(social.label)
              return (
                <a
                  key={`${social.label}-${social.href}`}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line-subtle bg-overlay-faint p-3 font-mono text-xs text-ink transition-colors hover:border-line-medium"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    <span className="truncate">{social.label}</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                </a>
              )
            })}
          </aside>
        )}

        {(contact.location || contact.timeZone || contact.availability) && (
          <aside className="apple-card p-6 md:p-7">
            <dl className="space-y-3 text-xs">
              {contact.location && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    Location
                  </dt>
                  <dd className="text-right font-semibold text-ink">{contact.location}</dd>
                </div>
              )}
              {contact.timeZone && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    Time zone
                  </dt>
                  <dd className="text-right font-semibold text-ink">{contact.timeZone}</dd>
                </div>
              )}
              {contact.availability && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Availability</dt>
                  <dd className="text-right font-medium text-accent">{contact.availability}</dd>
                </div>
              )}
            </dl>
          </aside>
        )}
      </div>
    </div>
  )
}
