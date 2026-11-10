import Link from 'next/link'
import type { ReactNode } from 'react'
import { getMediaData } from '@/app/actions/media'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'

type Category = 'music' | 'anime' | 'manga' | 'github'

function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = key(item)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
    if (!value || seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function DetailShell({
  eyebrow,
  krEyebrow,
  title,
  accent,
  intro,
  meta,
  children,
  backHref = '/media',
  backLabel = 'Back to media',
}: {
  eyebrow: string
  krEyebrow: string
  title: string
  accent: string
  intro: string
  meta?: ReactNode
  children: ReactNode
  backHref?: string
  backLabel?: string
}) {
  return (
    <PageShell>
      <PageHero
        eyebrow={eyebrow}
        krEyebrow={krEyebrow}
        title={title}
        accent={accent}
        description={intro}
        meta={meta}
      />
      <div className="mt-10 md:mt-14">{children}</div>
      <PageNav
        backHref={backHref}
        backLabel={backLabel}
        nextHref="/contact"
        nextLabel="Start a conversation"
      />
    </PageShell>
  )
}

function MusicPage({ data }: { data: Awaited<ReturnType<typeof getMediaData>> }) {
  const lastfm = (
    data.lastfmRecent as Array<{
      name?: string
      artist?: { '#text'?: string } | string
      album?: { '#text'?: string } | string
      image?: Array<{ '#text'?: string; size?: string }>
    }>
  ).map((track) => ({
    title: track.name,
    artist: typeof track.artist === 'string' ? track.artist : track.artist?.['#text'],
    album: typeof track.album === 'string' ? track.album : track.album?.['#text'],
    cover: track.image?.find((image) => image.size === 'extralarge')?.['#text'],
  }))

  const listenbrainz = data.recent.map(
    (listen: {
      track_metadata?: {
        track_name?: string
        artist_name?: string
        release_name?: string
        additional_info?: { cover_art_url?: string }
      }
    }) => ({
      title: listen.track_metadata?.track_name,
      artist: listen.track_metadata?.artist_name,
      album: listen.track_metadata?.release_name,
      cover: listen.track_metadata?.additional_info?.cover_art_url,
    }),
  )

  const catalogTracks = data.tracks.map((track) => ({
    title: track.title,
    artist: track.artist,
    album: track.album ?? undefined,
    cover: track.coverUrl ?? undefined,
  }))

  const tracks = unique(
    [...catalogTracks, ...listenbrainz, ...lastfm],
    (track) => `${track.title}-${track.artist}`,
  ).slice(0, 30)

  return (
    <DetailShell
      eyebrow="Media / Music"
      krEyebrow="음악"
      title="Every track,"
      accent="unified."
      intro="ListenBrainz and Last.fm are merged into one deduplicated listening history."
      meta={tracks.length ? <MetaChip>{tracks.length} tracks</MetaChip> : undefined}
    >
      {tracks.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track, index) => (
            <article
              key={`${track.title}-${track.artist}-${index}`}
              className="apple-card overflow-hidden flex gap-4 p-4"
            >
              {track.cover && (
                <img
                  src={track.cover}
                  alt={`${track.title} cover`}
                  loading="lazy"
                  className="h-16 w-16 rounded-xl object-cover bg-overlay-faint shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-ink truncate">
                  {track.title || 'Unknown track'}
                </h2>
                <p className="text-xs text-muted truncate">
                  {track.artist || 'Unknown artist'}
                  {track.album ? ` · ${track.album}` : ''}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyCollectionState
          title="The listening shelf is quiet."
          description="Favorite songs and recent listening will appear here as the collection grows."
          action={{ label: 'Back to Media', href: '/media' }}
        />
      )}
    </DetailShell>
  )
}

function LibraryPage({
  data,
  kind,
}: {
  data: Awaited<ReturnType<typeof getMediaData>>
  kind: 'anime' | 'manga'
}) {
  const malItems = Object.values(
    kind === 'anime' ? (data.mal?.animeLists ?? {}) : (data.mal?.mangaLists ?? {}),
  ).flat() as Array<{
    title?: string
    synopsis?: string
    images?: { jpg?: { image_url?: string } }
  }>

  const aniItems = (
    kind === 'anime' ? (data.anilist?.anime ?? []) : (data.anilist?.manga ?? [])
  ).flatMap((group) =>
    group.entries.map(
      (entry: {
        media?: {
          title?: { userPreferred?: string }
          description?: string
          coverImage?: { large?: string }
        }
      }) => ({
        title: entry.media?.title?.userPreferred,
        synopsis: entry.media?.description?.replace(/<[^>]*>/g, ''),
        image: entry.media?.coverImage?.large,
      }),
    ),
  )

  const cards = unique(
    [
      ...malItems.map((item) => ({
        title: item.title || 'Untitled',
        description: item.synopsis,
        image: item.images?.jpg?.image_url,
      })),
      ...aniItems.map((item) => ({
        title: item.title || 'Untitled',
        description: item.synopsis,
        image: item.image,
      })),
    ],
    (item) => item.title,
  ).slice(0, 80)

  return (
    <DetailShell
      eyebrow={kind === 'anime' ? 'Media / Anime' : 'Media / Manga'}
      krEyebrow={kind === 'anime' ? '애니' : '만화'}
      title="Stories,"
      accent="without repeats."
      intro="MyAnimeList and AniList are synchronized into one clean, deduplicated shelf."
      meta={cards.length ? <MetaChip>{cards.length} titles</MetaChip> : undefined}
    >
      {cards.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <article
              key={`${card.title}-${index}`}
              className="apple-card overflow-hidden flex flex-col"
            >
              {card.image && (
                <div className="relative aspect-[3/4] bg-overlay-faint overflow-hidden">
                  <img
                    src={card.image}
                    alt={`${card.title} cover`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="text-xs font-semibold text-ink leading-snug line-clamp-2">
                  {card.title}
                </h2>
                <p className="text-[11px] text-muted leading-relaxed line-clamp-3">
                  {card.description?.slice(0, 180) || 'A title in the personal library.'}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyCollectionState
          title={`The ${kind} shelf is ready.`}
          description={`Favorite ${kind} titles will appear here as the collection grows.`}
          action={{ label: 'Back to Media', href: '/media' }}
        />
      )}
    </DetailShell>
  )
}

function GitHubPage({ data }: { data: Awaited<ReturnType<typeof getMediaData>> }) {
  const profile = data.github?.profile
  const events = data.github?.events?.slice(0, 5) ?? []
  const stars =
    data.github?.repos?.reduce(
      (total: number, repo: { stargazers_count?: number }) => total + (repo.stargazers_count ?? 0),
      0,
    ) ?? 0

  return (
    <DetailShell
      eyebrow="Media / GitHub"
      krEyebrow="깃허브"
      title="Code in"
      accent="motion."
      intro="A compact view of public momentum, repositories, stars, and recent activity."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: profile?.public_repos ?? 0, label: 'repositories' },
          { value: stars, label: 'stars received' },
          { value: events.length, label: 'recent activities' },
          { value: data.github?.activeStreak ?? 0, label: 'day streak' },
        ].map((stat) => (
          <div key={stat.label} className="apple-card p-5">
            <strong className="block text-2xl font-semibold tracking-[-0.04em] text-ink">
              {stat.value}
            </strong>
            <span className="text-[11px] text-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2.5">
        {events.map((event: { id: string; type: string }) => (
          <article key={event.id} className="apple-card p-4 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
            <div>
              <strong className="text-xs font-semibold text-ink">
                {event.type.replace('Event', '')}
              </strong>
              <p className="text-[11px] text-muted">Public GitHub activity</p>
            </div>
          </article>
        ))}
      </div>
    </DetailShell>
  )
}

export default async function MediaDetailPage({ category }: { category: Category }) {
  const data = await getMediaData()
  if (category === 'music') return <MusicPage data={data} />
  if (category === 'anime') return <LibraryPage data={data} kind="anime" />
  if (category === 'manga') return <LibraryPage data={data} kind="manga" />
  if (category === 'github') return <GitHubPage data={data} />
  return (
    <DetailShell
      eyebrow="Media / Gallery"
      krEyebrow="사진"
      title="Frames in"
      accent="between."
      intro="A visual collection of places, details, and moments collected along the way."
    >
      <Link className="apple-btn-primary" href="/gallery">
        Open all photography
      </Link>
    </DetailShell>
  )
}
