import { Skeleton } from '@/components/Skeleton'

export default function RootLoading() {
  return <main className="home-page shell-width" aria-label="Loading homepage"><section className="hero-section"><div className="hero-editorial"><div className="hero-copy"><Skeleton className="h-3 w-28" /><Skeleton className="mt-6 h-20 w-full max-w-2xl" /><Skeleton className="mt-5 h-4 w-full max-w-md" /><Skeleton className="mt-2 h-4 w-4/5 max-w-sm" /></div><Skeleton className="hero-portrait-skeleton" rounded="lg" /></div></section><section className="home-signals"><Skeleton className="h-40 w-full" rounded="lg" /><div className="home-signal-grid">{Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-32" rounded="lg" key={index} />)}</div></section></main>
}
