'use client'

import { useEffect } from 'react'

/**
 * Sends uncaught browser errors to the server.
 *
 * Without this, a React boundary logs to a console the visitor never opens, and
 * an unhandled promise rejection is invisible entirely. The reporter keeps a
 * short local memory of what it has sent so one broken component cannot post the
 * same error on every render, and it stops after five reports per page view.
 *
 * Reporting never changes what the visitor sees, and a failed report is ignored.
 */

const MAX_REPORTS_PER_PAGE = 5
const SEEN_LIMIT = 20

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify({
    ...payload,
    url: window.location.href,
    userAgent: navigator.userAgent.slice(0, 200),
  })

  try {
    // `keepalive` lets the request finish while the page unloads.
    void fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Nothing to do: the page is in a worse state than this report.
  }
}

export function ClientErrorReporter() {
  useEffect(() => {
    const seen = new Set<string>()
    let sent = 0

    const report = (kind: 'error' | 'unhandledrejection', message: string, extra: Record<string, unknown> = {}) => {
      const trimmed = message.trim().slice(0, 400)
      if (!trimmed || sent >= MAX_REPORTS_PER_PAGE) return
      const signature = `${kind}:${trimmed}`
      if (seen.has(signature)) return
      if (seen.size >= SEEN_LIMIT) return
      seen.add(signature)
      sent += 1
      send({ kind, message: trimmed, ...extra })
    }

    const onError = (event: ErrorEvent) => {
      report('error', event.message || 'Unknown error', {
        ...(event.filename ? { source: event.filename } : {}),
        ...(event.error instanceof Error && event.error.stack ? { stack: event.error.stack } : {}),
      })
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message =
        reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'Unhandled rejection'
      report('unhandledrejection', message, {
        ...(reason instanceof Error && reason.stack ? { stack: reason.stack } : {}),
      })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
