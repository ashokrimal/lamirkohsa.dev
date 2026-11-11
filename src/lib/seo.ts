import type { Metadata } from 'next'
import type { PageCopy } from '@/lib/site-content'

/**
 * The SEO title pattern is part of the site structure, not CMS content.
 * Next.js applies it through `title.template` in the root layout.
 */
export const SEO_TITLE_TEMPLATE = '%s · Ashok Rimal'

export const SITE_URL = 'https://ashokrimal.com.np'

/**
 * Builds page metadata from the CMS Page Copy record. Per-page `seoTitle`,
 * `seoDescription` and `ogImage` win; otherwise the record's page title and
 * description are used. Missing values are omitted so the layout default shows.
 */
export function pageMetadata(
  copy: PageCopy | undefined,
  fallback?: { title?: string; description?: string },
): Metadata {
  const title = copy?.seoTitle ?? copy?.title ?? fallback?.title
  const description = copy?.seoDescription ?? copy?.description ?? fallback?.description
  const image = copy?.ogImage

  const openGraph: NonNullable<Metadata['openGraph']> = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image ? { images: [{ url: image }] } : {}),
  }

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(Object.keys(openGraph).length > 0 ? { openGraph } : {}),
    ...(image ? { twitter: { card: 'summary_large_image' as const, images: [image] } } : {}),
  }
}
