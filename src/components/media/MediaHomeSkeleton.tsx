import { Skeleton } from '@/components/Skeleton'

function CollectionSkeleton({ index }: { index: number }) {
  return <section className="media-collection-preview media-collection-skeleton" aria-label={`Loading collection ${index}`}><div className="section-heading"><div><Skeleton className="h-3 w-24" /><Skeleton className="mt-3 h-10 w-56" /></div><Skeleton className="h-4 w-20" /></div><Skeleton className="mt-4 h-4 w-72 max-w-full" /><div className="media-preview-row">{Array.from({ length: 4 }).map((_, cardIndex) => <article className="media-preview-card" key={cardIndex}><Skeleton className="media-skeleton-image" rounded="lg" /><Skeleton className="mt-4 h-3 w-8" /><Skeleton className="mt-3 h-6 w-4/5" /><Skeleton className="mt-2 h-3 w-3/5" /></article>)}</div></section>
}

export default function MediaHomeSkeleton() {
  return <main className="media-page shell-width" aria-label="Loading media collections"><header className="media-header media-header-skeleton"><Skeleton className="h-3 w-32" /><Skeleton className="mt-4 h-16 w-72 max-w-full" /><Skeleton className="mt-4 h-4 w-96 max-w-full" /></header><CollectionSkeleton index={1} /><CollectionSkeleton index={2} /><CollectionSkeleton index={3} /><CollectionSkeleton index={4} /></main>
}
