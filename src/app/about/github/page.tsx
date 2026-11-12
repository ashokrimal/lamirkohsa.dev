import type { Metadata } from 'next'
import MediaDetailPage from '@/components/media/MediaDetailPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

// Cached and revalidated on a 5-minute ISR window to ensure efficient production builds.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data['media-github'] : undefined)
}

export default function GitHubPage() {
  return <MediaDetailPage />
}
