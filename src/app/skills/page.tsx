import type { Metadata } from 'next'
import CollectionPage from '@/components/pages/CollectionPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.skills : undefined)
}

export default function SkillsPage() {
  return <CollectionPage kind="skills" />
}
