import { cn } from '@/lib/utils'

/**
 * Route-level loading skeletons.
 *
 * They mirror the real page chrome (`PageShell` padding, the hero rule, the
 * section rhythm) and use the same design tokens as the components they stand
 * in for, so a skeleton is never an invisible or differently-coloured page.
 */

function Block({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-overlay-medium', className)} aria-hidden="true" />
}

export function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)} aria-hidden="true">
      <div className="space-y-2">
        <Block className="h-3 w-24" />
        <Block className="h-8 w-64 max-w-full" />
        <Block className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-48 rounded-xl border border-line-subtle bg-surface p-5">
            <Block className="h-4 w-1/3" />
            <Block className="mt-3 h-6 w-3/4" />
            <Block className="mt-4 h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4 rounded-xl border border-line-subtle bg-surface p-5">
          <Block className="h-44 w-full rounded-lg" />
          <Block className="h-3 w-20" />
          <Block className="h-6 w-2/3" />
          <Block className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * The shared page skeleton. Every route without its own loading file (and the
 * ones that do) renders this inside the same shell as the finished page, so the
 * layout does not jump when the content arrives.
 */
export function PageSkeleton({
  variant = 'cards',
  label = 'Loading page',
}: {
  variant?: 'cards' | 'rows' | 'article'
  label?: string
}) {
  return (
    <main
      className="shell-width pt-28 pb-16 md:pt-36 md:pb-24"
      aria-busy="true"
      aria-label={label}
    >
      <header className="space-y-3 border-b border-line pb-10 md:pb-14">
        <Block className="h-3 w-28" />
        <Block className="h-12 w-2/3 max-w-xl md:h-16" />
        <Block className="h-4 w-full max-w-lg" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Block className="h-6 w-24 rounded-full" />
          <Block className="h-6 w-28 rounded-full" />
        </div>
      </header>

      {variant === 'cards' && (
        <div className="mt-10">
          <ProjectCardsSkeleton count={3} />
        </div>
      )}

      {variant === 'rows' && (
        <div className="mt-10 space-y-8" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="grid gap-4 border-t border-line-subtle pt-6 md:grid-cols-[0.5fr_1.5fr]">
              <Block className="h-3 w-24" />
              <div className="space-y-3">
                <Block className="h-7 w-56 max-w-full" />
                <Block className="h-4 w-full max-w-xl" />
                <Block className="h-4 w-4/5 max-w-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'article' && (
        <div className="mt-10 max-w-3xl space-y-4" aria-hidden="true">
          <Block className="h-56 w-full rounded-2xl" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-11/12" />
          <Block className="h-4 w-3/4" />
          <Block className="mt-6 h-7 w-48" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-5/6" />
        </div>
      )}
    </main>
  )
}
