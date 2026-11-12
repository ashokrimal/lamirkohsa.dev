import type { Metadata } from 'next'
import MediaDetailPage from '@/components/media/MediaDetailPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

// This archive pulls live library data on each request, so it is not cached.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data['media-github'] : undefined)
}

export default function GitHubPage() {
  return <MediaDetailPage category="github" />
}
