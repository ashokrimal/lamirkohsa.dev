import { Skeleton } from '@/components/Skeleton'

export default function ProfileListSkeleton({ label = 'Loading collection' }: { label?: string }) {
  return <main className="profile-page shell-width" aria-label={label}><header className="profile-list-header"><Skeleton className="h-3 w-32" /><Skeleton className="mt-5 h-16 w-80 max-w-full" /><Skeleton className="mt-4 h-4 w-full max-w-xl" /></header><section className="profile-list-skeleton">{Array.from({ length: 4 }).map((_, index) => <article className="profile-list-item" key={index}><Skeleton className="h-3 w-24" /><div><Skeleton className="h-8 w-64 max-w-full" /><Skeleton className="mt-3 h-4 w-40" /><Skeleton className="mt-4 h-4 w-full max-w-lg" /><Skeleton className="mt-2 h-4 w-4/5 max-w-md" /></div></article>)}</section></main>
}
