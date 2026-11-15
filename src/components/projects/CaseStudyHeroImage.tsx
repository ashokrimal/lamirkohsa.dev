'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

interface CaseStudyHeroImageProps {
  src: string
  alt: string
}

/**
 * Scroll-linked parallax frame for the primary Case Study hero visual.
 * Uses compositor-only transforms inside an overscanned 16:9 viewport
 * so vertical travel never exposes container edges, and falls back cleanly
 * to a static frame when prefers-reduced-motion is active.
 */
export function CaseStudyHeroImage({ src, alt }: CaseStudyHeroImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.45,
  })

  const y = useTransform(smoothProgress, [0, 1], ['-5%', '5%'])
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.05, 1.02, 1.0])

  return (
    <div ref={containerRef} className="mt-10 md:mt-12 apple-card overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-overlay-faint">
        {reduceMotion ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            referrerPolicy="no-referrer"
            className="object-cover"
            priority
          />
        ) : (
          <motion.div
            style={{ y, scale }}
            className="absolute inset-x-0 -inset-y-[8%] will-change-transform"
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              referrerPolicy="no-referrer"
              className="object-cover"
              priority
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
