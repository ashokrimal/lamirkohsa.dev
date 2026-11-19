import type { ReactNode } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

/**
 * Dedicated empty state for a section, collection, or external integration feed
 * when no published records or live items are currently available.
 */
export function EmptyState({
  eyebrow,
  icon: Icon,
  message,
  hint,
  actionLabel,
  actionHref,
  footer,
  className = '',
}: {
  eyebrow?: string
  icon: LucideIcon
  message: string
  hint?: string
  /** Optional public navigation label. */
  actionLabel?: string
  /** Optional public destination href. */
  actionHref?: string
  /** Optional extra controls (e.g. Retry or external profile link). */
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-line-medium bg-overlay-faint/40 px-6 py-10 md:py-12 text-center ${className}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line-subtle bg-surface/80 text-muted shadow-xs"
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="space-y-1.5 max-w-md">
        {eyebrow && (
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted/90">
            {eyebrow}
          </p>
        )}
        <p className="text-sm font-medium text-ink-secondary">{message}</p>
        {hint && <p className="text-xs text-muted leading-relaxed">{hint}</p>}
      </div>
      {(actionLabel && actionHref) || footer ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-4 py-2 text-xs font-medium text-ink-secondary shadow-xs transition-colors hover:border-line-medium hover:text-accent"
            >
              <span>{actionLabel}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
          {footer}
        </div>
      ) : null}
    </div>
  )
}
