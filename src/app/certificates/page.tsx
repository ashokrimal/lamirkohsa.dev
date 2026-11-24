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
    copyResult.status === 'ok' ? copyResult.data.certificates : undefined,
    PAGE_DEFAULTS['/certificates'],
    '/certificates',
  )
}

export default function CertificatesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: PAGE_DEFAULTS['/certificates'].title, path: '/certificates' },
        ])}
      />
      <CollectionPage kind="certificates" />
    </>
  )
}
