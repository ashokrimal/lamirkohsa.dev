'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Reports the page's Core Web Vitals to `/api/vitals`.
 *
 * The numbers are compared against the budget on the server, so the rule lives
 * in one place (`src/lib/web-vitals.ts`) instead of being duplicated in a client
 * bundle. Reporting is fire-and-forget: a failed measurement never affects the
 * page.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== 'production') return
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: window.location.pathname,
    })

    try {
      void fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Nothing to do: the measurement is a nice-to-have.
    }
  })

  return null
}
