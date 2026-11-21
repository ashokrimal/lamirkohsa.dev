import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { MediaPoster, type MediaKind } from '@/components/ui/MediaPoster'
import { getMediaCollections, getPageCopy } from '@/lib/site-content'
import { getMediaSection } from '@/lib/media-content'
import { BookOpen, Disc3, Film, Tv, type LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_MEDIA_RECORDS } from '@/lib/cms-schema'
import { getUiCopy } from '@/lib/ui-copy'


const COPY_KEY: Record<MediaKind, string> = {
  music: 'media-music',
  movies: 'media-films',
  anime: 'media-anime',
  manga: 'media-manga',
}

const MEDIA_ICONS: Record<MediaKind, LucideIcon> = {
  music: Disc3,
  movies: Film,
  anime: Tv,
  manga: BookOpen,
}

/** The complete listing for one media category. All records come from the CMS. */
export default async function MediaCategoryPage({ kind }: { kind: MediaKind }) {
  const uiStrings = await getUiCopy()
  const [copyResult, collectionsResult] = await Promise.all([
    getPageCopy(),
    getMediaCollections(),
  ])
  const collections = collectionsResult.status === 'ok' ? collectionsResult.data : []
  const section = await getMediaSection(kind, collections)
  const pageCopy = copyResult.status === 'ok' ? copyResult.data[COPY_KEY[kind]] : undefined
  const emptyState = CMS_MEDIA_RECORDS[kind].emptyState
  const EmptyIcon = MEDIA_ICONS[kind]

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? section.label}
        accent={pageCopy?.accent}
        description={pageCopy?.description ?? section.description}
        meta={
          section.items.length ? (
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
              {uiStrings.media.entries(section.items.length)}
            </span>
          ) : undefined
        }
      />

      {section.error ? (
        <div className="mt-12">
          <CmsErrorState message={section.error} />
        </div>
      ) : section.items.length > 0 ? (
        <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {section.items.map((item) => (
            <MediaPoster
              key={item.id}
              kind={kind}
              item={item}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            eyebrow={section.label}
            icon={EmptyIcon}
            message={emptyState.message}
            hint={emptyState.hint}
          />
        </div>
      )}

      <PageNav />
    </PageShell>
  )
}
