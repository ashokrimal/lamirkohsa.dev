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
  }, [error])

  return <ErrorState error={error} digest={error.digest} onRetry={reset} />
}
