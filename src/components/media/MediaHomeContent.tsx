import { PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HorizontalCollection } from '@/components/ui/HorizontalCollection'
import { MediaPoster, type MediaKind } from '@/components/ui/MediaPoster'
import { BookOpen, Disc3, Film, Tv, type LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_MEDIA_RECORDS, CMS_SCHEMA } from '@/lib/cms-schema'
import { getMediaCollections, getPageCopy } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'
import { getPageWithSections } from '@/lib/studio/data'
import { SectionRenderer } from '@/components/studio/SectionRenderer'
import { getUiCopy } from '@/lib/ui-copy'

const PREVIEW_COUNT = 5

const MEDIA_ICONS: Record<MediaKind, LucideIcon> = {
  music: Disc3,
  movies: Film,
  anime: Tv,
  manga: BookOpen,
}

/**
 * The media page's section-driven body also exposes a collections variant: one
 * numbered block per collection with its own heading, used when a `media`
 * section is configured with `layout: index`.
 */
export async function MediaCollectionsBody() {
  const uiStrings = await getUiCopy()
  const [copyResult, collectionsResult] = await Promise.all([
    getPageCopy(),
    getMediaCollections(),
  ])
  const collections = collectionsResult.status === 'ok' ? collectionsResult.data : []
  const sections = await getMediaSections(collections)

  return (
    <>
      {copyResult.status === 'error' && (
        <CmsErrorState message={copyResult.message} className="mt-10" />
      )}

      {sections.map((section, index) => {
        const config = collections.find(
          (collection) => collection.key === CMS_MEDIA_RECORDS[section.kind].key,
        )
        const emptyState = CMS_MEDIA_RECORDS[section.kind].emptyState
        const EmptyIcon = MEDIA_ICONS[section.kind]

        return (
          <section
            key={section.kind}
            className="mt-12 border-t border-line pt-10 md:mt-16 md:pt-12"
            aria-labelledby={`media-${section.kind}-heading`}
          >
            <SectionHeader
              number={index}
              eyebrow={section.label}
              title={section.label}
              description={section.description}
              linkHref={section.href}
              linkLabel={`Open ${section.label.toLowerCase()}`}
            />
            <div className="mt-8">
              {section.error ? (
                <CmsErrorState message={section.error} />
              ) : section.items.length === 0 ? (
                <EmptyState
                  eyebrow={section.label}
                  icon={EmptyIcon}
                  message={emptyState.message}
                  hint={emptyState.hint}
                />
              ) : (
                <HorizontalCollection
                  items={section.items.map((item) => (
                    <MediaPoster key={item.id} kind={section.kind} item={item} />
                  ))}
                  previewCount={config?.previewCount || PREVIEW_COUNT}
                  viewAllHref={section.href}
                  viewAllLabel={uiStrings.media.viewAllCategory(section.label)}
                  ariaLabel={uiStrings.media.collectionAria(section.label)}
                />
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}

/**
 * The media page: its hero copy comes from Page Copy, and the collections below
 * it are the studio's `page_sections` rows for `/media`, so the page can be
 * reordered, hidden or emptied from Pages & Sections.
 */
export default async function MediaHomeContent() {
  const [copyResult, pageResult] = await Promise.all([
    getPageCopy(),
    getPageWithSections('/media'),
  ])
  const pageCopy = copyResult.status === 'ok' ? copyResult.data.media : undefined

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? CMS_SCHEMA.sections.pages.media.label}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
      />

      {copyResult.status === 'error' && (
        <CmsErrorState message={copyResult.message} className="mt-10" />
      )}

      <SectionRenderer sections={pageResult.sections} />

      <PageNav />
    </PageShell>
  )
}
