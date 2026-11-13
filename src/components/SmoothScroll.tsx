'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Keeps one Lenis instance alive for the lifetime of the root layout.
 * `respectReducedMotion` is enabled explicitly so Lenis falls back to native
 * scrolling when the visitor asks for reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      allowNestedScroll: true,
      respectReducedMotion: true,
    })

    return () => lenis.destroy()
  }, [])

  return null
}
