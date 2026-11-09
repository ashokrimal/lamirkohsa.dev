import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow?: string
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
  title,
  accent,
  description,
  linkHref,
  linkLabel,
  className = '',
  actions,
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)] ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl md:text-5xl font-normal text-[var(--ink)] tracking-[-0.05em] leading-tight">
          {title}{' '}
          {accent && (
            <span className="font-serif italic text-[var(--accent)]">
              {accent}
            </span>
          )}
        </h2>
        {description && (
          <p className="mt-2 text-xs md:text-sm text-[var(--muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {actions}
        {linkHref && linkLabel && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline group"
          >
            <span>{linkLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
