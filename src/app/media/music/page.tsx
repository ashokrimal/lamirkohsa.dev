import type { Metadata } from 'next'
import MediaCategoryPage from '@/components/media/MediaCategoryPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'
import { PAGE_DEFAULTS } from '@/lib/page-defaults'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(
    copyResult.status === 'ok' ? copyResult.data['media-music'] : undefined,
    PAGE_DEFAULTS['/media/music'],
    '/media/music',
  )
}

export default function MusicCollectionPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Media', path: '/media' },
          { name: PAGE_DEFAULTS['/media/music'].title, path: '/media/music' },
        ])}
      />
      <MediaCategoryPage kind="music" />
    </>
  )
}
