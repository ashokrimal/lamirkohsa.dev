'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

const EASE_APPLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Hairline scroll progress indicator along the bottom edge of the fixed navbar.
 * Uses GPU-only scaleX transform and hides when reduced motion is preferred.
 */
export function HomeScrollProgressBar() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  })

  if (reduceMotion) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-[56px] inset-x-0 z-40 h-[1.5px] origin-left bg-accent/65 pointer-events-none"
    />
  )
}

/**
 * Subtle scroll-linked 3D depth parallax for the hero visual/snapshot panel.
 * Hero text remains immediately visible; the media/card gains understated spatial depth.
 */
export function HomeHeroParallax({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 26,
    mass: 0.5,
  })

  const y = useTransform(smoothProgress, [0, 1], [0, 26])
  const rotateX = useTransform(smoothProgress, [0, 1], [0, -2.5])
  const scale = useTransform(smoothProgress, [0, 1], [1, 0.985])

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={containerRef} style={{ perspective: 1100 }} className={className}>
      <motion.div
        style={{ y, rotateX, scale, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.08, ease: EASE_APPLE }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * Scroll-linked 3D perspective section reveal.
 * Applies subtle vertical depth + slight 3D pitch settling as the band enters
 * the viewport, using compositor-only transform and opacity properties.
 */
export function HomeDepthSection({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 0.45'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.45,
  })

  const y = useTransform(smoothProgress, [0, 1], [22, 0])
  const rotateX = useTransform(smoothProgress, [0, 1], [2.2, 0])
  const scale = useTransform(smoothProgress, [0, 1], [0.988, 1])

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={sectionRef} style={{ perspective: 1200 }} className={className}>
      <motion.div
        style={{ y, rotateX, scale, transformOrigin: 'center top' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.5, ease: EASE_APPLE }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * Staggered container for grid cards and index items with viewport entry trigger.
 */
export function HomeStaggerGrid({
  children,
  className = '',
  staggerDelay = 0.07,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{ perspective: 1100 }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual staggered item inside HomeStaggerGrid with subtle 3D pitch settle.
 */
export function HomeStaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18, rotateX: 3 },
        visible: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: {
            duration: 0.52,
            ease: EASE_APPLE,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
