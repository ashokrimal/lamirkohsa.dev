import { uiStrings } from '@/lib/ui-strings'

export interface HeroStat {
  label: string
  value: string
}

/**
 * The hero keeps only the main hook; the supporting numbers and location move
 * into these cards directly below it. Every value is CMS-managed.
 */
export function HeroFacts({
  stats,
  location,
}: {
  stats?: HeroStat[]
  location?: string
}) {
  const lines = (location || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const visibleStats = (stats || []).filter((stat) => stat.label || stat.value)
  if (visibleStats.length === 0 && lines.length === 0) return null

  return (
    <section className="shell-width hero-facts" aria-label={uiStrings.hero.ariaLabel.en}>
      {visibleStats.map((stat, index) => (
        <article className="hero-fact-card" key={`${stat.label}-${index}`}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </article>
      ))}

      {lines.length > 0 && (
        <article className="hero-fact-card hero-fact-card--location">
          <span className="hero-fact-eyebrow">{uiStrings.hero.basedIn.en}</span>
          <strong>{lines[0]}</strong>
          {lines.slice(1).map((line) => (
            <span key={line} className="hero-fact-note">
              {line}
            </span>
          ))}
        </article>
      )}
    </section>
  )
}
