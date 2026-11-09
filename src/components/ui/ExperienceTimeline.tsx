import { Briefcase, Calendar, CheckCircle2, GraduationCap, MapPin } from 'lucide-react'

export interface ExperienceItemData {
  id?: number | string
  title: string
  organization: string
  period: string
  location?: string
  description: string
  highlights?: string[]
}

interface ExperienceTimelineProps {
  items: ExperienceItemData[]
  type?: 'experience' | 'education'
  className?: string
}

export function ExperienceTimeline({
  items,
  type = 'experience',
  className = '',
}: ExperienceTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-sm border border-[var(--line)] bg-[var(--surface)] text-center text-xs text-[var(--muted)]">
        No records published in this section yet.
      </div>
    )
  }

  const Icon = type === 'experience' ? Briefcase : GraduationCap

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <article
          key={item.id || index}
          className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 transition-all hover:border-[var(--accent)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 mb-3 border-b border-[var(--line)]/60">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="p-1 rounded-xs bg-[var(--paper)] text-[var(--accent)] border border-[var(--line)]">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold text-sm text-[var(--ink)]">
                  {item.title}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--accent)] font-medium">
                {item.organization}
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--muted)] shrink-0">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--accent)]" />
                {item.period}
              </span>
              {item.location && (
                <span className="hidden md:inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[var(--muted)]" />
                  {item.location}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
            {item.description}
          </p>

          {item.highlights && item.highlights.length > 0 && (
            <ul className="mt-3 space-y-1.5 pt-2 border-t border-[var(--line)]/40 text-xs text-[var(--ink)]">
              {item.highlights.map((h, hIdx) => (
                <li key={hIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
                  <span className="leading-snug">{h}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  )
}
