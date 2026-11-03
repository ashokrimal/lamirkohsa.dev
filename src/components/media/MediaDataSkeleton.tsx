import { Skeleton, SkeletonCard } from '@/components/Skeleton'

export function MediaDataSkeleton() {
  return <div className="media-data-skeleton"><section className="media-section"><div className="media-section-heading"><div className="space-y-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-48" /></div><Skeleton className="h-4 w-52" /></div><div className="media-feature-grid"><SkeletonCard /><SkeletonCard /></div></section><section className="media-section"><div className="media-section-heading"><div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-9 w-56" /></div><Skeleton className="h-4 w-64" /></div><div className="media-feature-grid"><SkeletonCard /><SkeletonCard /></div></section></div>
}
