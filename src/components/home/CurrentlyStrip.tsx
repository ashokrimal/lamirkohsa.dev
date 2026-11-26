import Link from 'next/link'
import type { CurrentlyEntry } from '@/lib/currently'

/**
 * The homepage's "currently" row. It is chrome beside the hero, like the hero
 * itself: the content comes from published media records and public GitHub
 * activity, never from copy typed into a component.
 */
export function CurrentlyStrip({
  entries,
  label,
}: {
  entries: CurrentlyEntry[]
  label: string
}) {
  if (entries.length === 0) return null

  return (
    <section aria-label={label} className="mt-10 md:mt-14">
      <div className="flex items-center gap-3 pb-3 border-b border-line-subtle">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">{label}</span>
        <span className="h-px flex-1 bg-line-subtle" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4 md:gap-5">
        {entries.map((entry) => {
          const body = (
            <>
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
                {entry.label}
              </span>
              <span className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:text-accent md:text-[0.95rem]">
                {entry.value}
              </span>
              {entry.meta && (
                <span className="mt-0.5 line-clamp-1 text-[11px] text-muted">{entry.meta}</span>
              )}
            </>
          )

          const className =
            'group flex min-w-0 flex-col rounded-2xl border border-line-subtle bg-surface/60 px-4 py-3.5 transition-colors'

          return entry.href ? (
            <Link
              key={entry.key}
              href={entry.href}
              className={`${className} hover:border-line-medium`}
            >
              {body}
            </Link>
          ) : (
            <div key={entry.key} className={className}>
              {body}
            </div>
          )
        })}
      </div>
    </section>
  )
}
