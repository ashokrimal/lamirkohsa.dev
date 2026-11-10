import Link from 'next/link'
import { ArrowUpRight, BookOpen, Disc3, Film } from 'lucide-react'
import {
  MediaCard,
  type MusicItemData,
  type AnimeItemData,
  type MangaItemData,
} from '@/components/ui/MediaCard'
import { SpotifyWidget } from '@/components/ui/SpotifyWidget'

interface FilterableMediaShelfProps {
  music: MusicItemData[]
  anime: AnimeItemData[]
  manga: MangaItemData[]
}

/**
 * The home media preview. It deliberately has no category selector: the shelf
 * shows a little of everything and each column links to its own collection.
 */
export function FilterableMediaShelf({ music, anime, manga }: FilterableMediaShelfProps) {
  const columns: Array<{
    key: string
    label: string
    kr: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    count: number
    children: React.ReactNode
  }> = [
    {
      key: 'music',
      label: 'Spotify Rotation',
      kr: '음악',
      href: '/media/music',
      icon: Disc3,
      count: music.length,
      children: (
        <>
          <SpotifyWidget />
          {music.slice(0, 1).map((item) => (
            <MediaCard key={item.id || item.title} type="music" item={item} />
          ))}
        </>
      ),
    },
    {
      key: 'anime',
      label: 'Anime Watchlist',
      kr: '애니',
      href: '/media/anime',
      icon: Film,
      count: anime.length,
      children: (
        <div className="grid grid-cols-2 gap-3.5">
          {anime.slice(0, 2).map((item) => (
            <MediaCard key={item.id || item.title} type="anime" item={item} />
          ))}
        </div>
      ),
    },
    {
      key: 'manga',
      label: 'Manga & Manhwa',
      kr: '만화',
      href: '/media/manga',
      icon: BookOpen,
      count: manga.length,
      children: (
        <div className="grid grid-cols-2 gap-3.5">
          {manga.slice(0, 2).map((item) => (
            <MediaCard key={item.id || item.title} type="manga" item={item} />
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map(({ key, label, kr, href, icon: Icon, count, children }) => (
        <div key={key} className="space-y-4">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-line-subtle">
            <span className="font-semibold text-ink flex items-center gap-1.5 text-xs">
              <Icon className="w-3.5 h-3.5 text-accent" />
              <span>{label}</span>
              <span lang="ko" className="font-korean text-[10px] text-muted font-normal">
                {kr}
              </span>
            </span>
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
            >
              <span>View all ({count})</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">{children}</div>
        </div>
      ))}
    </div>
  )
}
