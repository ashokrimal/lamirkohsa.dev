import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Camera, MapPin } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'

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
      <div className="p-8 rounded-[24px] border border-line-subtle bg-surface/70 backdrop-blur-md text-center text-sm text-muted">
        <Camera className="w-6 h-6 mx-auto mb-2 text-muted" />
        <p>No photographs currently published in this collection.</p>
      </div>
    )
  }

  const gridColsClass =
    columns === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
      : columns === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-5'

  return (
    <div className="space-y-6">
      <div className={gridColsClass}>
        {items.map((item, index) => (
          <Card3D key={item.id || index} maxTilt={6}>
            <article className="apple-card overflow-hidden flex flex-col justify-between h-full group">
              {/* Image frame */}
              <div className="relative aspect-[4/3] overflow-hidden bg-overlay-faint">
                <Image
                  src={item.imageUrl}
                  alt={item.title || 'Photograph by Ashok Rimal'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {item.category && (
                  <div className="absolute top-3 left-3 bg-surface/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-tight text-ink shadow-xs">
                    {item.category}
                  </div>
                )}
              </div>

              {/* Caption & Location metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-ink tracking-tight leading-snug group-hover:text-accent transition-colors">
                    {item.title || 'Untitled Photograph'}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {item.location && (
                  <div className="pt-2.5 border-t border-line-faint flex items-center gap-1.5 text-[11px] text-muted">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </article>
          </Card3D>
        ))}
      </div>

      {showViewAll && (
        <div className="flex justify-end pt-2">
          <Link
            href={viewAllHref}
            className="apple-btn-secondary"
          >
            <span>View all photographs in Media library</span>
            <span lang="ko" className="font-korean text-[10px] text-muted">미디어 기록</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
          </Link>
        </div>
      )}
    </div>
  )
}
