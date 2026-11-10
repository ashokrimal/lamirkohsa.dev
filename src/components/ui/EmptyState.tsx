import type { LucideIcon } from 'lucide-react'

/**
 * Neutral placeholder for a collection with no published records yet.
 * Dashed, muted and centred so an empty CMS still looks intentional.
 */
export function EmptyState({
  icon: Icon,
  message,
  hint,
  className = '',
}: {
  icon: LucideIcon
  message: string
  hint?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-medium bg-transparent px-6 py-12 text-center ${className}`}
      role="status"
    >
      <Icon className="w-5 h-5 text-muted" aria-hidden="true" />
      <p className="text-sm text-muted">{message}</p>
      {hint && <p className="text-xs text-muted/80">{hint}</p>}
    </div>
  )
}
