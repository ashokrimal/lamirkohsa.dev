'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Client boundary used around whole pages. Its fallback offers a retry and the
 * report-issue popup rather than sending the visitor straight home.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorState
            error={this.state.error}
            digest={(this.state.error as (Error & { digest?: string }) | null)?.digest}
            onRetry={this.handleReset}
            retryLabel="Reload the page"
          />
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
