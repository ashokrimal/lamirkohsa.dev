export function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      <div className="space-y-2">
        <div className="h-3 w-24 bg-[var(--line)]/70 rounded-xs" />
        <div className="h-8 w-64 bg-[var(--line)]/80 rounded-xs" />
        <div className="h-4 w-96 max-w-full bg-[var(--line)]/50 rounded-xs" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-sm border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3"
          >
            <div className="h-4 w-1/3 bg-[var(--line)]/60 rounded-xs" />
            <div className="h-6 w-3/4 bg-[var(--line)]/80 rounded-xs" />
            <div className="h-16 w-full bg-[var(--line)]/40 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden space-y-4 p-6"
        >
          <div className="h-44 bg-[var(--line)]/60 rounded-xs" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-[var(--line)]/70 rounded-xs" />
            <div className="h-6 w-2/3 bg-[var(--line)]/80 rounded-xs" />
            <div className="h-12 w-full bg-[var(--line)]/50 rounded-xs" />
          </div>
        </div>
      ))}
    </div>
  )
}
