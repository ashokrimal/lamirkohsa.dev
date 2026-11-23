'use client'

import { useCallback, useEffect, useState } from 'react'
import { Fingerprint, Plus, Trash2 } from 'lucide-react'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'

type RegistrationOptions = Parameters<typeof startRegistration>[0]['optionsJSON']

type PasskeySummary = {
  id: number
  label: string
  deviceType: string
  backedUp: boolean
  createdAt: string
  lastUsedAt: string | null
}

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** A friendly starting name for the device being enrolled. */
function suggestLabel(): string {
  if (typeof navigator === 'undefined') return 'This device'
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android device'
  if (/Macintosh|Mac OS/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows PC'
  if (/Linux/.test(ua)) return 'Linux device'
  return 'This device'
}

/**
 * Enrolling and removing passkeys.
 *
 * A passkey is bound to this site's domain and to the device that created it, so
 * adding a second one for a phone or a laptop is how the owner keeps a spare
 * way in. Removing one never touches the password sign-in.
 */
export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<PasskeySummary[]>([])
  const [configured, setConfigured] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/passkey', {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Could not load your passkeys.')
      const data = (await response.json()) as { passkeys: PasskeySummary[]; configured: boolean }
      setPasskeys(data.passkeys)
      setConfigured(data.configured)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your passkeys.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setSupported(browserSupportsWebAuthn())
    setLabel(suggestLabel())
    void load()
  }, [load])

  const handleAdd = async () => {
    setError(null)
    setNotice(null)

    if (!browserSupportsWebAuthn()) {
      setError('This browser cannot create passkeys. Try a current Safari, Chrome or Edge.')
      return
    }

    setIsBusy(true)
    try {
      const optionsResponse = await fetch('/api/admin/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ step: 'options' }),
      })
      if (!optionsResponse.ok) {
        const data = await optionsResponse.json().catch(() => ({}))
        throw new Error(data.error ?? 'Passkeys are not available.')
      }

      const options = (await optionsResponse.json()) as RegistrationOptions
      const registration = await startRegistration({ optionsJSON: options })

      const verifyResponse = await fetch('/api/admin/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ step: 'verify', response: registration, label }),
      })
      if (!verifyResponse.ok) {
        const data = await verifyResponse.json().catch(() => ({}))
        throw new Error(data.error ?? 'That passkey could not be verified.')
      }

      setNotice('Passkey added. You can now sign in with it instead of a password.')
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        /not allowed|abort|cancel/i.test(message)
          ? 'Adding the passkey was cancelled.'
          : message || 'That passkey could not be added.',
      )
    } finally {
      setIsBusy(false)
    }
  }

  const handleRemove = async (passkey: PasskeySummary) => {
    setError(null)
    setNotice(null)
    setIsBusy(true)
    try {
      const response = await fetch(`/api/admin/passkey?id=${passkey.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'That passkey could not be removed.')
      }
      setNotice(`Removed “${passkey.label}”. The password sign-in still works.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That passkey could not be removed.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-surface">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Fingerprint className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Passkeys and biometrics
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Sign in with the fingerprint, face or device PIN on a device you own. No password or code
          to type, and nothing secret is stored on the server.
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        {!configured && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Set ADMIN_SESSION_SECRET or ADMIN_PASSKEY_SECRET in the deployment before enrolling.
          </p>
        )}

        {!supported && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            This browser has no WebAuthn support. Passkeys can still be managed from a browser that
            does.
          </p>
        )}

        {isLoading ? (
          <p className="text-xs text-slate-500">Loading passkeys…</p>
        ) : passkeys.length === 0 ? (
          <p className="text-xs text-slate-500">
            No passkey yet. Add one below, then the sign-in page offers “Sign in with a passkey”.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {passkeys.map((passkey) => (
              <li key={passkey.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{passkey.label}</p>
                  <p className="text-[11px] text-slate-500">
                    Added {dateTime(passkey.createdAt)}
                    {passkey.lastUsedAt ? ` · last used ${dateTime(passkey.lastUsedAt)}` : ' · never used'}
                    {passkey.backedUp ? ' · synced' : ' · this device only'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(passkey)}
                  disabled={isBusy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs text-slate-600">
            Name this device
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={60}
              placeholder="e.g. MacBook, iPhone"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isBusy || !configured}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isBusy ? 'Waiting for your device…' : 'Add a passkey'}
          </button>
        </div>

        {notice && <p className="text-xs text-emerald-700">{notice}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}

        <p className="text-[11px] leading-relaxed text-slate-500">
          Each passkey is tied to this domain and to the device that created it. Add one per device
          so a lost phone is never the only way in; removing a passkey here takes effect
          immediately.
        </p>
      </div>
    </section>
  )
}
