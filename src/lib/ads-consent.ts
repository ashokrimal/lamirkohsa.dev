/**
 * Ad consent for the AdSense placements.
 *
 * AdSense sets advertising cookies, so the loader and the units stay off until
 * the visitor allows ads. The choice lives in localStorage — no account and no
 * server round-trip — and changes are broadcast so every mounted unit reacts to
 * the same decision. Leaving the banner unanswered keeps the page ad-free.
 */
export type AdConsent = 'granted' | 'denied'

export const AD_CONSENT_KEY = 'ads_consent'

const CHANGE_EVENT = 'ads-consent-change'

/** The stored choice, or `null` when the visitor has not decided yet. */
export function getAdConsent(): AdConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(AD_CONSENT_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

/** Store a decision; `null` clears it so the banner asks again. */
export function setAdConsent(value: AdConsent | null): void {
  if (typeof window === 'undefined') return
  try {
    if (value) window.localStorage.setItem(AD_CONSENT_KEY, value)
    else window.localStorage.removeItem(AD_CONSENT_KEY)
  } catch {
    return
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Subscribe to this tab's changes and to another tab's decision. */
export function subscribeAdConsent(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
