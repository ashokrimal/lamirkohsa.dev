'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

/**
 * Keeps one Lenis instance alive for the lifetime of the root layout.
 * `respectReducedMotion` is enabled explicitly so Lenis falls back to native
 * scrolling when the visitor asks for reduced motion. The immersive homepage
 * (and its /immersive alias) owns its scroll-linked camera with GSAP, so it
 * opts out of Lenis.
 */
export function SmoothScroll() {
  const pathname = usePathname()
  const disabled = pathname === '/' || pathname.startsWith('/immersive')

  useEffect(() => {
    if (disabled) return

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      allowNestedScroll: true,
      respectReducedMotion: true,
    })

    return () => lenis.destroy()
  }, [disabled])

  return null
}
