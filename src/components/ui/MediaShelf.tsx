import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { MediaPoster, type MediaKind, type MediaPosterData } from './MediaPoster'

export interface MediaShelfEntry {
  kind: MediaKind
  item: MediaPosterData
}

interface MediaShelfProps {
  items: MediaShelfEntry[]
  viewAllHref?: string
  viewAllLabel?: string
  /** How many posters the shelf shows before the View all link. */
  limit?: number
}

/**
 * The homepage media shelf: a compact grid of small posters collected from every
 * media category, closed by a single View all link. It replaces the wide
 * horizontal row so the chapter reads as one quick overview of what is on the
 * shelf rather than a second copy of the media page.
 */
export function MediaShelf({ items, viewAllHref, viewAllLabel, limit = 8 }: MediaShelfProps) {
  const visible = items.slice(0, Math.max(1, limit))
  if (visible.length === 0) return null

  return (
    <div className="media-shelf">
      <ul className="media-shelf-grid">
        {visible.map(({ kind, item }) => (
          <li key={`${kind}-${item.id}`}>
            <MediaPoster
              kind={kind}
              item={item}
              variant="compact"
              sizes="(max-width: 640px) 45vw, 180px"
            />
          </li>
        ))}
      </ul>

      {viewAllHref && (
        <Link href={viewAllHref} className="media-shelf-link">
          {viewAllLabel || 'View all media'}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
