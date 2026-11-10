'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Sign-in screen for the admin studio. Credentials are posted to
 * /api/admin/session and verified on the server; nothing is compared here.
 */
export default function AdminSignIn({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16 bg-surface">
      <div className="w-full max-w-sm apple-card p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
            Restricted area
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Admin studio</h1>
          <p className="text-sm text-muted leading-relaxed">
            Sign in with the site owner credentials to manage content.
          </p>
        </div>

        {configured ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs text-muted">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                className="mt-1 w-full rounded-xl border border-line-subtle bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </label>

            <label className="block text-xs text-muted">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-xl border border-line-subtle bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-btn-primary w-full justify-center disabled:opacity-60"
            >
              {isSubmitting ? 'Checking…' : 'Sign in'}
            </button>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            Admin sign-in is not configured on this deployment. Set{' '}
            <code className="font-mono">ADMIN_EMAIL</code>,{' '}
            <code className="font-mono">ADMIN_PASSWORD</code> and{' '}
            <code className="font-mono">ADMIN_SESSION_SECRET</code> to enable it.
          </div>
        )}
      </div>
    </div>
  )
}
