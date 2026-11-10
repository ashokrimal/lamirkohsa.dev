import type { Metadata } from 'next'
import { Film } from 'lucide-react'
import { getMediaData } from '@/app/actions/media'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { getPageCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Films Watched - Ashok Rimal',
  description: 'A personal shelf of films watched, remembered, and worth returning to.',
}

type Movie = { id: number; title: string; payload: Record<string, unknown> }

export default async function MoviesPage() {
  const [{ movies }, copy] = await Promise.all([getMediaData(), getPageCopy()])
  const pageCopy = copy['media-films']
  const records = Array.from(
    new Map(
      (movies as Movie[]).map((movie) => [
        movie.title.toLowerCase().replace(/[^a-z0-9]+/g, ''),
        movie,
      ]),
    ).values(),
  )

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? ''}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
        meta={records.length ? <MetaChip icon={Film}>{records.length} films</MetaChip> : undefined}
      />

      <div className="mt-10 md:mt-14">
        {records.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((movie, index) => (
              <article key={movie.id} className="apple-card p-5 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, '0')} / Film
                </span>
                <h2 className="text-sm font-semibold text-ink tracking-tight">{movie.title}</h2>
                <p className="text-xs text-muted leading-relaxed">
                  {typeof movie.payload.description === 'string'
                    ? movie.payload.description
                    : 'Watched movie'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyCollectionState
            eyebrow="Movies / Empty"
            title="The watchlist is waiting."
            description="Watched films will appear here as the collection grows."
            action={{ label: 'Return to Media', href: '/media' }}
          />
        )}
      </div>

      <PageNav
        backHref="/media"
        backLabel="Back to media"
        nextHref="/gallery"
        nextLabel="View photography"
      />
    </PageShell>
  )
}
