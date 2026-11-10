import type { Metadata } from 'next'
import ContactContent from '@/components/pages/ContactContent'
import { getSocialLinks } from '@/app/actions/content-cms'
import { getPageCopy, getSiteConfig } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact - Ashok Rimal',
  description: 'Reach out to Ashok Rimal for software engineering roles, technical contracting, or open-source collaborations.',
}

export default async function ContactPage() {
  const [socialLinksRaw, copy, site] = await Promise.all([
    getSocialLinks(),
    getPageCopy(),
    getSiteConfig(),
  ])

  const socials = socialLinksRaw
    .map((s) => ({
      label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
      href: typeof s.payload?.href === 'string' ? s.payload.href : '',
      kind: s.slug,
    }))
    .filter((link) => link.label && link.href)

  return <ContactContent copy={copy.contact} contact={site.contact} socials={socials} />
}
