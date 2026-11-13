'use client'

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react'

export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'portfolio_theme'
const COOKIE_NAME = 'portfolio_theme'
const THEME_TRANSITION_MS = 650
let themeTransitionTimer: ReturnType<typeof setTimeout> | undefined

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDocument(resolved: ResolvedTheme, storedTheme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
  root.setAttribute('data-theme', resolved)
  root.setAttribute('data-theme-setting', storedTheme)
  root.style.colorScheme = resolved
}

/**
 * Cross-fade colour changes instead of swapping the page in one frame. The
 * transition class is applied before the theme flips and removed afterwards so
 * it never interferes with hover or scroll animations during normal use.
 */
function applyThemeWithTransition(apply: () => void) {
  if (typeof document === 'undefined') {
    apply()
    return
  }

  const root = document.documentElement
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    apply()
    return
  }

  root.classList.add('theme-transitioning')
  // Force a style read so the starting colours are committed before the swap.
  void root.offsetWidth
  apply()

  if (themeTransitionTimer) clearTimeout(themeTransitionTimer)
  themeTransitionTimer = setTimeout(() => {
    root.classList.remove('theme-transitioning')
    themeTransitionTimer = undefined
  }, THEME_TRANSITION_MS + 50)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [, startTransition] = useTransition()

  // On mount: initialize from localStorage or system
  useEffect(() => {
    let initial: Theme = 'system'
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        initial = stored
      }
    } catch {}

    const system = getSystemTheme()
    const resolved = initial === 'system' ? system : initial

    setThemeState(initial)
    setResolvedTheme(resolved)
    applyThemeToDocument(resolved, initial)
  }, [])

  // Listen to system changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light'
        startTransition(() => {
          setResolvedTheme(nextResolved)
          applyThemeWithTransition(() => applyThemeToDocument(nextResolved, 'system'))
        })
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
      document.cookie = `${COOKIE_NAME}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`
    } catch {}

    const nextResolved = nextTheme === 'system' ? getSystemTheme() : nextTheme
    setResolvedTheme(nextResolved)
    applyThemeWithTransition(() => applyThemeToDocument(nextResolved, nextTheme))
  }

  const toggleTheme = () => {
    // Cycles between light and dark; if system, moves to the opposite of current resolved
    const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
