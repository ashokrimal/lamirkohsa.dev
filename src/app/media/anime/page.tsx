import type { Metadata } from 'next'
import MediaCategoryPage from '@/components/media/MediaCategoryPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data['media-anime'] : undefined)
}

export default function AnimeCollectionPage() {
  return <MediaCategoryPage kind="anime" />
}
