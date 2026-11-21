'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

/** Previous/next page links; the back label defaults to the CMS copy. */
export function PageNav({
  backHref,
  backLabel,
  nextHref,
  nextLabel,
}: {
  /** Pass a parent route to show a back link; pages never link back home. */
  backHref?: string
  backLabel?: string
  nextHref?: string
  nextLabel?: string
}) {
  const uiStrings = useUiStrings()
  const resolvedBackLabel = backLabel ?? uiStrings.pageNav.back.en
  if (!backHref && !(nextHref && nextLabel)) return null

  return (
    <nav className="mt-14 md:mt-20 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4 text-xs">
      {backHref ? (
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
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </nav>
  )
}
