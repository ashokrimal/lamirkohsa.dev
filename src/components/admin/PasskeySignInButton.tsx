'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fingerprint } from 'lucide-react'
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser'

type AuthenticationOptions = Parameters<typeof startAuthentication>[0]['optionsJSON']

/**
 * Sign in with a passkey instead of the password.
 *
 * The fingerprint, face or device PIN check happens in the browser; the server
 * only sees a signed assertion and checks it against the stored public key. The
 * button is only rendered when the owner has enrolled at least one passkey.
 */
export default function PasskeySignInButton({ returnTo = '/admin' }: { returnTo?: string }) {
  const router = useRouter()
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setError(null)

    if (!browserSupportsWebAuthn()) {
      setError('This browser cannot use passkeys. Sign in with your password instead.')
      return
    }

    setIsBusy(true)
    try {
      const optionsResponse = await fetch('/api/admin/passkey/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ step: 'options' }),
      })
      if (!optionsResponse.ok) {
        const data = await optionsResponse.json().catch(() => ({}))
        throw new Error(data.error ?? 'Passkey sign-in is not available.')
      }

      const options = (await optionsResponse.json()) as AuthenticationOptions
      const assertion = await startAuthentication({ optionsJSON: options })

      const verifyResponse = await fetch('/api/admin/passkey/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ step: 'verify', response: assertion }),
      })
      if (!verifyResponse.ok) {
        const data = await verifyResponse.json().catch(() => ({}))
        throw new Error(data.error ?? 'That passkey could not be verified.')
      }

      router.replace(returnTo)
      router.refresh()
    } catch (err) {
      // A cancelled prompt is normal: only surface a message when the browser
      // did not simply dismiss the sheet.
      const message = err instanceof Error ? err.message : ''
      setError(
        /not allowed|abort|cancel/i.test(message)
          ? 'Passkey sign-in was cancelled.'
          : message || 'Passkey sign-in failed.',
      )
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line-subtle" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">or</span>
        <span className="h-px flex-1 bg-line-subtle" />
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line-subtle bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-overlay-faint disabled:opacity-60"
      >
        <Fingerprint className="h-4 w-4 text-accent" aria-hidden="true" />
        {isBusy ? 'Waiting for your device…' : 'Sign in with a passkey'}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-muted">
        Uses the fingerprint, face or PIN already set up on your device.
      </p>

      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
