'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { uiStrings } from '@/lib/ui-strings'

export interface HorizontalCollectionProps {
  /** Cards in display order. Only the first `previewCount` are rendered. */
  items: ReactNode[]
  /** How many content cards the preview shows. Defaults to 5. */
  previewCount?: number
  /** When set, a final "View all" card links here. */
  viewAllHref?: string
  viewAllLabel?: string
  /** Copy shown when there is nothing published yet. */
  emptyState?: ReactNode
  ariaLabel?: string
  className?: string
}

/**
 * The one horizontal card collection used by the gallery, featured projects and
 * every media section.
 *
 * It scrolls horizontally (touch, trackpad and keyboard), snaps to each card, and
 * ends with a single "View all" card. There are deliberately no arrow buttons or
 * duplicate links above or below the row.
 */
export function HorizontalCollection({
  items,
  previewCount = 5,
  viewAllHref,
  viewAllLabel,
  emptyState,
  ariaLabel,
  className = '',
}: HorizontalCollectionProps) {
  const limit = Math.max(1, previewCount)
  const visible = items.slice(0, limit)
  // Only offer "View all" when there is actually more to see.
  const showViewAll = Boolean(viewAllHref) && items.length > limit

  if (visible.length === 0 && !showViewAll) {
    return <>{emptyState ?? null}</>
  }

  return (
    <div
      className={`horizontal-collection -mx-5 sm:mx-0 ${className}`}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <ul className="horizontal-collection-track">
        {visible.map((item, index) => (
          <li className="horizontal-collection-item" key={index}>
            {item}
          </li>
        ))}

        {showViewAll && viewAllHref && (
          <li className="horizontal-collection-item horizontal-collection-item--action">
            <Link href={viewAllHref} className="horizontal-collection-view-all">
              <span className="horizontal-collection-view-all-label">
                {viewAllLabel || uiStrings.collection.viewAll.en}
              </span>
              <span className="horizontal-collection-view-all-icon" aria-hidden="true">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  )
}
