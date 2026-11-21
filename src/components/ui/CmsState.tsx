'use client'

import { AlertTriangle } from 'lucide-react'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

/**
 * The failure state for a CMS-backed section. It is deliberately different from
 * EmptyState: an outage is not an empty collection and must never invite the
 * owner to "add content".
 */
export function CmsErrorState({
  message,
  className = '',
}: {
  message?: string
  className?: string
}) {
  const uiStrings = useUiStrings()
  const resolvedMessage = message ?? uiStrings.cmsState.defaultMessage.en
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-medium bg-transparent px-6 py-12 text-center ${className}`}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-muted" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-secondary">{resolvedMessage}</p>
      <p className="max-w-md text-xs text-muted">{uiStrings.cmsState.hint.en}</p>
    </div>
  )
}
