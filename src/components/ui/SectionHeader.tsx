import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow?: string
  krEyebrow?: string
  title: string
  accent?: string
  description?: string
  linkHref?: string
  linkLabel?: string
  className?: string
  actions?: ReactNode
}

export function SectionHeader({
  eyebrow,
  krEyebrow,
  title,
  accent,
  description,
  linkHref,
  linkLabel,
  className = '',
  actions,
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line ${className}`}>
      <div className="max-w-2xl space-y-2">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
              {eyebrow}
            </span>
            {krEyebrow && (
              <span className="text-[11px] font-korean text-muted tracking-normal font-normal">
                · {krEyebrow}
              </span>
            )}
          </div>
        )}
        <h2 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-0.04em] leading-[1.05]">
          {title}{' '}
          {accent && (
            <span className="font-serif italic font-normal text-accent">
              {accent}
            </span>
          )}
        </h2>
        {description && (
          <p className="mt-2 text-sm md:text-base text-muted leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {actions}
        {linkHref && linkLabel && (
          <Link
            href={linkHref}
            className="apple-btn-secondary group"
          >
            <span>{linkLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
