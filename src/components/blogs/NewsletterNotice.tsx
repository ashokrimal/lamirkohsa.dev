'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

/**
 * Shows the outcome of a one-click unsubscribe.
 *
 * `/api/newsletter/unsubscribe` redirects to the journal with
 * `?newsletter=unsubscribed` or `?newsletter=invalid`. Reading that on the
 * client keeps the journal index statically rendered, so the notice costs no
 * extra database work and appears for anyone arriving from an email client.
 */
export default function NewsletterNotice() {
  const uiStrings = useUiStrings()
  const state = useSearchParams().get('newsletter')

  if (state !== 'unsubscribed' && state !== 'invalid') return null

  const unsubscribed = state === 'unsubscribed'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs ${
        unsubscribed
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300'
      }`}
    >
      {unsubscribed ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <p className="leading-relaxed">
        {unsubscribed
          ? uiStrings.journal.newsletterUnsubscribed.en
          : uiStrings.journal.newsletterUnsubscribeInvalid.en}
      </p>
    </div>
  )
}
