'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

/**
 * A thin reading-progress line. Lenis scrolls the native document, so Motion's
 * scroll progress stays in sync without a separate scroll listener.
 */
export function ScrollProgress() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  })

  if (reduceMotion) return null

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
      style={{ scaleX }}
    />
  )
}
