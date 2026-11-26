import type { Metadata } from 'next'
import ContactContent from '@/components/pages/ContactContent'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { getPageCopy, getSiteConfig } from '@/lib/site-content'
import { getPageMetadata } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd, contactPageJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [copyResult, studio] = await Promise.all([getPageCopy(), getPageMetadata('/contact')])
  return pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.contact : undefined,
    {
      title: studio?.title ?? CMS_SCHEMA.sections.pages.contact.label,
      description: studio?.description,
    },
    '/contact',
  )
}

export default async function ContactPage() {
  const site = await getSiteConfig()
  const email = site.status === 'ok' ? site.data.contact.email : undefined
  const contact = contactPageJsonLd({ path: '/contact', email })

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: CMS_SCHEMA.sections.pages.contact.label, path: '/contact' },
        ])}
      />
      {contact ? <JsonLd data={contact} /> : null}
      <ContactContent />
    </>
  )
}
