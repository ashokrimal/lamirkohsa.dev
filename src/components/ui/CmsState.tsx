import { AlertTriangle } from 'lucide-react'

/**
 * The failure state for a CMS-backed section. It is deliberately different from
 * EmptyState: an outage is not an empty collection and must never invite the
 * owner to "add content".
 */
export function CmsErrorState({
  message = 'This content is temporarily unavailable.',
  className = '',
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-medium bg-transparent px-6 py-12 text-center ${className}`}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-muted" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-secondary">{message}</p>
      <p className="max-w-md text-xs text-muted">
        The content service did not respond. Nothing has been removed; try again shortly.
      </p>
    </div>
  )
}
