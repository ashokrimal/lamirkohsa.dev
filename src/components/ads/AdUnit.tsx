'use client'

import { useEffect, useRef, useState } from 'react'
import { ADSENSE_CLIENT, ADSENSE_SLOT } from '@/lib/adsense'
import { useAdConsent } from '@/components/ads/useAdConsent'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/** How long a unit may sit unfilled before it is treated as empty. */
const FILL_TIMEOUT_MS = 6000

/**
 * One responsive AdSense display unit.
 *
 * AdSense reports the outcome on the `<ins>` element through `data-ad-status`.
 * The frame stays in the flow while the request is pending (with a small height
 * so the page does not jump if it fills) and disappears entirely when the unit
 * comes back unfilled, blocked, or never answers — an ad-free page with no gap
 * is better than an empty grey box. Before consent, or without a slot, nothing
 * renders and nothing is requested.
 */
export default function AdUnit({
  className = '',
  format = 'auto',
}: {
  className?: string
  /** AdSense ad format for this placement; `auto` is responsive. */
  format?: 'auto' | 'fluid' | 'rectangle'
}) {
  const consent = useAdConsent()
  const container = useRef<HTMLDivElement>(null)
  const requested = useRef(false)
  const [status, setStatus] = useState<'pending' | 'filled' | 'empty'>('pending')
  const enabled = consent === 'granted' && ADSENSE_SLOT.length > 0

  useEffect(() => {
    if (!enabled) return
    const unit = container.current?.querySelector<HTMLElement>('.adsbygoogle')
    if (!unit) return

    if (!requested.current && !unit.dataset.adsbygoogleStatus) {
      requested.current = true
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.warn('[ads] Could not request an ad:', (error as Error).message)
        setStatus('empty')
        return
      }
    }

    const read = () => {
      const value = unit.dataset.adStatus
      if (value === 'filled') setStatus('filled')
      else if (value === 'unfilled') setStatus('empty')
    }
    read()

    const observer = new MutationObserver(read)
    observer.observe(unit, { attributes: true, attributeFilter: ['data-ad-status'] })
    // A blocked loader never reports a status, so a unit that is still pending
    // after the timeout collapses instead of holding an empty box open.
    const timer = window.setTimeout(
      () => setStatus((current) => (current === 'pending' ? 'empty' : current)),
      FILL_TIMEOUT_MS,
    )

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [enabled])

  if (!enabled || status === 'empty') return null

  return (
    <aside
      ref={container}
      className={`${status === 'pending' ? 'min-h-[120px]' : ''} ${className}`}
      aria-label="Advertisement"
      data-ad-state={status}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
        Advertisement
      </span>
      <ins
        className="adsbygoogle mt-2 block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  )
}
