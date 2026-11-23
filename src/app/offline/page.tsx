'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CloudOff, Home, RefreshCw, Wifi } from 'lucide-react'

/**
 * The page the service worker shows when a navigation fails offline.
 *
 * It used to fall back to `/`, which was the last cached copy of a page the
 * visitor had not asked for. This says what happened, notices when the
 * connection comes back, and links to the cached home page if they want it.
 */
export default function OfflinePage() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-accent">
        {online ? <Wifi className="h-6 w-6" aria-hidden="true" /> : <CloudOff className="h-6 w-6" aria-hidden="true" />}
      </span>

      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">Offline</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {online ? 'You are back online' : 'No connection right now'}
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          {online
            ? 'The connection is back. Reload, or head to the home page.'
            : 'This page was not saved on your device. Reconnect and reload — the pages you have already visited still open from the cache.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-inverse shadow-xs transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Reload
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-4 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:border-line-medium hover:text-accent"
        >
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Home
        </Link>
      </div>
    </div>
  )
}
