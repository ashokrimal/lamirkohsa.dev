import {
  getProfileContentResult,
  getPublishedCmsContentResult,
  type CmsRecord,
} from '@/app/actions/content-cms'
import { ExperienceTimeline } from '@/components/ui/ExperienceTimeline'
import { SkillDisplay } from '@/components/ui/SkillDisplay'
import { CertificateCard } from '@/components/ui/CertificateCard'
import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_COLLECTIONS, CMS_SCHEMA } from '@/lib/cms-schema'
import { Award, FileText, Sparkles } from 'lucide-react'
import { getPageCopy } from '@/lib/site-content'
import type { ReactNode } from 'react'

export type CollectionKind = 'experience' | 'education' | 'skills' | 'certificates' | 'resume'

function stringValue(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  return typeof value === 'string' ? value : ''
}

function mapTimeline(records: CmsRecord[]) {
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
  const copyResult = await getPageCopy()
  const copy = copyResult.status === 'ok' ? copyResult.data[kind] : undefined

  const [profileResult, experienceResult, educationResult, skillsResult, certificatesResult] =
    await Promise.all([
      getProfileContentResult(),
      getPublishedCmsContentResult(CMS_COLLECTIONS.experience),
      getPublishedCmsContentResult(CMS_COLLECTIONS.education),
      getPublishedCmsContentResult(CMS_COLLECTIONS.skills),
      getPublishedCmsContentResult(CMS_COLLECTIONS.certificates),
    ])
  const profile = profileResult.status === 'ok' ? profileResult.data : {}
  const experienceRaw = experienceResult.status === 'ok' ? experienceResult.data : []
  const educationRaw = educationResult.status === 'ok' ? educationResult.data : []
  const skillsRaw = skillsResult.status === 'ok' ? skillsResult.data : []
  const certificatesRaw = certificatesResult.status === 'ok' ? certificatesResult.data : []
  const dataError = [profileResult, experienceResult, educationResult, skillsResult].find(
    (result) => result.status === 'error',
  ) as { status: 'error'; message: string } | undefined

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
  const profileBio = stringValue(profile as Record<string, unknown>, 'bio')
  const resumeSummary = profileSummary || profileBio
  const resumeHasContent = Boolean(
    resumeSummary || experienceRaw.length > 0 || educationRaw.length > 0,
  )

  return (
    <PageShell className={kind === 'resume' ? 'resume-page' : undefined}>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? CMS_SCHEMA.sections.pages[kind]?.label ?? ''}
        accent={copy?.accent}
        description={copy?.description}
        actions={heroActions}
      />

      <div className="mt-10 md:mt-14">
        {(copyResult.status === 'error' || dataError) && (
          <CmsErrorState
            message={copyResult.status === 'error' ? copyResult.message : dataError?.message}
            className="mb-6"
          />
        )}

        {kind === 'experience' &&
          (experienceResult.status === 'error' ? (
            <CmsErrorState message={experienceResult.message} />
          ) : (
            <ExperienceTimeline
              items={mapTimeline(experienceRaw)}
              type="experience"
              emptyMessage={CMS_SCHEMA.collections.experience.emptyState.message}
              emptyHint={CMS_SCHEMA.collections.experience.emptyState.hint}
              emptyActionLabel={CMS_SCHEMA.collections.experience.emptyState.actionLabel}
              emptyActionHref={CMS_SCHEMA.collections.experience.emptyState.actionHref}
            />
          ))}

        {kind === 'education' &&
          (educationResult.status === 'error' ? (
            <CmsErrorState message={educationResult.message} />
          ) : (
            <ExperienceTimeline
              items={mapTimeline(educationRaw)}
              type="education"
              emptyMessage={CMS_SCHEMA.collections.education.emptyState.message}
              emptyHint={CMS_SCHEMA.collections.education.emptyState.hint}
              emptyActionLabel={CMS_SCHEMA.collections.education.emptyState.actionLabel}
              emptyActionHref={CMS_SCHEMA.collections.education.emptyState.actionHref}
            />
          ))}

        {kind === 'skills' &&
          (skillsResult.status === 'error' ? (
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
          ))}

        {kind === 'certificates' &&
          (certificatesResult.status === 'error' ? (
            <CmsErrorState message={certificatesResult.message} />
          ) : certificates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {certificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              message={CMS_SCHEMA.collections.certificates.emptyState.message}
              hint={CMS_SCHEMA.collections.certificates.emptyState.hint}
              actionLabel={CMS_SCHEMA.collections.certificates.emptyState.actionLabel}
              actionHref={CMS_SCHEMA.collections.certificates.emptyState.actionHref}
            />
          ))}

        {kind === 'resume' &&
          (experienceResult.status === 'error' ? (
            <CmsErrorState message={experienceResult.message} />
          ) : educationResult.status === 'error' ? (
            <CmsErrorState message={educationResult.message} />
          ) : !resumeHasContent ? (
            <EmptyState
              icon={FileText}
              message={CMS_SCHEMA.sections.pages.resume.emptyState.message}
              hint={CMS_SCHEMA.sections.pages.resume.emptyState.hint}
              actionLabel={CMS_SCHEMA.sections.pages.resume.emptyState.actionLabel}
              actionHref={CMS_SCHEMA.sections.pages.resume.emptyState.actionHref}
            />
          ) : (
            <div className="space-y-6">
              {resumeSummary && (
                <article className="apple-card p-6 md:p-7 space-y-3">
                  <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                    {stringValue(profile as Record<string, unknown>, 'summaryLabel')}
                  </h2>
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    {resumeSummary}
                  </p>
                </article>
              )}

              {experienceRaw.length > 0 && (
                <ExperienceTimeline items={mapTimeline(experienceRaw)} type="experience" />
              )}
              {educationRaw.length > 0 && (
                <ExperienceTimeline items={mapTimeline(educationRaw)} type="education" />
              )}
            </div>
          ))}
      </div>

      <PageNav />
    </PageShell>
  )
}
