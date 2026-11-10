import {
  getProfileContent,
  getExperienceItems,
  getEducationItems,
  getSkillsContent,
  getPublishedCmsContent,
} from '@/app/actions/content-cms'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { CertificateCard } from '@/components/ui/CertificateCard'
import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { getPageCopy } from '@/lib/site-content'
import type { ReactNode } from 'react'

export type CollectionKind = 'experience' | 'education' | 'skills' | 'certificates' | 'resume'

function stringValue(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  return typeof value === 'string' ? value : ''
}

function mapTimeline(records: Awaited<ReturnType<typeof getExperienceItems>>) {
  return records.map((record) => ({
    id: record.id,
    title: record.title,
    organization: stringValue(record.payload, 'organization'),
    period: stringValue(record.payload, 'period'),
    location: stringValue(record.payload, 'location') || undefined,
    description: stringValue(record.payload, 'description'),
    highlights: Array.isArray(record.payload?.highlights)
      ? (record.payload.highlights as string[])
      : undefined,
  }))
}

export default async function CollectionPage({
  kind,
  heroActions,
}: {
  kind: CollectionKind
  heroActions?: ReactNode
}) {
  const copy = (await getPageCopy())[kind]

  const [profile, experienceRaw, educationRaw, skillsRaw, certificatesRaw] = await Promise.all([
    getProfileContent(),
    getExperienceItems(),
    getEducationItems(),
    getSkillsContent(),
    getPublishedCmsContent('Certificates'),
  ])

  const skills = skillsRaw.map((record) => ({
    category: stringValue(record.payload, 'category') || record.title,
    items: Array.isArray(record.payload?.items) ? (record.payload.items as string[]) : [],
    level: stringValue(record.payload, 'level') || undefined,
  }))

  const certificates = certificatesRaw.map((record) => ({
    id: record.id,
    title: record.title,
    organization: stringValue(record.payload, 'organization'),
    date: stringValue(record.payload, 'date') || undefined,
    credentialUrl: stringValue(record.payload, 'credentialUrl') || undefined,
    credentialId: stringValue(record.payload, 'credentialId') || undefined,
    description: stringValue(record.payload, 'description') || undefined,
  }))

  const profileSummary = stringValue(profile as Record<string, unknown>, 'summary')

  return (
    <PageShell className={kind === 'resume' ? 'resume-page' : undefined}>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? ''}
        accent={copy?.accent}
        description={copy?.description}
        actions={heroActions}
      />

      <div className="mt-10 md:mt-14">
        {kind === 'experience' && (
          <ExperienceTimeline items={mapTimeline(experienceRaw)} type="experience" />
        )}

        {kind === 'education' && (
          <ExperienceTimeline items={mapTimeline(educationRaw)} type="education" />
        )}

        {kind === 'skills' && <SkillDisplay skills={skills} />}

        {kind === 'certificates' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        )}

        {kind === 'resume' && (
          <div className="space-y-6">
            {(profileSummary || stringValue(profile as Record<string, unknown>, 'bio')) && (
              <article className="apple-card p-6 md:p-7 space-y-3">
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {stringValue(profile as Record<string, unknown>, 'summaryLabel')}
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {profileSummary || stringValue(profile as Record<string, unknown>, 'bio')}
                </p>
              </article>
            )}

            <ExperienceTimeline items={mapTimeline(experienceRaw)} type="experience" />
            <ExperienceTimeline items={mapTimeline(educationRaw)} type="education" />
          </div>
        )}
      </div>

      <PageNav />
    </PageShell>
  )
}
