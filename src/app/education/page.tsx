import type { Metadata } from 'next'
import CollectionPage from '@/components/pages/CollectionPage'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'
import { PAGE_DEFAULTS } from '@/lib/page-defaults'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.education : undefined,
    PAGE_DEFAULTS['/education'],
    '/education',
  )
}

export default function EducationPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: PAGE_DEFAULTS['/education'].title, path: '/education' },
        ])}
      />
      <CollectionPage kind="education" />
    </>
  )
}
