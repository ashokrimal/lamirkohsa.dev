import { PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { nextPageNav } from '@/lib/page-nav'
import { getPageCopy } from '@/lib/site-content'
import { getPageWithSections } from '@/lib/studio/data'
import { SectionRenderer } from '@/components/studio/SectionRenderer'

/**
 * About page. The hero copy still comes from the Page Copy record; every block
 * below it is a `page_sections` row for `/about`, rendered in the order and
 * visibility set in Studio → Pages & Sections.
 */
export default async function AboutContent() {
  const [copyResult, pageResult] = await Promise.all([
    getPageCopy(),
    getPageWithSections('/about'),
  ])
  const copy = copyResult.status === 'ok' ? copyResult.data.about : undefined

  return (
    <PageShell>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? pageResult.page.title}
        accent={copy?.accent}
        description={copy?.description ?? (pageResult.page.metaDescription || undefined)}
      />

      <SectionRenderer sections={pageResult.sections} />

      <PageNav {...nextPageNav('/about')} />
    </PageShell>
  )
}
