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
  altText?: string
}

const icons = {
  music: Disc3,
  movies: Film,
  anime: Tv,
  manga: BookOpen,
} as const

const kindLabels: Record<MediaKind, string> = {
  music: 'Music',
  movies: 'Films',
  anime: 'Anime',
  manga: 'Manga',
}

interface MediaPosterProps {
  kind: MediaKind
  item: MediaPosterData
  sizes?: string
  /** `compact` is the smaller homepage shelf card, tagged with its category. */
  variant?: 'poster' | 'compact'
}

/** One media card. Everything shown here is taken from the CMS record. */
export function MediaPoster({
  kind,
  item,
  sizes = '(max-width: 640px) 78vw, 260px',
  variant = 'poster',
}: MediaPosterProps) {
  const Icon = icons[kind]
  const compact = variant === 'compact'

  const body = (
    <article
      className={`apple-card overflow-hidden flex flex-col h-full group ${
        compact ? 'media-poster--compact' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden bg-overlay-faint ${
          compact ? 'aspect-[3/4]' : 'aspect-[4/5] sm:aspect-[2/3]'
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.altText || item.title}
            fill
            sizes={sizes}
            referrerPolicy="no-referrer"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Icon className={compact ? 'w-6 h-6 text-accent' : 'w-8 h-8 text-accent'} />
          </div>
        )}

        {compact && <span className="media-poster-kind">{kindLabels[kind]}</span>}

        {item.rating && (
          <div
            className={`absolute bg-surface/90 backdrop-blur-md text-ink rounded-full font-medium flex items-center gap-1 border border-line-subtle shadow-xs ${
              compact
                ? 'top-1.5 right-1.5 px-1.5 py-0.5 text-[9px]'
                : 'top-2.5 right-2.5 px-2 py-0.5 text-[10px]'
            }`}
          >
            <Star
              className={
                compact
                  ? 'w-2 h-2 text-amber-500 fill-amber-500'
                  : 'w-2.5 h-2.5 text-amber-500 fill-amber-500'
              }
            />
            {item.rating}
          </div>
        )}
      </div>

      {compact ? (
        <div className="px-2.5 py-2 space-y-0.5 flex-1">
          <h3 className="text-[12px] font-semibold tracking-tight text-ink leading-snug line-clamp-2">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-[10.5px] text-muted leading-snug line-clamp-1">{item.subtitle}</p>
          )}
        </div>
      ) : (
        <div className="p-3 sm:p-4 space-y-1.5 flex-1">
          <h3 className="text-[13px] sm:text-sm font-semibold tracking-tight text-ink leading-snug line-clamp-2">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-xs text-muted leading-relaxed line-clamp-2">{item.subtitle}</p>
          )}
          {item.description && (
            <p className="text-xs text-muted leading-relaxed line-clamp-2 sm:line-clamp-3">
              {item.description}
            </p>
          )}
          {item.status && (
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{item.status}</p>
          )}
        </div>
      )}
    </article>
  )

  if (!item.href) return body

  return (
    <Link href={item.href} className="block h-full" aria-label={item.title}>
      {body}
    </Link>
  )
}
