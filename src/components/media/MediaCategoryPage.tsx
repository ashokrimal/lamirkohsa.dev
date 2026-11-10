import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { MediaPoster, type MediaKind } from '@/components/ui/MediaPoster'
import { getMediaCollections, getPageCopy } from '@/lib/site-content'
import { getMediaSection } from '@/lib/media-content'
import EmptyCollectionState from '@/components/EmptyCollectionState'

const COPY_KEY: Record<MediaKind, string> = {
  music: 'media-music',
  movies: 'media-films',
  anime: 'media-anime',
  manga: 'media-manga',
}

/** The complete listing for one media category. All records come from the CMS. */
export default async function MediaCategoryPage({ kind }: { kind: MediaKind }) {
  const [copy, collections] = await Promise.all([getPageCopy(), getMediaCollections()])
  const section = await getMediaSection(kind, collections)
  const pageCopy = copy[COPY_KEY[kind]]

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
              {section.items.length} {section.items.length === 1 ? 'entry' : 'entries'}
            </span>
          ) : undefined
        }
      />

      {section.items.length > 0 ? (
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
          <EmptyCollectionState
            eyebrow={`${section.label} / Empty`}
            title="Nothing published yet."
            description={`New ${section.label.toLowerCase()} entries appear here as soon as they are published in the CMS.`}
          />
        </div>
      )}

      <PageNav />
    </PageShell>
  )
}
