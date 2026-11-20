import type { Metadata } from 'next'
import { Suspense } from 'react'
import MediaHomeContent from '@/components/media/MediaHomeContent'
import MediaHomeSkeleton from '@/components/media/MediaHomeSkeleton'
import { getPageCopy } from '@/lib/site-content'
import { getPageMetadata } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'
import { CMS_SCHEMA } from '@/lib/cms-schema'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [copyResult, studio] = await Promise.all([getPageCopy(), getPageMetadata('/media')])
  const base = pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.media : undefined,
    { title: CMS_SCHEMA.sections.pages.media.label },
    '/media',
  )
  return studio
    ? { ...base, title: studio.title, description: studio.description || base.description }
    : base
}

export default function MediaPage() {
  return (
    <Suspense fallback={<MediaHomeSkeleton />}>
      <MediaHomeContent />
    </Suspense>
  )
}
