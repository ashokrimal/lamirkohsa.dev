import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HorizontalCollection } from '@/components/ui/HorizontalCollection'
import { MediaPoster } from '@/components/ui/MediaPoster'
import { ImageOff } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_MEDIA_RECORDS, CMS_SCHEMA } from '@/lib/cms-schema'
import { getMediaCollections, getPageCopy } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'

export const dynamic = 'force-dynamic'

const PREVIEW_COUNT = 5

/**
 * The media page: Music, Movies, Anime and Manga in that order. Each section is
 * one horizontal collection of CMS records followed by a View all card. Every
 * category keeps its place; one with no published records shows an empty state
 * instead of samples.
 */
export default async function MediaHomeContent() {
  const [copyResult, collectionsResult] = await Promise.all([
    getPageCopy(),
    getMediaCollections(),
  ])
  const pageCopy = copyResult.status === 'ok' ? copyResult.data.media : undefined
  const collections = collectionsResult.status === 'ok' ? collectionsResult.data : []
  const sections = await getMediaSections(collections)

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? ''}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
      />

      {copyResult.status === 'error' && (
        <CmsErrorState message={copyResult.message} className="mt-10" />
      )}

      {sections.map((section) => {
        const config = collections.find(
          (collection) =>
            collection.key ===
            CMS_MEDIA_RECORDS[section.kind].key,
        )
        const emptyState = CMS_MEDIA_RECORDS[section.kind].emptyState

        return (
          <section
            key={section.kind}
            className="mt-12 md:mt-16 pt-10 md:pt-12 border-t border-line"
            aria-labelledby={`media-${section.kind}-heading`}
          >
            <SectionHeader
              eyebrow={section.label}
              title={section.label}
              description={section.description}
            />
            <div className="mt-8">
              {section.error ? (
                <CmsErrorState message={section.error} />
              ) : section.items.length === 0 ? (
                <EmptyState
                  icon={ImageOff}
                  message={emptyState.message}
                  hint={emptyState.hint}
                  actionLabel={emptyState.actionLabel}
                  actionHref={emptyState.actionHref}
                />
              ) : (
                <HorizontalCollection
                  items={section.items.map((item) => (
                    <MediaPoster key={item.id} kind={section.kind} item={item} />
                  ))}
                  previewCount={config?.previewCount || PREVIEW_COUNT}
                  viewAllHref={section.href}
                  viewAllLabel={`View all ${section.label.toLowerCase()}`}
                  ariaLabel={`${section.label} collection`}
                />
              )}
            </div>
          </section>
        )
      })}

      <PageNav />
    </PageShell>
  )
}
