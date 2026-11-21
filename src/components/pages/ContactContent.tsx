import { Clock, MapPin } from 'lucide-react'
import ScrollObserver from '@/components/ScrollObserver'
import { MetaChip, PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { CmsErrorState } from '@/components/ui/CmsState'
import { getPageCopy, getSiteConfig } from '@/lib/site-content'
import { getPageWithSections } from '@/lib/studio/data'
import { SectionRenderer } from '@/components/studio/SectionRenderer'
import { CMS_SCHEMA } from '@/lib/cms-schema'

/**
 * Contact page. Hero copy comes from Page Copy and the body from the
 * `page_sections` rows for `/contact`; the channels section itself reads the
 * contact details and social links the studio already manages.
 */
export default async function ContactContent() {
  const [copyResult, siteResult, pageResult] = await Promise.all([
    getPageCopy(),
    getSiteConfig(),
    getPageWithSections('/contact'),
  ])
  const copy = copyResult.status === 'ok' ? copyResult.data.contact : undefined
  const site = siteResult.status === 'ok' ? siteResult.data : undefined
  const contact = site?.contact ?? {}

  return (
    <PageShell>
      <ScrollObserver />
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? CMS_SCHEMA.sections.pages.contact.label}
        accent={copy?.accent}
        description={copy?.description}
        meta={
          contact.location || contact.availability ? (
            <>
              {contact.location && <MetaChip icon={MapPin}>{contact.location}</MetaChip>}
              {contact.timeZone && <MetaChip icon={Clock}>{contact.timeZone}</MetaChip>}
              {contact.availability && <MetaChip>{contact.availability}</MetaChip>}
            </>
          ) : undefined
        }
      />

      {(copyResult.status === 'error' || siteResult.status === 'error') && (
        <CmsErrorState
          message={
            copyResult.status === 'error'
              ? copyResult.message
              : siteResult.status === 'error'
                ? siteResult.message
                : ''
          }
          className="mt-10"
        />
      )}

      <SectionRenderer sections={pageResult.sections} />

      <PageNav />
    </PageShell>
  )
}
