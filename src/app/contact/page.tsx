import type { Metadata } from 'next'
import ContactContent from '@/components/pages/ContactContent'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { getPageCopy } from '@/lib/site-content'
import { getPageMetadata } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [copyResult, studio] = await Promise.all([getPageCopy(), getPageMetadata('/contact')])
  const base = pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.contact : undefined,
    { title: CMS_SCHEMA.sections.pages.contact.label },
    '/contact',
  )
  return studio
    ? { ...base, title: studio.title, description: studio.description || base.description }
    : base
}

export default function ContactPage() {
  return <ContactContent />
}
