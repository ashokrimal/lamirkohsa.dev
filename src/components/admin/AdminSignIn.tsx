'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { setupOwnerAccount } from '@/app/actions/admin-auth'

/**
 * Sign-in and one-time setup for the admin studio. Credentials are posted to the
 * server; nothing is compared in the browser. The setup form only appears while
 * no owner exists, and disappears for good once the account is created.
 */
export default function AdminSignIn({ configured, returnTo = '/admin' }: { configured: boolean; returnTo?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Invalid credentials.')
      }

      setPassword('')
      router.replace(returnTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await setupOwnerAccount(new FormData(event.currentTarget))
      if (!result.ok) throw new Error(result.error)
      setPassword('')
      setConfirmPassword('')
      router.replace(returnTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The owner account could not be created.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName =
    'mt-1 w-full rounded-xl border border-line-subtle bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none'

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16 bg-surface">
      <div className="w-full max-w-sm apple-card p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Owner access</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {configured ? 'Sign in to the studio' : 'Create the owner account'}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            {configured
              ? 'Only the site owner can manage content. Sign in to continue.'
              : 'No owner exists on this deployment yet. Create it once here; afterwards this form is replaced by sign-in.'}
          </p>
        </div>

        {configured ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <label className="block text-xs text-muted">
              Email
              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                className={inputClassName}
              />
            </label>

            <label className="block text-xs text-muted">
              Password
              <input
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className={inputClassName}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-btn-primary w-full justify-center disabled:opacity-60"
            >
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              {isSubmitting ? 'Checking…' : 'Sign in'}
            </button>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-line-subtle bg-overlay-faint p-3 text-[11px] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span>
                The password is stored only as a salted hash. This form works once; after that, change the
                password from Account inside the studio.
              </span>
            </div>

            <label className="block text-xs text-muted">
              Email
              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                className={inputClassName}
              />
            </label>

            <label className="block text-xs text-muted">
              Password
              <input
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={10}
                required
                className={inputClassName}
              />
            </label>

            <label className="block text-xs text-muted">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={10}
                required
                className={inputClassName}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-btn-primary w-full justify-center disabled:opacity-60"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {isSubmitting ? 'Creating…' : 'Create owner account'}
            </button>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
