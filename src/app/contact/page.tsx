import type { Metadata } from 'next'
import ContactContent from '@/components/pages/ContactContent'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { getPageCopy, getSiteConfig } from '@/lib/site-content'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Contact - Ashok Rimal',
  description: 'Reach out to Ashok Rimal for software engineering roles, technical contracting, or open-source collaborations.',
}

export default async function ContactPage() {
  const [socialLinksResult, copyResult, siteResult] = await Promise.all([
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
    getPageCopy(),
    getSiteConfig(),
  ])
  const socialLinksRaw = socialLinksResult.status === 'ok' ? socialLinksResult.data : []

  const socials = socialLinksRaw
    .map((s) => ({
      label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
      href: typeof s.payload?.href === 'string' ? s.payload.href : '',
      kind: s.slug,
    }))
    .filter((link) => link.label && link.href)

  const copy = copyResult.status === 'ok' ? copyResult.data.contact : undefined
  const site = siteResult.status === 'ok' ? siteResult.data : undefined
  const error =
    copyResult.status === 'error'
      ? copyResult.message
      : siteResult.status === 'error'
        ? siteResult.message
        : socialLinksResult.status === 'error'
          ? socialLinksResult.message
          : undefined

  return (
    <ContactContent
      copy={copy}
      contact={site?.contact ?? {}}
      socials={socials}
      error={error}
    />
  )
}
