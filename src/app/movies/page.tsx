import { getMediaData } from '@/app/actions/media'
import EmptyCollectionState from '@/components/EmptyCollectionState'

export const dynamic = 'force-dynamic'

type Movie = { id: number; title: string; payload: Record<string, unknown> }

export default async function MoviesPage() {
  const { movies } = await getMediaData()
  const records = Array.from(new Map((movies as Movie[]).map((movie) => [movie.title.toLowerCase().replace(/[^a-z0-9]+/g, ''), movie])).values())
  return <main className="detail-page shell-width"><header className="detail-page-header"><div><p className="section-label">Media / Movies</p><h1>Movies I&apos;ve <span className="accent-text">watched.</span></h1><p>A personal shelf of films watched, remembered, and worth returning to.</p></div></header>{records.length ? <div className="detail-shelf-grid">{records.map((movie, index) => <article className="detail-media-card" key={movie.id}><div><p className="section-label">{String(index + 1).padStart(2, '0')}</p><h2>{movie.title}</h2><p>{typeof movie.payload.description === 'string' ? movie.payload.description : 'Watched movie'}</p></div></article>)}</div> : <EmptyCollectionState eyebrow="Movies / Empty" title="The watchlist is waiting." description="Watched films will appear here as the collection grows." action={{ label: 'Return to Media', href: '/media' }} />}</main>
}
