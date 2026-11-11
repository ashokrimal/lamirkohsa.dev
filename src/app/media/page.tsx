import type { Metadata } from 'next'
import { Suspense } from 'react'
import MediaHomeContent from '@/components/media/MediaHomeContent'
import MediaHomeSkeleton from '@/components/media/MediaHomeSkeleton'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.media : undefined)
}

export default function MediaPage() {
  return (
    <Suspense fallback={<MediaHomeSkeleton />}>
      <MediaHomeContent />
    </Suspense>
  )
}
