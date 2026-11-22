'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Shows "Install app" only when the browser offers an install prompt and the
 * site is not already running as an installed app.
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) {
      setInstalled(true)
      return
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !prompt) return null

  const install = async () => {
    sensoryAudio.playClick()
    try {
      await prompt.prompt()
      await prompt.userChoice
      setPrompt(null)
    } catch {
      setPrompt(null)
    }
  }

  return (
    <button
      type="button"
      onClick={install}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-3 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:border-accent hover:text-ink ${className}`}
    >
      <Download className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      <span>Install app</span>
    </button>
  )
}
