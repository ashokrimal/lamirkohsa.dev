'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import {
  getSubpageChrome,
  getSubpageChromeOnServer,
  subscribeSubpageChrome,
} from '@/lib/page-chrome'

/**
 * A second, slimmer bar under the main navigation on nested pages:
 *
 *   ← Back to about   Gallery
 *
 * It only appears once the hero title has scrolled away, so the title is never
 * shown twice and the main navbar is never replaced. Stays pinned while the
 * reader scrolls, which keeps the back link reachable at the very bottom.
 */
export function SubpageBar() {
  const chrome = useSyncExternalStore(
    subscribeSubpageChrome,
    getSubpageChrome,
    getSubpageChromeOnServer,
  )

  if (!chrome || !chrome.heroHidden) return null

  return (
    <div className="fixed inset-x-0 top-14 z-40 border-b border-line glass-nav">
      <nav
        className="mx-auto flex h-12 w-full max-w-[1400px] items-center gap-3 px-5 sm:px-8 lg:px-12"
        aria-label={`${chrome.backLabel} · ${chrome.title}`}
      >
        <Link
          href={chrome.backHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-subtle bg-overlay-faint px-3 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          {chrome.backLabel}
        </Link>

        <span className="h-4 w-px shrink-0 bg-line-subtle" aria-hidden="true" />

        <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-ink">
          {chrome.title}
        </p>
      </nav>
    </div>
  )
}
