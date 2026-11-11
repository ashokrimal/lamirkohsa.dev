import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'

/**
 * Neutral placeholder for a collection with no published records yet.
 * Dashed, muted and centred so an empty CMS still looks intentional. When an
 * admin action is provided it doubles as the "add content" affordance.
 */
export function EmptyState({
  icon: Icon,
  message,
  hint,
  actionLabel,
  actionHref,
  className = '',
}: {
  icon: LucideIcon
  message: string
  hint?: string
  /** Label for the add/manage action, e.g. "Add project in admin". */
  actionLabel?: string
  /** Admin (or any) path the action should link to. */
  actionHref?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-medium bg-transparent px-6 py-12 text-center ${className}`}
      role="status"
    >
      <Icon className="w-5 h-5 text-muted" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm text-muted">{message}</p>
        {hint && <p className="text-xs text-muted/80">{hint}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-4 py-2 text-xs font-medium text-ink-secondary shadow-xs transition-colors hover:border-line-medium hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
