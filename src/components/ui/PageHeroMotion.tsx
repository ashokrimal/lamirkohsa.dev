'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const HERO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface PageHeroMotionProps {
  eyebrow: string
  krEyebrow?: string
  title: string
  accent?: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
}

/**
 * Staged mount entrance for every page hero header. Animates only compositor
 * properties (`opacity` and `translateY`) and bypasses motion immediately when
 * the visitor prefers reduced motion.
 */
export function PageHeroMotion({
  eyebrow,
  krEyebrow,
  title,
  accent,
  description,
  meta,
  actions,
}: PageHeroMotionProps) {
  const reduceMotion = useReducedMotion()

  const stageTransition = (delay: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.52, delay, ease: HERO_EASE }

  const initialOffset = reduceMotion ? false : { opacity: 0, y: 12 }
  const visibleState = { opacity: 1, y: 0 }

  return (
    <header className="border-b border-line pb-10 md:pb-14">
      <div className="max-w-3xl space-y-3">
        {(eyebrow || krEyebrow) && (
          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial={initialOffset}
            animate={visibleState}
            transition={stageTransition(0)}
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
              {eyebrow}
            </span>
            {krEyebrow && (
              <span lang="ko" className="font-korean text-[11px] text-muted">
                · {krEyebrow}
              </span>
            )}
          </motion.div>
        )}

        <motion.h1
          className="text-4xl md:text-6xl font-semibold tracking-[-0.05em] leading-[0.98] text-ink"
          initial={initialOffset}
          animate={visibleState}
          transition={stageTransition(0.07)}
        >
          {title} {accent && <span className="text-accent">{accent}</span>}
        </motion.h1>

        {description && (
          <motion.p
            className="max-w-2xl text-sm md:text-base text-muted leading-relaxed"
            initial={initialOffset}
            animate={visibleState}
            transition={stageTransition(0.14)}
          >
            {description}
          </motion.p>
        )}

        {meta && (
          <motion.div
            className="flex flex-wrap items-center gap-2 pt-2"
            initial={initialOffset}
            animate={visibleState}
            transition={stageTransition(0.2)}
          >
            {meta}
          </motion.div>
        )}

        {actions && (
          <motion.div
            className="flex flex-wrap items-center gap-3 pt-2"
            initial={initialOffset}
            animate={visibleState}
            transition={stageTransition(0.26)}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </header>
  )
}
