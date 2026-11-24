import type { Metadata } from 'next'
import MediaDetailPage from '@/components/media/MediaDetailPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'
import { PAGE_DEFAULTS } from '@/lib/page-defaults'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'

// Cached and revalidated on a 5-minute ISR window to ensure efficient production builds.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(
    copyResult.status === 'ok' ? copyResult.data['media-github'] : undefined,
    PAGE_DEFAULTS['/about/github'],
    '/about/github',
  )
}

export default function GitHubPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: PAGE_DEFAULTS['/about/github'].title, path: '/about/github' },
        ])}
      />
      <MediaDetailPage />
    </>
  )
}
