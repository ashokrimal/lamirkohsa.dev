import { NAV_ROUTES } from '@/lib/cms-schema'

/**
 * Sitemap policy, kept out of the route so it can be tested without a database.
 *
 * The sitemap lists canonical, indexable URLs only. Every route that renders a
 * bespoke component is already covered by `NAV_PAGES` (or a collection below),
 * and every route that permanently redirects someone else is left out on
 * purpose: submitting a redirecting URL is an indexing error, not a signal.
 */

/** Retired routes that 301 to their canonical replacement. */
export const CASE_STUDY_REDIRECT_SOURCES = ['/work'] as const

/** Real pages that are deliberately excluded from search indexes. */
const UNLISTED_ROUTES = [
  '/admin',
  '/sign-in',
  '/forgot-password',
  '/reset-password',
  '/classic',
]

/** Private prefixes: a studio page row must never expose these. */
const PRIVATE_PREFIXES = ['/admin', '/api']

/**
 * Dynamic segments are listed from the collection they render, so a page row
 * whose slug happens to sit under one of these prefixes must not be listed a
 * second time at a URL the site does not actually serve.
 */
const DYNAMIC_PREFIXES = ['/blogs/', '/projects/', '/about/']

const RESERVED_ROUTES = new Set<string>([
  ...NAV_ROUTES,
  ...UNLISTED_ROUTES,
  ...CASE_STUDY_REDIRECT_SOURCES,
])

/** Normalizes a page slug the same way the studio data layer does. */
export function normalizeSitemapSlug(slug: string): string {
  if (!slug) return '/'
  const withLeading = slug.startsWith('/') ? slug : `/${slug}`
  return withLeading.replace(/\/+$/, '') || '/'
}

/**
 * True when a studio-created page should appear at its own URL. Structural
 * pages are excluded because they already have a hand-written entry with its
 * own priority and change frequency.
 */
export function isSitemapPageSlug(slug: string): boolean {
  const normalized = normalizeSitemapSlug(slug)
  if (normalized === '/') return false
  if (RESERVED_ROUTES.has(normalized)) return false
  if (PRIVATE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return false
  }
  if (DYNAMIC_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false
  return true
}

/**
 * Coerces a CMS timestamp to a Date. Anything unusable returns `undefined` so
 * the entry is emitted without a `lastModified` rather than with a fabricated
 * one — a sitemap that claims everything changed on every crawl trains
 * crawlers to ignore the field.
 */
export function toLastModified(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }
  return undefined
}

/** The most recent usable timestamp, for index pages with no record of their own. */
export function newestOf(...values: unknown[]): Date | undefined {
  let newest: Date | undefined
  for (const value of values) {
    const date = toLastModified(value)
    if (!date) continue
    if (!newest || date.getTime() > newest.getTime()) newest = date
  }
  return newest
}
