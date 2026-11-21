import { NAV_PAGES } from '@/lib/cms-schema'

/**
 * Previous/next links for the site's index pages, derived from the locked route
 * registry so a page never hardcodes another page's label or invents a route.
 * `PageNav` renders nothing without links, which is why the index pages looked
 * like they had navigation when they did not.
 */

export interface NextPageNav {
  nextHref: string
  nextLabel: string
}

export interface ParentPageNav {
  backHref: string
  backLabel: string
}

/** The registry route after `route`, for a "next" link at the end of a page. */
export function nextPageNav(route: string): NextPageNav | undefined {
  const index = NAV_PAGES.findIndex((page) => page.route === route)
  if (index < 0) return undefined
  const next = NAV_PAGES[index + 1]
  if (!next) return undefined
  return { nextHref: next.route, nextLabel: `Next · ${next.label}` }
}

/**
 * The closest parent route (`/about/gallery` → `/about`), for a "back" link.
 * Routes directly under the site root have no parent: pages never link home.
 */
export function parentPageNav(route: string): ParentPageNav | undefined {
  const segments = route.split('/').filter(Boolean)
  if (segments.length < 2) return undefined
  const parentRoute = `/${segments.slice(0, -1).join('/')}`
  const parent = NAV_PAGES.find((page) => page.route === parentRoute)
  if (!parent) return undefined
  return { backHref: parent.route, backLabel: `Back to ${parent.label.toLowerCase()}` }
}
