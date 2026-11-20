import type { Metadata } from 'next'
import AboutContent from '@/components/pages/AboutContent'
import { getPageCopy } from '@/lib/site-content'
import { getPageMetadata } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [copyResult, studio] = await Promise.all([getPageCopy(), getPageMetadata('/about')])
  const base = pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.about : undefined,
    undefined,
    '/about',
  )
  return studio
    ? { ...base, title: studio.title, description: studio.description || base.description }
    : base
}

export default function AboutPage() {
  return <AboutContent />
}
