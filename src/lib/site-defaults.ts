/**
 * Content the site falls back to before the studio database is connected.
 *
 * Every value here is a default, never a lock-in: each one is overridden by the
 * matching CMS record (profile settings, the hero settings record, the contact
 * details record, the section payload). Keeping them in one module means the
 * public pages can render a complete hero, introduction and footer while the
 * database is empty, without scattering literals through components.
 *
 * No imports on purpose, so scripts can transpile this file in memory.
 */
export const DEFAULT_PROFILE = {
  fullName: 'Ashok Rimal',
  headline: 'Full-Stack Software Engineer',
  /** One sentence under the name on the home hero. */
  summary: 'I build calm, dependable software - full-stack products and the interfaces that hold them together.',
  bio: 'Full-stack engineer based in Butwal, working mostly in TypeScript, Next.js and Postgres. I like the unglamorous parts: schemas that survive contact with real data, interfaces that explain themselves, and systems that stay boring under load.',
  location: 'Butwal',
  availability: 'Available',
  avatarUrl: '/images/hero-ashok.png',
  email: 'contact@lamirkohsa.com',
  githubUsername: 'ashokrimal',
} as const

/** Hero eyebrow used when neither the profile nor the brand record names a role. */
export const DEFAULT_HERO_EYEBROW = 'Software Developer'

/** Location pill default; the hero, profile and contact records override it. */
export const DEFAULT_LOCATION = DEFAULT_PROFILE.location

/** Availability pill default; the hero, profile, settings and contact records win. */
export const DEFAULT_AVAILABILITY = DEFAULT_PROFILE.availability
