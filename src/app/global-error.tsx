'use client'

import { useEffect } from 'react'
import { buildIssueReport } from '@/lib/report-issue'

/**
 * Last-resort boundary. It replaces the root layout, so it cannot rely on the
 * site's CSS or client components: the screen is inline-styled and the report
 * link is built from the error at render time.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error caught:', error)
  }, [error])

  const report = buildIssueReport({ error, digest: error.digest, context: 'whole site' })

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#f4f1eb',
          color: '#1d1d1f',
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: '#5a5a5e' }}>
            The site hit an unexpected error. You can reload, or report it so it gets fixed.
          </p>
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '9px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#52725d',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload the page
            </button>
            <a
              href={report.url}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                padding: '9px 16px',
                borderRadius: 999,
                border: '1px solid #d8d4cb',
                background: '#fbfaf7',
                color: '#1d1d1f',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Report the issue
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 18, fontSize: 11, color: '#8a8a8f' }}>
              Error reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
