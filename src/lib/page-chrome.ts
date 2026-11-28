'use client'

/**
 * The page title published by the hero, used by the sticky subpage strip.
 *
 * Only pages with a parent (a page of a page) publish here. The strip sits
 * under the main navigation and shows `← Back  <title>` once the hero title
 * has scrolled out of view, so the way back stays reachable at any depth
 * without replacing the main navbar.
 */
export interface SubpageChrome {
  title: string
  backHref: string
  backLabel: string
  /** True once the hero has scrolled past the navbar. */
  heroHidden: boolean
}

let current: SubpageChrome | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function setSubpageChrome(next: SubpageChrome | null) {
  if (current === next) return
  current = next
  emit()
}

export function setSubpageHeroHidden(heroHidden: boolean) {
  if (!current || current.heroHidden === heroHidden) return
  current = { ...current, heroHidden }
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

/** Server snapshot: the strip is client-only, so nothing renders during SSR. */
export function getSubpageChromeOnServer(): SubpageChrome | null {
  return null
}
