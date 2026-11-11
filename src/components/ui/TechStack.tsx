interface TechStackProps {
  items: string[]
  /** Caps the number of pills shown; the rest are summarised as +N. */
  limit?: number
  className?: string
}

/** Shared tech pills used by project cards, project rows and case studies. */
export function TechStack({ items, limit, className = '' }: TechStackProps) {
  if (!items.length) return null
  const visible = typeof limit === 'number' ? items.slice(0, limit) : items
  const hidden = items.length - visible.length

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {visible.map((tech) => (
        <span
          key={tech}
          className="inline-flex items-center rounded-full border border-line-hairline bg-overlay px-3 py-1 text-[11px] font-medium text-ink-secondary"
        >
          {tech}
        </span>
      ))}
      {hidden > 0 && (
        <span className="self-center px-1 text-[11px] text-muted">+{hidden}</span>
      )}
    </div>
  )
}
