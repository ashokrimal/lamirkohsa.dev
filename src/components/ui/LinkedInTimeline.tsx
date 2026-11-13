import { Briefcase, Building2, Calendar, CheckCircle2, MapPin } from 'lucide-react'
import type { ExperienceItemData } from '@/components/ui/ExperienceTimeline'

/**
 * LinkedIn-style experience timeline: a continuous rail with company/role
 * nodes and readable cards. The same single-column structure is used at every
 * breakpoint; spacing and type scale up on larger screens.
 */
export function LinkedInTimeline({
  items,
  className = '',
}: {
  items: ExperienceItemData[]
  className?: string
}) {
  return (
    <ol className={`max-w-4xl space-y-0 ${className}`}>
      {items.map((item, index) => {
        const highlights = (item.highlights ?? []).filter(Boolean)

        return (
          <li
            key={item.id ?? index}
            className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 pb-6 last:pb-0 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6 sm:pb-8"
          >
            <div className="relative flex justify-center">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-line-subtle bg-surface text-accent shadow-xs sm:h-12 sm:w-12">
                <Briefcase className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden="true" />
              </span>
              {index < items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-11 bottom-0 w-px bg-line sm:top-12"
                />
              )}
            </div>

            <article className="min-w-0 rounded-[22px] border border-line-subtle bg-surface/80 p-5 shadow-xs transition-colors hover:border-line-medium sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <h3 className="break-words text-[15px] font-semibold leading-snug tracking-tight text-ink sm:text-base">
                    {item.title}
                  </h3>
                  {item.organization && (
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-accent sm:text-sm">
                      <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="break-words">{item.organization}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted sm:justify-end sm:text-xs">
                  {item.period && (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line-subtle bg-overlay-faint px-2.5 py-1 font-medium text-ink-secondary">
                      <Calendar className="h-3 w-3 text-accent" aria-hidden="true" />
                      {item.period}
                    </span>
                  )}
                  {item.location && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="break-words">{item.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary sm:mt-4 sm:text-sm">
                  {item.description}
                </p>
              )}

              {highlights.length > 0 && (
                <div className="mt-4 border-t border-line-faint pt-3.5">
                  <p className="text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted">
                    Highlights
                  </p>
                  <ul className="mt-2.5 grid gap-2 text-[12px] sm:grid-cols-2 sm:text-xs">
                    {highlights.map((highlight, highlightIndex) => (
                      <li
                        key={highlightIndex}
                        className="flex items-start gap-2 rounded-xl border border-line-hairline bg-overlay-faint p-2.5"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        <span className="leading-snug text-ink-secondary">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </li>
        )
      })}
    </ol>
  )
}
