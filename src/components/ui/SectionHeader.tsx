import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { withSectionNumber } from '@/lib/cms-schema'

interface SectionHeaderProps {
  /** Zero-based registry position; renders as the `01 /` prefix. */
  number?: number
  eyebrow?: string
  krEyebrow?: string
  title: string
  accent?: string
  description?: string
  linkHref?: string
  linkLabel?: string
  className?: string
  actions?: ReactNode
  headingAs?: 'h1' | 'h2'
}

export function SectionHeader({
  number,
  eyebrow,
  krEyebrow,
  title,
  accent,
  description,
  linkHref,
  linkLabel,
  className = '',
  actions,
  headingAs = 'h2',
}: SectionHeaderProps) {
  // The number comes from the section registry, never from CMS copy.
  const renderedEyebrow = number === undefined ? eyebrow : withSectionNumber(number, eyebrow)

  // An empty CMS record should not leave a blank heading and rule behind.
  if (!renderedEyebrow && !title && !description && !actions && !(linkHref && linkLabel)) {
    return null
  }

  const Heading = headingAs

  return (
    <div className={`pb-6 border-b border-line ${className}`}>
      {renderedEyebrow && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
            {renderedEyebrow}
          </span>
          {krEyebrow && (
            <span lang="ko" className="text-[11px] font-korean text-muted tracking-normal font-normal">
              · {krEyebrow}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <Heading className="min-w-0 text-2xl sm:text-3xl md:text-5xl font-semibold text-ink tracking-[-0.04em] leading-[1.05]">
          {title}{' '}
          {accent && <span className="font-normal text-accent">{accent}</span>}
        </Heading>

        {(actions || (linkHref && linkLabel)) && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}
            {linkHref && linkLabel && (
              <Link
                href={linkHref}
                className="media-shelf-link group whitespace-nowrap shrink-0"
              >
                <span>{linkLabel}</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 max-w-2xl text-sm md:text-base text-muted leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  )
}
