'use client'

import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/ui/ErrorState'

interface ErrorPageProps {
  statusCode?: number
  title?: string
  message?: string
  showRetry?: boolean
  retryText?: string
  onRetry?: () => void
}

/**
 * Page-level error surface. It keeps its props for existing callers but hands
 * the rendering to the shared error screen, so every failure offers the same
 * retry, report-issue and back actions.
 */
export function ErrorPage({
  statusCode = 500,
  title = 'Something went wrong',
  message = "We're sorry, but an unexpected error has occurred. Please try again later.",
  showRetry = true,
  retryText = 'Try again',
  onRetry,
}: ErrorPageProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      router.refresh()
    }
  }

  return (
    <ErrorState
      title={statusCode && statusCode !== 500 ? `${title} (${statusCode})` : title}
      message={message}
      error={{ name: 'PageError', message: `${title} (HTTP ${statusCode})` }}
      onRetry={showRetry ? handleRetry : undefined}
      retryLabel={retryText}
      backLabel="Go back"
    />
  )
}
