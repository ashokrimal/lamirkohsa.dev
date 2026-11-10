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
      <div className="p-8 rounded-[24px] border border-black/[0.06] bg-white/70 backdrop-blur-md text-center text-sm text-[#86868b]">
        <Camera className="w-6 h-6 mx-auto mb-2 text-[#86868b]" />
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
              <div className="relative aspect-[4/3] overflow-hidden bg-black/[0.02]">
                <Image
                  src={item.imageUrl}
                  alt={item.title || 'Photograph by Ashok Rimal'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {item.category && (
                  <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-tight text-[#1d1d1f] shadow-xs">
                    {item.category}
                  </div>
                )}
              </div>

              {/* Caption & Location metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] tracking-tight leading-snug group-hover:text-[#0071e3] transition-colors">
                    {item.title || 'Untitled Photograph'}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-xs text-[#86868b] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {item.location && (
                  <div className="pt-2.5 border-t border-black/[0.04] flex items-center gap-1.5 text-[11px] text-[#86868b]">
                    <MapPin className="w-3.5 h-3.5 text-[#0071e3]" />
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
            <span className="font-korean text-[10px] text-[#86868b]">미디어 기록</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#86868b]" />
          </Link>
        </div>
      )}
    </div>
  )
}
