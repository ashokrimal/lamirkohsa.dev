import type { Metadata } from 'next'
import AboutContent from '@/components/pages/AboutContent'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.about : undefined)
}

export default function AboutPage() {
  return <AboutContent />
}
