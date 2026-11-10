import Image from 'next/image'
import { Card3D } from '@/components/ui/Card3D'
import type { GalleryItemData } from '@/components/ui/GalleryGrid'

interface PhotoCardProps {
  item: GalleryItemData
  sizes?: string
}

/** A single photograph card. Content always comes from the CMS record. */
export function PhotoCard({ item, sizes = '(max-width: 640px) 80vw, 320px' }: PhotoCardProps) {
  return (
    <Card3D maxTilt={6}>
      <article className="apple-card overflow-hidden flex flex-col h-full group">
        <div className="relative aspect-[4/3] overflow-hidden bg-overlay-faint">
          <Image
            src={item.imageUrl}
            alt={item.title || ''}
            fill
            sizes={sizes}
            referrerPolicy="no-referrer"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          {item.category && (
            <div className="absolute top-3 left-3 bg-surface/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-tight text-ink shadow-xs">
              {item.category}
            </div>
          )}
        </div>

        {(item.title || item.description || item.location) && (
          <div className="p-4 space-y-1.5">
            {item.title && (
              <h3 className="text-sm font-semibold tracking-tight text-ink leading-snug">
                {item.title}
              </h3>
            )}
            {item.description && (
              <p className="text-xs text-muted leading-relaxed line-clamp-2">{item.description}</p>
            )}
            {item.location && <p className="text-[11px] text-muted">{item.location}</p>}
          </div>
        )}
      </article>
    </Card3D>
  )
}
