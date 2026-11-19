import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeroMotion } from '@/components/ui/PageHeroMotion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { uiStrings } from '@/lib/ui-strings'

/**
 * The shared page frame. Every public page renders through these primitives so
 * spacing, heading scale, rules and navigation stay identical across the site.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn('shell-width pt-28 md:pt-36 pb-16 md:pb-24', className)}>{children}</main>
  )
}

export function PageHero({
  eyebrow,
  krEyebrow,
  title,
  accent,
  description,
  meta,
  actions,
}: {
  eyebrow: string
  krEyebrow?: string
  title: string
  accent?: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <PageHeroMotion
      eyebrow={eyebrow}
      krEyebrow={krEyebrow}
      title={title}
      accent={accent}
      description={description}
      meta={meta}
      actions={actions}
    />
  )
}

export function MetaChip({
  children,
  icon: Icon,
}: {
  children: ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/70 px-3 py-1 text-[11px] font-medium text-ink-secondary">
      {Icon && <Icon className="w-3 h-3 text-accent" />}
      {children}
    </span>
  )
}

export function PageSection({
  id,
  number,
  eyebrow,
  krEyebrow,
  title,
  accent,
  description,
  linkHref,
  linkLabel,
  actions,
  children,
  className,
}: {
  id?: string
  number?: number
  eyebrow?: string
  krEyebrow?: string
  title: string
  accent?: string
  description?: string
  linkHref?: string
  linkLabel?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('pt-12 md:pt-16', className)}>
      <SectionHeader
        number={number}
        eyebrow={eyebrow}
        krEyebrow={krEyebrow}
        title={title}
        accent={accent}
        description={description}
        linkHref={linkHref}
        linkLabel={linkLabel}
        actions={actions}
      />
      <div className="mt-8">{children}</div>
    </section>
  )
}

export function PageNav({
  backHref,
  backLabel = uiStrings.pageNav.back.en,
  nextHref,
  nextLabel,
}: {
  /** Pass a parent route to show a back link; pages never link back home. */
  backHref?: string
  backLabel?: string
  nextHref?: string
  nextLabel?: string
}) {
  if (!backHref && !(nextHref && nextLabel)) return null

  return (
    <nav className="mt-14 md:mt-20 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4 text-xs">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
        >
          ← {backLabel}
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
