'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

/** App-wide fallback used when the root layout's tree cannot render. */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error)
  }, [error])

  return <ErrorState error={error} digest={error.digest} onRetry={reset} retryLabel="Reload the page" />
}
