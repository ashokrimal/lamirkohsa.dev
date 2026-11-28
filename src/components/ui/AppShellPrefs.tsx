'use client'

import { Monitor, Smartphone, X } from 'lucide-react'
import { setAppShellMode, useAppShellState, type AppShellMode } from '@/lib/app-shell'
import { sensoryAudio } from '@/lib/sensory-audio'

function choose(mode: AppShellMode) {
  sensoryAudio.playClick()
  setAppShellMode(mode)
}

/**
 * First-run choice inside an installed app: keep the website as it is, or use
 * the app layout with a bottom tab bar. Nothing is shown in a normal browser
 * tab, and nothing is shown again once a choice is stored.
 */
export function AppShellChooser() {
  const state = useAppShellState()
  if (!state.installed || !state.ready || state.mode !== null) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-scrim/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-shell-title"
        className="w-full max-w-md rounded-3xl border border-line-subtle bg-surface p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="app-shell-title" className="text-lg font-semibold tracking-tight text-ink">
              Choose a layout
            </h2>
            <p className="mt-1 text-sm text-muted">
              You can switch any time from the menu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => choose('website')}
            aria-label="Close and keep the website layout"
            className="rounded-full border border-line-subtle p-1.5 text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => choose('app')}
            className="flex items-start gap-3 rounded-2xl border border-line-medium bg-overlay-faint p-4 text-left transition-colors hover:border-accent"
          >
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-ink">App layout</span>
              <span className="mt-0.5 block text-xs text-muted">
                Bottom tab bar on phones and tablets, with the pages one tap apart.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => choose('website')}
            className="flex items-start gap-3 rounded-2xl border border-line-subtle p-4 text-left transition-colors hover:border-line-strong"
          >
            <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-ink">Website layout</span>
              <span className="mt-0.5 block text-xs text-muted">
                The same navigation you see in the browser.
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * The switch inside the mobile menu, so an installed app can move between the
 * two layouts later. Rendered only when the site is running as an installed app.
 */
export function AppShellLayoutToggle() {
  const state = useAppShellState()
  if (!state.installed) return null

  const options: Array<{ mode: AppShellMode; label: string }> = [
    { mode: 'website', label: 'Website' },
    { mode: 'app', label: 'App' },
  ]

  return (
    <div className="mt-4 w-full rounded-2xl border border-line-subtle p-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">Layout</p>
      <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Layout">
        {options.map((option) => {
          const active = (state.mode ?? 'website') === option.mode
          return (
            <button
              key={option.mode}
              type="button"
              onClick={() => choose(option.mode)}
              aria-pressed={active}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'bg-accent text-inverse'
                  : 'border border-line-subtle text-ink hover:border-line-strong'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
