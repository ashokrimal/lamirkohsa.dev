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
    copyResult.status === 'ok' ? copyResult.data['media-manga'] : undefined,
    PAGE_DEFAULTS['/media/manga'],
    '/media/manga',
  )
}

export default function MangaCollectionPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Media', path: '/media' },
          { name: PAGE_DEFAULTS['/media/manga'].title, path: '/media/manga' },
        ])}
      />
      <MediaCategoryPage kind="manga" />
    </>
  )
}
