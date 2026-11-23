'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

/**
 * Route-level error screen. Next renders this for an error thrown while a page
 * streams; the report action carries the error and digest to a GitHub issue.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error caught:', error)
    // The boundary swallows the error before the global listener sees it, so it
    // is reported here too. Nothing waits on the request.
    try {
      void fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'boundary',
          message: error.message || 'Route error',
          stack: error.stack,
          url: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }, [error])

  return <ErrorState error={error} digest={error.digest} onRetry={reset} />
}
