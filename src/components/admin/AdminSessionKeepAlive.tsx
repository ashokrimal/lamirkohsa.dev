'use client'

import { useEffect } from 'react'

/**
 * Keeps a remembered studio session alive without a redirect loop.
 *
 * The session cookie is HttpOnly, so only the server can renew it: this asks
 * `/api/admin/session` once per studio page load, and the route answers with a
 * fresh seven-day window when the current session is a remembered one. A 401
 * means the session already ended, and the page guard is the thing that sends
 * the owner to sign-in, not this request.
 */
export default function AdminSessionKeepAlive() {
  useEffect(() => {
    let cancelled = false

    const refresh = () => {
      // `cache: 'no-store'` because a cached 401 would look like a sign-out.
      fetch('/api/admin/session', { credentials: 'same-origin', cache: 'no-store' }).catch(() => {
        // Offline or blocked: the current cookie still decides access.
      })
    }

    if (!cancelled) refresh()

    // Coming back to a tab after a while is the moment a sliding session matters.
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return null
}
