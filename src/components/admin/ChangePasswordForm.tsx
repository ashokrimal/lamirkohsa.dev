'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { changeOwnerPassword } from '@/app/actions/admin-auth'

const inputClassName =
  'mt-1 w-full rounded-xl border border-line-subtle bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none'

/** Lets the signed-in owner rotate the studio password without a redeploy. */
export default function ChangePasswordForm() {
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setMessage(null)
    setIsSubmitting(true)

    try {
      const result = await changeOwnerPassword(new FormData(form))
      if (!result.ok) {
        setMessage({ tone: 'error', text: result.error })
        return
      }
      form.reset()
      setMessage({ tone: 'success', text: 'Password changed. Use the new one next time you sign in.' })
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'The password could not be changed.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <label className="block text-xs text-muted">
        Current password
        <input type="password" name="currentPassword" autoComplete="current-password" required className={inputClassName} />
      </label>

      <label className="block text-xs text-muted">
        New password
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          minLength={10}
          required
          className={inputClassName}
        />
      </label>

      <label className="block text-xs text-muted">
        Confirm new password
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={10}
          required
          className={inputClassName}
        />
      </label>

      <button type="submit" disabled={isSubmitting} className="apple-btn-primary disabled:opacity-60">
        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
        {isSubmitting ? 'Saving…' : 'Change password'}
      </button>

      {message && (
        <p
          role="status"
          className={`text-xs ${message.tone === 'success' ? 'text-emerald-700' : 'text-red-600'}`}
        >
          {message.text}
        </p>
      )}
    </form>
  )
}
