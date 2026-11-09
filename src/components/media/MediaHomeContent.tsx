import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { getMediaData } from '@/app/actions/media'
import { getMediaPreviews } from '@/app/actions/content-cms'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { ArrowUpRight, BookOpen, Disc3, Film, Sparkles } from 'lucide-react'

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
    <section className="media-collection-preview py-8 border-b border-[var(--line)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-xs bg-[var(--paper)] text-[var(--accent)] border border-[var(--line)]">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
              {number} / {title}
            </p>
          </div>
          <h2 className="text-2xl md:text-3xl font-normal text-[var(--ink)] tracking-[-0.04em]">
            {title} <span className="font-serif italic text-[var(--accent)]">collection.</span>
          </h2>
          <p className="mt-1 text-xs md:text-sm text-[var(--muted)] max-w-xl">
            {description}
          </p>
        </div>

        {items.length > 0 && (
          <Link
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline shrink-0"
            href={href}
          >
            <span>View collection ({items.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {items.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {items.slice(0, 4).map((item, index) => {
            const imageUrl = item.images?.jpg?.image_url
            return (
              <article
                className="rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden flex flex-col justify-between hover:border-[var(--accent)] transition-all group"
                key={`${item.title}-${index}`}
              >
                <div className="relative aspect-[4/3] bg-[var(--paper)] overflow-hidden">
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
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                      <Icon className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-[var(--ink)]/80 text-[var(--paper)] px-1.5 py-0.5 rounded-xs text-[9px] font-mono">
                    0{index + 1}
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-semibold text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors">
                    {item.title || 'Untitled'}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)] truncate font-mono">
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
  const [mediaApiData, cmsPreviews] = await Promise.all([
    getMediaData(),
    getMediaPreviews(),
  ])

  const { recent, lastfmRecent, mal, anilist, movies, imdbMovies, tracks: catalogTracks } = mediaApiData

  // Merge CMS music with API music
  const cmsMusicItems: Item[] = cmsPreviews.music.map((m) => ({
    title: m.title,
    images: { jpg: { image_url: typeof m.payload.coverUrl === 'string' ? m.payload.coverUrl : undefined } },
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
        (item) => `${item.track_metadata?.track_name}-${item.track_metadata?.artist_name}` === current
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
    images: { jpg: { image_url: typeof a.payload.imageUrl === 'string' ? a.payload.imageUrl : undefined } },
    entry: { title: `${a.payload.score || ''} · ${a.payload.status || 'Anime'}` },
  }))

  const cmsMangaItems: Item[] = cmsPreviews.manga.map((m) => ({
    title: m.title,
    images: { jpg: { image_url: typeof m.payload.imageUrl === 'string' ? m.payload.imageUrl : undefined } },
    entry: { title: `${m.payload.score || ''} · ${m.payload.status || 'Manga'}` },
  }))

  const fromGroups = (
    groups: Array<{
      entries: Array<{
        media?: { title?: { userPreferred?: string }; coverImage?: { large?: string } }
      }>
    }> = []
  ) =>
    groups.flatMap((group) =>
      group.entries.map((entry) => ({
        title: entry.media?.title?.userPreferred,
        images: { jpg: { image_url: entry.media?.coverImage?.large } },
      }))
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
            title: typeof movie.payload?.description === 'string' ? movie.payload.description : 'Watched movie',
          },
        })),
        ...imdbMovies.map((movie) => ({
          title: movie.title,
          entry: { title: 'IMDb watchlist' },
        })),
      ].map((movie) => [movie.title.toLowerCase().replace(/[^a-z0-9]+/g, ''), movie])
    ).values()
  )

  return (
    <main className="media-page shell-width py-12 md:py-20 space-y-12">
      <header className="media-header pb-8 border-b border-[var(--line)]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
            Media &amp; Cultural Library
          </p>
          <h1 className="text-4xl md:text-7xl font-normal text-[var(--ink)] tracking-[-0.06em] leading-[0.95]">
            What I&apos;m <span className="font-serif italic text-[var(--accent)]">into.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
            Curated listening rotation, anime, manga, and films that inspire focus and visual storytelling. All records dynamically managed via CMS.
          </p>
        </div>
      </header>

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
    </main>
  )
}
