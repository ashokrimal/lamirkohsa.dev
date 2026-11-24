import type { Metadata } from 'next'
import { Suspense } from 'react'
import MediaHomeContent from '@/components/media/MediaHomeContent'
import MediaHomeSkeleton from '@/components/media/MediaHomeSkeleton'
import { getPageCopy } from '@/lib/site-content'
import { getPageMetadata } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { PAGE_DEFAULTS } from '@/lib/page-defaults'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [copyResult, studio] = await Promise.all([getPageCopy(), getPageMetadata('/media')])
  return pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.media : undefined,
    {
      title: studio?.title ?? CMS_SCHEMA.sections.pages.media.label,
      description: studio?.description ?? PAGE_DEFAULTS['/media'].description,
    },
    '/media',
  )
}

export default function MediaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: PAGE_DEFAULTS['/media'].title, path: '/media' },
        ])}
      />
      <Suspense fallback={<MediaHomeSkeleton />}>
        <MediaHomeContent />
      </Suspense>
    </>
  )
}
