'use client'

/**
 * The page title published by the hero, so the fixed site header can turn into
 * a sticky page bar on nested routes.
 *
 * Nested pages (a page of a page) render `PageHero` with a parent link. The
 * hero publishes its title here; `SiteHeader` subscribes and replaces the
 * default navigation with a back button and that title, which keeps the way out
 * reachable at any scroll position. The entry is cleared when the page unmounts.
 */
export interface SubpageChrome {
  title: string
  backHref: string
  backLabel: string
}

let current: SubpageChrome | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function setSubpageChrome(next: SubpageChrome | null) {
  if (
    current === next ||
    (current &&
      next &&
      current.title === next.title &&
      current.backHref === next.backHref &&
      current.backLabel === next.backLabel)
  ) {
    return
  }
  current = next
  emit()
}

export function getSubpageChrome(): SubpageChrome | null {
  return current
}

export function subscribeSubpageChrome(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Server snapshot: the header renders its default navigation during SSR. */
export function getSubpageChromeOnServer(): SubpageChrome | null {
  return null
}
