'use client'

/**
 * The installed-app layout choice.
 *
 * When the site runs as an installed app (standalone display mode) the visitor
 * picks between the normal website and an app layout with a bottom tab bar.
 * The choice is stored per device and can be changed from the menu at any time.
 * Browsing in a normal tab never shows the app layout, because the bottom tabs
 * would replace navigation the browser already provides.
 */
import { useEffect, useSyncExternalStore } from 'react'

export type AppShellMode = 'website' | 'app'

const STORAGE_KEY = 'lamirkohsa:shell-mode'

export interface AppShellState {
  /** True when running from an installed app window. */
  installed: boolean
  /** The stored choice; null until the visitor picks one. */
  mode: AppShellMode | null
  /** False until the client has read storage, so nothing flashes during SSR. */
  ready: boolean
}

let state: AppShellState = { installed: false, mode: null, ready: false }
let initialized = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return standalone || iosStandalone
}

function readStoredMode(): AppShellMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'app' || value === 'website' ? value : null
  } catch {
    return null
  }
}

/** Reads the environment once; safe to call from any client component. */
export function initAppShell() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  state = { installed: isStandaloneDisplay(), mode: readStoredMode(), ready: true }
  emit()
}

export function setAppShellMode(mode: AppShellMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // A blocked storage quota should not stop the choice from applying.
  }
  state = { ...state, mode, ready: true }
  emit()
}

export function getAppShellState(): AppShellState {
  return state
}

/** Reads the stored choice and starts listening; shared by every consumer. */
export function useAppShellState(): AppShellState {
  const snapshot = useSyncExternalStore(
    subscribeAppShell,
    getAppShellState,
    getAppShellServerState,
  )
  useEffect(() => {
    initAppShell()
  }, [])
  return snapshot
}

export function subscribeAppShell(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const SERVER_STATE: AppShellState = { installed: false, mode: null, ready: false }

/** Server snapshot: the website layout, with no prompt and no storage read. */
export function getAppShellServerState(): AppShellState {
  return SERVER_STATE
}
