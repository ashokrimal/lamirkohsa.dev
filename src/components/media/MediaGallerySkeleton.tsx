import { Skeleton } from '@/components/Skeleton'

export function MediaGallerySkeleton() {
  return <section className="media-section gallery-preview-section" aria-label="Loading gallery"><div className="media-section-heading"><div className="space-y-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-56" /></div><Skeleton className="h-4 w-36" /></div><div className="media-gallery-grid">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className={`media-gallery-skeleton-card ${index === 0 ? 'media-gallery-skeleton-feature' : ''}`} rounded="lg" />)}</div><Skeleton className="mt-6 h-10 w-32" rounded="full" /></section>
}
