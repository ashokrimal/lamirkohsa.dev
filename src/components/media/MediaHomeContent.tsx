import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HorizontalCollection } from '@/components/ui/HorizontalCollection'
import { MediaPoster } from '@/components/ui/MediaPoster'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { getMediaCollections, getPageCopy } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'

export const dynamic = 'force-dynamic'

const PREVIEW_COUNT = 5

/**
 * The media page: Music, Movies, Anime and Manga in that order. Each section is
 * one horizontal collection of CMS records followed by a View all card. A
 * category with no published records is hidden rather than filled with samples.
 */
export default async function MediaHomeContent() {
  const [copy, collections] = await Promise.all([getPageCopy(), getMediaCollections()])
  const pageCopy = copy.media
  const sections = (await getMediaSections(collections)).filter((section) => section.items.length > 0)

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? ''}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
      />

      {sections.length === 0 && (
        <div className="mt-12">
          <EmptyCollectionState
            eyebrow="Media / Empty"
            title="The shelves are ready."
            description="Music, movies, anime and manga appear here as soon as they are published in the CMS."
          />
        </div>
      )}

      {sections.map((section) => {
        const config = collections.find((collection) =>
          [section.kind, 'films'].includes(collection.key.toLowerCase()),
        )

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
              <HorizontalCollection
                items={section.items.map((item) => (
                  <MediaPoster key={item.id} kind={section.kind} item={item} />
                ))}
                previewCount={config?.previewCount || PREVIEW_COUNT}
                viewAllHref={section.href}
                viewAllLabel={`View all ${section.label.toLowerCase()}`}
                ariaLabel={`${section.label} collection`}
              />
            </div>
          </section>
        )
      })}

      <PageNav />
    </PageShell>
  )
}
