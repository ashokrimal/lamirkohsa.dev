import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { getMediaData } from '@/app/actions/media'
import { getMediaPreviews } from '@/app/actions/content-cms'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { ArrowUpRight, BookOpen, Disc3, Film, Sparkles } from 'lucide-react'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'

type Track = {
  track_metadata?: {
    track_name?: string
    artist_name?: string
    additional_info?: { cover_art_url?: string }
  }
}

type Item = {
  title?: string
  images?: { jpg?: { image_url?: string } }
  entry?: { title?: string }
}

type CollectionProps = {
  number: string
  title: string
  description: string
  href: string
  items: Item[]
  icon: React.ComponentType<{ className?: string }>
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function uniqueItems(items: Item[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = item.title || item.entry?.title || ''
    const normalized = normalize(value)
    if (!normalized || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

function CollectionPreview({
  number,
  title,
  description,
  href,
  items,
  icon: Icon,
}: CollectionProps) {
  return (
    <section className="mt-8 md:mt-10 pt-10 md:pt-12 border-t border-line">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-full bg-overlay text-accent border border-line-subtle">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
              {number} / {title}
            </p>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-0.04em] leading-[1.05]">
            {title} <span className="text-accent">collection.</span>
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted max-w-xl leading-relaxed">
            {description}
          </p>
        </div>

        {items.length > 0 && (
          <Link className="apple-btn-secondary group shrink-0" href={href}>
            <span>View collection ({items.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>

      {items.length ? (
        <div
          className={`grid grid-cols-2 gap-4 mt-6 ${
            items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
          }`}
        >
          {items.slice(0, 4).map((item, index) => {
            const imageUrl = item.images?.jpg?.image_url
            return (
              <article
                className="apple-card overflow-hidden flex flex-col justify-between group"
                key={`${item.title}-${index}`}
              >
                <div className="relative aspect-[4/3] bg-overlay-faint overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title || 'Media artwork'}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                  ) : (
                    /* Records without artwork still deserve a deliberate tile,
                       not an empty frame with a pin-sized icon. */
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-accent-soft text-accent">
                      <Icon className="w-7 h-7" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em]">
                        No artwork
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 rounded-full bg-surface/85 backdrop-blur-xl border border-line-subtle px-2 py-0.5 text-[9px] font-mono text-ink">
                    0{index + 1}
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-xs font-semibold text-ink truncate group-hover:text-accent transition-colors">
                    {item.title || 'Untitled'}
                  </h3>
                  <p className="text-[11px] text-muted truncate font-mono">
                    {item.entry?.title || 'Catalog record'}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyCollectionState
          title={`${title} is taking shape.`}
          description={`The ${title.toLowerCase()} collection will appear here as records are added in the CMS.`}
        />
      )}
    </section>
  )
}

export default async function MediaHomeContent() {
  const [mediaApiData, cmsPreviews] = await Promise.all([getMediaData(), getMediaPreviews()])

  const {
    recent,
    lastfmRecent,
    mal,
    anilist,
    movies,
    imdbMovies,
    tracks: catalogTracks,
  } = mediaApiData

  // Merge CMS music with API music
  const cmsMusicItems: Item[] = cmsPreviews.music.map((m) => ({
    title: m.title,
    images: {
      jpg: { image_url: typeof m.payload.coverUrl === 'string' ? m.payload.coverUrl : undefined },
    },
    entry: { title: typeof m.payload.artist === 'string' ? m.payload.artist : 'CMS Track' },
  }))

  const lastfmTracks = (
    lastfmRecent as Array<{
      name?: string
      artist?: { '#text'?: string } | string
      image?: Array<{ '#text'?: string; size?: string }>
    }>
  ).map((track) => ({
    track_metadata: {
      track_name: track.name,
      artist_name: typeof track.artist === 'string' ? track.artist : track.artist?.['#text'],
      additional_info: {
        cover_art_url: track.image?.find((image) => image.size === 'extralarge')?.['#text'],
      },
    },
  }))

  const tracks = [...recent, ...lastfmTracks].filter((track, index, all) => {
    const current = `${track.track_metadata?.track_name}-${track.track_metadata?.artist_name}`
    return (
      all.findIndex(
        (item) =>
          `${item.track_metadata?.track_name}-${item.track_metadata?.artist_name}` === current,
      ) === index
    )
  }) as Track[]

  const musicItems: Item[] = uniqueItems([
    ...cmsMusicItems,
    ...catalogTracks.map((track) => ({
      title: track.title,
      images: { jpg: { image_url: track.coverUrl ?? undefined } },
      entry: { title: track.artist },
    })),
    ...tracks.map((track) => ({
      title: track.track_metadata?.track_name,
      images: { jpg: { image_url: track.track_metadata?.additional_info?.cover_art_url } },
      entry: { title: track.track_metadata?.artist_name },
    })),
  ])

  // Merge CMS Anime & Manga
  const cmsAnimeItems: Item[] = cmsPreviews.anime.map((a) => ({
    title: a.title,
    images: {
      jpg: { image_url: typeof a.payload.imageUrl === 'string' ? a.payload.imageUrl : undefined },
    },
    entry: { title: `${a.payload.score || ''} · ${a.payload.status || 'Anime'}` },
  }))

  const cmsMangaItems: Item[] = cmsPreviews.manga.map((m) => ({
    title: m.title,
    images: {
      jpg: { image_url: typeof m.payload.imageUrl === 'string' ? m.payload.imageUrl : undefined },
    },
    entry: { title: `${m.payload.score || ''} · ${m.payload.status || 'Manga'}` },
  }))

  const fromGroups = (
    groups: Array<{
      entries: Array<{
        media?: { title?: { userPreferred?: string }; coverImage?: { large?: string } }
      }>
    }> = [],
  ) =>
    groups.flatMap((group) =>
      group.entries.map((entry) => ({
        title: entry.media?.title?.userPreferred,
        images: { jpg: { image_url: entry.media?.coverImage?.large } },
      })),
    )

  const anime: Item[] = uniqueItems([
    ...cmsAnimeItems,
    ...(Object.values(mal?.animeLists ?? {}).flat() as Item[]),
    ...fromGroups(anilist?.anime),
  ])

  const manga: Item[] = uniqueItems([
    ...cmsMangaItems,
    ...(Object.values(mal?.mangaLists ?? {}).flat() as Item[]),
    ...fromGroups(anilist?.manga),
  ])

  const movieItems: Item[] = Array.from(
    new Map(
      [
        ...movies.map((movie) => ({
          title: movie.title,
          entry: {
            title:
              typeof movie.payload?.description === 'string'
                ? movie.payload.description
                : 'Watched movie',
          },
        })),
        ...imdbMovies.map((movie) => ({
          title: movie.title,
          entry: { title: 'IMDb watchlist' },
        })),
      ].map((movie) => [movie.title.toLowerCase().replace(/[^a-z0-9]+/g, ''), movie]),
    ).values(),
  )

  return (
    <PageShell>
      <PageHero
        eyebrow="Media & Cultural Library"
        krEyebrow="미디어 기록"
        title="What I'm"
        accent="into."
        description="Curated listening rotation, anime, manga, and films that inspire focus and visual storytelling. Every record is managed dynamically through the CMS."
        meta={
          <>
            <MetaChip icon={Disc3}>{musicItems.length} tracks</MetaChip>
            <MetaChip icon={Film}>{anime.length} series</MetaChip>
            <MetaChip icon={BookOpen}>{manga.length} titles</MetaChip>
            <MetaChip icon={Sparkles}>{movieItems.length} films</MetaChip>
          </>
        }
      />

      <CollectionPreview
        number="01"
        title="Music"
        description="Favorite listening, recent rotation, and personal soundscapes."
        href="/media/music"
        items={musicItems}
        icon={Disc3}
      />

      <CollectionPreview
        number="02"
        title="Anime"
        description="Favorite, currently watching, completed, and plan-to-watch series."
        href="/media/anime"
        items={anime}
        icon={Film}
      />

      <CollectionPreview
        number="03"
        title="Manga &amp; Manhwa"
        description="Favorite graphic novels, currently reading series, and masterworks."
        href="/media/manga"
        items={manga}
        icon={BookOpen}
      />

      <CollectionPreview
        number="04"
        title="Films"
        description="Cinematic films watched, remembered, and worth revisiting."
        href="/movies"
        items={movieItems}
        icon={Sparkles}
      />

      <PageNav backLabel="Return home" nextHref="/contact" nextLabel="Start a conversation" />
    </PageShell>
  )
}
