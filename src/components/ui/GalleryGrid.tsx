import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Camera, MapPin } from 'lucide-react'

export interface GalleryItemData {
  id: number | string
  title?: string
  imageUrl: string
  category?: string
  description?: string
  location?: string
  featured?: boolean
}

interface GalleryGridProps {
  items: GalleryItemData[]
  showViewAll?: boolean
  viewAllHref?: string
  columns?: 2 | 3 | 4
}

export function GalleryGrid({
  items,
  showViewAll = true,
  viewAllHref = '/media',
  columns = 4,
}: GalleryGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 rounded-sm border border-[var(--line)] bg-[var(--surface)] text-center text-xs text-[var(--muted)]">
        <Camera className="w-5 h-5 mx-auto mb-2 text-[var(--muted)]" />
        <p>No photographs currently published in this collection.</p>
      </div>
    )
  }

  const gridColsClass =
    columns === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
      : columns === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-4'

  return (
    <div className="space-y-6">
      <div className={gridColsClass}>
        {items.map((item, index) => (
          <article
            key={item.id || index}
            className="group rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xs flex flex-col justify-between"
          >
            {/* Image frame */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper)]">
              <Image
                src={item.imageUrl}
                alt={item.title || 'Photograph by Ashok Rimal'}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                referrerPolicy="no-referrer"
                className="object-cover transition-transform duration-500 group-hover:scale-104"
              />
              {item.category && (
                <div className="absolute top-2.5 left-2.5 bg-[var(--surface)]/90 backdrop-blur-xs border border-[var(--line)] px-2 py-0.5 rounded-xs text-[9px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                  {item.category}
                </div>
              )}
            </div>

            {/* Caption & Location metadata */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-[var(--ink)] tracking-[-0.02em] leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {item.title || 'Untitled Photograph'}
                </h4>
                {item.description && (
                  <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {item.location && (
                <div className="pt-2 border-t border-[var(--line)]/50 flex items-center gap-1.5 text-[10px] font-mono text-[var(--muted)]">
                  <MapPin className="w-3 h-3 text-[var(--accent)]" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {showViewAll && (
        <div className="flex justify-end pt-2">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <span>View all photographs in Media library</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
