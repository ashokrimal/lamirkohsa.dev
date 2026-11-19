'use client'

import React, { createContext, useCallback, useContext, useEffect, useState, useTransition } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'
export type ThemeOrigin = { x: number; y: number }

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme, origin?: ThemeOrigin) => void
  toggleTheme: (origin?: ThemeOrigin) => void
}

interface ViewTransition {
  ready: Promise<void>
  finished: Promise<void>
  skipTransition?: () => void
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'portfolio_theme'
const COOKIE_NAME = 'portfolio_theme'
const THEME_TRANSITION_MS = 480
const THEME_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [fallbackVeil, setFallbackVeil] = useState<{ id: number; from: ResolvedTheme } | null>(null)
  const [, startTransition] = useTransition()
  const reduceMotion = useReducedMotion()

  const runThemeCrossFade = useCallback(
    (
      previousResolved: ResolvedTheme,
      nextResolved: ResolvedTheme,
      commitReactState: () => void,
      commitDocument: () => void,
    ) => {
      if (typeof document === 'undefined') {
        commitReactState()
        return
      }

      const prefersReduced =
        Boolean(reduceMotion) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReduced || previousResolved === nextResolved) {
        commitReactState()
        commitDocument()
        return
      }

      const root = document.documentElement
      const viewDocument = document as ViewTransitionDocument

      if (typeof viewDocument.startViewTransition === 'function') {
        try {
          const transition = viewDocument.startViewTransition(() => {
            flushSync(() => {
              commitReactState()
            })
            commitDocument()
          })

          transition.ready
            .then(() => {
              root.animate(
                { opacity: [0, 1] },
                {
                  duration: THEME_TRANSITION_MS,
                  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  fill: 'both',
                  pseudoElement: '::view-transition-new(root)',
                } as KeyframeAnimationOptions,
              )
            })
            .catch(() => {})

          transition.finished.catch(() => {})
          return
        } catch {
          // Fall through to Framer Motion + CSS cross-fade when View Transitions fails.
        }
      }

      root.classList.add('theme-transitioning')
      void root.offsetWidth
      commitReactState()
      commitDocument()
      setFallbackVeil({ id: Date.now(), from: previousResolved })

      if (themeTransitionTimer) clearTimeout(themeTransitionTimer)
      themeTransitionTimer = setTimeout(() => {
        root.classList.remove('theme-transitioning')
        themeTransitionTimer = undefined
      }, THEME_TRANSITION_MS + 60)
    },
    [reduceMotion],
  )

  // On mount: initialize from localStorage or system without initial flash
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
          runThemeCrossFade(
            resolvedTheme,
            nextResolved,
            () => setResolvedTheme(nextResolved),
            () => applyThemeToDocument(nextResolved, 'system'),
          )
        })
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [theme, resolvedTheme, runThemeCrossFade])

  const setTheme = (nextTheme: Theme, _origin?: ThemeOrigin) => {
    void _origin
    try {
      if (nextTheme === 'system') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, nextTheme)
      }
      document.cookie = `${COOKIE_NAME}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`
    } catch {}

    const nextResolved = nextTheme === 'system' ? getSystemTheme() : nextTheme
    runThemeCrossFade(
      resolvedTheme,
      nextResolved,
      () => {
        setThemeState(nextTheme)
        setResolvedTheme(nextResolved)
      },
      () => applyThemeToDocument(nextResolved, nextTheme),
    )
  }

  const toggleTheme = (origin?: ThemeOrigin) => {
    // Flip between light and dark; if returning to the device's current theme, resume Auto ('system') mode.
    const targetResolved: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    const next: Theme = targetResolved === getSystemTheme() ? 'system' : targetResolved
    setTheme(next, origin)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
      <AnimatePresence>
        {fallbackVeil && (
          <motion.div
            key={fallbackVeil.id}
            aria-hidden="true"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: THEME_TRANSITION_MS / 1000, ease: THEME_EASE }}
            onAnimationComplete={() => setFallbackVeil(null)}
            className={`fixed inset-0 z-[9999] pointer-events-none ${
              fallbackVeil.from === 'dark' ? 'bg-[#161618]' : 'bg-[#f4f1eb]'
            }`}
          />
        )}
      </AnimatePresence>
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
