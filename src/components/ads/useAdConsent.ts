'use client'

import { useSyncExternalStore } from 'react'
import { getAdConsent, subscribeAdConsent, type AdConsent } from '@/lib/ads-consent'

/**
 * The visitor's ad decision, kept in sync across the loader, the units and the
 * banner. The server always reports "no decision", so the first paint is
 * ad-free and the client fills in the stored choice after hydration.
 */
export function useAdConsent(): AdConsent | null {
  return useSyncExternalStore(subscribeAdConsent, getAdConsent, () => null)
}
