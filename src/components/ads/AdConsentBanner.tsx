'use client'

import { setAdConsent } from '@/lib/ads-consent'
import { useAdConsent } from '@/components/ads/useAdConsent'

/**
 * Asks once whether ads may load.
 *
 * It appears only while no decision is stored, sits clear of the installed-app
 * tab bar, and both answers are remembered locally. "Ad settings" in the footer
 * clears the answer so the prompt can be revisited.
 */
export default function AdConsentBanner() {
  const consent = useAdConsent()

  if (consent !== null) return null

  return (
    <div
      role="dialog"
      aria-label="Ad consent"
      className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[120] mx-auto max-w-xl rounded-2xl border border-line-medium bg-surface/95 p-4 shadow-xl backdrop-blur md:inset-x-4 md:p-5"
    >
      <p className="text-sm leading-relaxed text-ink">
        This site stays free to read because of advertising. Google AdSense sets
        cookies for the ads; they stay off unless you allow them.
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAdConsent('granted')}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-inverse transition-opacity hover:opacity-90"
        >
          Allow ads
        </button>
        <button
          type="button"
          onClick={() => setAdConsent('denied')}
          className="rounded-full border border-line-subtle px-4 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-line-medium hover:text-ink"
        >
          Continue without ads
        </button>
      </div>
    </div>
  )
}
