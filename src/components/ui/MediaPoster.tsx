import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Disc3, Film, Star, Tv } from 'lucide-react'

export type MediaKind = 'music' | 'movies' | 'anime' | 'manga'

export interface MediaPosterData {
  id: number | string
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  /** Rating or score, shown as a small pill when present. */
  rating?: string
  status?: string
  href?: string
}

const icons = {
  music: Disc3,
  movies: Film,
  anime: Tv,
  manga: BookOpen,
} as const

interface MediaPosterProps {
  kind: MediaKind
  item: MediaPosterData
  sizes?: string
}

/** One media card. Everything shown here is taken from the CMS record. */
export function MediaPoster({ kind, item, sizes = '(max-width: 640px) 78vw, 260px' }: MediaPosterProps) {
  const Icon = icons[kind]

  const body = (
    <article className="apple-card overflow-hidden flex flex-col h-full group">
      <div className="relative aspect-[2/3] overflow-hidden bg-overlay-faint">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes={sizes}
            referrerPolicy="no-referrer"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Icon className="w-8 h-8 text-accent" />
          </div>
        )}

        {item.rating && (
          <div className="absolute top-2.5 right-2.5 bg-surface/90 backdrop-blur-md text-ink px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border border-line-subtle shadow-xs">
            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            {item.rating}
          </div>
        )}
      </div>

      <div className="p-4 space-y-1.5 flex-1">
        <h3 className="text-sm font-semibold tracking-tight text-ink leading-snug line-clamp-2">
          {item.title}
        </h3>
        {item.subtitle && <p className="text-xs text-muted leading-relaxed">{item.subtitle}</p>}
        {item.description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-3">{item.description}</p>
        )}
        {item.status && (
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{item.status}</p>
        )}
      </div>
    </article>
  )

  if (!item.href) return body

  return (
    <Link href={item.href} className="block h-full" aria-label={item.title}>
      {body}
    </Link>
  )
}
