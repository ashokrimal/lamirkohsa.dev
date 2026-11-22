'use client'

import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { ReportIssueButton } from '@/components/ui/ReportIssueButton'

/**
 * The one error screen used by every boundary. Instead of only offering a retry
 * or a trip home, it also lets the visitor report the failure: the popup builds
 * a GitHub issue with the error and page details already filled in.
 */
export function ErrorState({
  error,
  digest,
  context,
  title = 'Something went wrong',
  message = 'This page hit an unexpected error. You can try again, or report it so it gets fixed.',
  onRetry,
  retryLabel = 'Try again',
  showBack = true,
  backHref = '/',
  backLabel = 'Go back',
}: {
  error?: unknown
  digest?: string
  context?: string
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  showBack?: boolean
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-accent">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="text-sm leading-relaxed text-muted">{message}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-inverse shadow-xs transition-opacity hover:opacity-90"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {retryLabel}
            </button>
          )}
          <ReportIssueButton error={error} digest={digest} context={context} />
          {showBack && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-4 py-2 text-xs font-medium text-ink-secondary transition-colors hover:bg-overlay hover:text-ink"
            >
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
