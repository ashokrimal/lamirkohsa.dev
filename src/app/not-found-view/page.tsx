import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

/**
 * The body an unknown path is rewritten to.
 *
 * `notFound()` cannot send a 404 once a dynamic page has started streaming, so
 * the proxy decides before rendering and rewrites here. This page throws during
 * the routing step rather than streaming a 200 skeleton, which is what lets the
 * rewrite answer with a real status; the UI is the site's `app/not-found.tsx`.
 */
export default function NotFoundViewPage() {
  notFound()
}
