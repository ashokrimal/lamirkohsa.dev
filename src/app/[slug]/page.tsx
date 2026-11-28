import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageMetadata, getPageWithSections } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'
import { SectionRenderer } from '@/components/studio/SectionRenderer'
import { PageHero, PageShell } from '@/components/ui/PageChrome'

export const dynamic = 'force-dynamic'

/**
 * Renders pages created in Studio → Pages that do not have a bespoke route.
 *
 * Only a published row in the `pages` table resolves; anything else is a 404, so
 * an unknown URL can never render fallback fixture content. Static routes take
 * precedence over this segment, so `/about`, `/projects` and the rest keep their
 * dedicated implementations and metadata.
 */
export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const slug = `/${params.slug}`
  const studio = await getPageMetadata(slug)
  // Resolving the 404 in metadata keeps the response status correct before any
  // HTML streams, instead of returning a 200 shell with a 404 body.
  if (!studio) notFound()
  return pageMetadata(
    { title: studio.title, seoDescription: studio.description },
    { title: studio.title },
    slug,
  )
}

export default async function StudioManagedPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = `/${params.slug}`
  const result = await getPageWithSections(slug)

  // A fixture fallback means the row does not exist; never invent a route.
  if (result.source !== 'database' || !result.page.isPublished) notFound()

  return (
    <PageShell>
      <PageHero
        backHref="/"
        backLabel="Back to home"
        eyebrow="Studio"
        title={result.page.title}
        description={result.page.metaDescription || undefined}
      />
      <SectionRenderer sections={result.sections} path={slug} />
    </PageShell>
  )
}
