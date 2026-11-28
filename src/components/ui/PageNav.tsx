'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

/**
 * Previous/next page links at the end of a page.
 *
 * `previous` sits on the left and `next` on the right, both in the same style,
 * so the pair reads as one row. `back` remains for error pages, which have no
 * sibling to step through. The back label defaults to the CMS copy.
 */
export function PageNav({
  backHref,
  backLabel,
  previousHref,
  previousLabel,
  nextHref,
  nextLabel,
}: {
  /** Pass a parent route to show a back link; pages never link back home. */
  backHref?: string
  backLabel?: string
  /** The route before this one in the navigation order. */
  previousHref?: string
  previousLabel?: string
  nextHref?: string
  nextLabel?: string
}) {
  const uiStrings = useUiStrings()
  const resolvedBackLabel = backLabel ?? uiStrings.pageNav.back.en
  const hasPrevious = Boolean(previousHref && previousLabel)
  if (!hasPrevious && !backHref && !(nextHref && nextLabel)) return null

  return (
    <nav className="mt-14 md:mt-20 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4 text-xs">
      {previousHref && previousLabel ? (
        <Link
          href={previousHref}
          className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {previousLabel}
        </Link>
      ) : backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
        >
          ← {resolvedBackLabel}
        </Link>
      ) : (
        <span />
      )}
      {nextHref && nextLabel && (
        <Link
          href={nextHref}
          className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
        >
          {nextLabel}
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}
