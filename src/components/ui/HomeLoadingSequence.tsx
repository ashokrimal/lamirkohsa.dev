'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Skeleton, SkeletonCard } from '@/components/Skeleton'

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SESSION_KEY = 'ar_home_first_load_done_v1'

function BrandOrbitLoader() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="min-h-[76vh] flex flex-col items-center justify-center px-6 py-16 text-center"
      role="status"
      aria-live="polite"
      aria-label="Loading homepage animation"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Outer hairline orbital ring */}
        <motion.span
          aria-hidden="true"
          initial={reduceMotion ? false : { scale: 0.86, opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0.4 }
              : { scale: [0.92, 1.06, 1], opacity: [0.2, 0.55, 0.35] }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-line-medium"
        />

        {/* Precision SVG arc draw */}
        <svg
          viewBox="0 0 80 80"
          className="h-20 w-20 -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth="1.75"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.25"
            strokeLinecap="round"
            initial={{ pathLength: 0.08, rotate: 0 }}
            animate={
              reduceMotion
                ? { pathLength: 0.85 }
                : { pathLength: [0.15, 0.88, 1], rotate: [0, 120, 260] }
            }
            transition={{ duration: 0.85, ease: EASE_SETTLE }}
            style={{ originX: '40px', originY: '40px' }}
          />
        </svg>

        {/* Center Monogram Mark */}
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE_SETTLE }}
          className="absolute font-mono text-sm font-semibold tracking-[0.2em] text-ink"
        >
          AR
        </motion.span>
      </div>

      {/* Label + hairline progress sweep */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: EASE_SETTLE }}
        className="mt-6 w-48 space-y-2.5"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Preparing workspace
        </p>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-overlay-medium">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0.05 : 0.62, ease: EASE_SETTLE }}
            style={{ transformOrigin: 'left center' }}
            className="h-full w-full rounded-full bg-accent"
          />
        </div>
      </motion.div>
    </div>
  )
}

export function HomeSkeletonView() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.08 : 0.28, ease: EASE_SETTLE }}
      className="page-shell py-8 md:py-12 space-y-14 md:space-y-20"
      aria-label="Loading homepage skeleton"
      aria-busy="true"
    >
      {/* Hero Skeleton matching PageHero */}
      <section className="space-y-5 pt-4 md:pt-8">
        <Skeleton className="h-3 w-28" rounded="full" />
        <div className="space-y-3">
          <Skeleton className="h-11 sm:h-14 w-3/4 max-w-xl" rounded="lg" />
          <Skeleton className="h-11 sm:h-14 w-1/2 max-w-md" rounded="lg" />
        </div>
        <div className="max-w-xl space-y-2 pt-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex flex-wrap gap-2.5 pt-2">
          <Skeleton className="h-7 w-28" rounded="full" />
          <Skeleton className="h-7 w-36" rounded="full" />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Skeleton className="h-10 w-36" rounded="full" />
          <Skeleton className="h-10 w-32" rounded="full" />
        </div>
      </section>

      {/* Section 01: Introduction + Unified Technology Distribution Skeleton */}
      <section className="border-t border-line pt-10 md:pt-12 space-y-10">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" rounded="full" />
            <Skeleton className="h-8 w-52" rounded="lg" />
          </div>
          <Skeleton className="h-4 w-20" rounded="full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 md:gap-10 items-start">
          <Skeleton className="aspect-[4/5] w-full rounded-[24px]" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-4/5" />
            <div className="pt-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-7 w-32" rounded="full" />
              <Skeleton className="h-7 w-28" rounded="full" />
            </div>
          </div>
        </div>

        {/* Unified Tech Distribution Card Skeleton */}
        <div className="apple-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <Skeleton variant="circle" className="h-48 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" rounded="full" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </section>

      {/* Section 02: Featured Projects Skeleton */}
      <section className="border-t border-line pt-10 md:pt-12 space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" rounded="full" />
            <Skeleton className="h-8 w-56" rounded="lg" />
          </div>
          <Skeleton className="h-4 w-20" rounded="full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </motion.div>
  )
}

/**
 * Sequential loader used by Suspense / app/loading.tsx:
 * first shows the animated brand loader, then transitions into the full home skeleton.
 */
export function HomeLoadingSequence() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<'animation' | 'skeleton'>(
    reduceMotion ? 'skeleton' : 'animation',
  )

  useEffect(() => {
    if (reduceMotion) {
      setPhase('skeleton')
      return
    }
    const timer = window.setTimeout(() => {
      setPhase('skeleton')
    }, 620)
    return () => window.clearTimeout(timer)
  }, [reduceMotion])

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phase === 'animation' ? (
        <motion.div
          key="loader-stage-animation"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.24, ease: EASE_SETTLE }}
        >
          <BrandOrbitLoader />
        </motion.div>
      ) : (
        <motion.div key="loader-stage-skeleton">
          <HomeSkeletonView />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * First-visit entrance wrapper for `/` that stages:
 *   1) Proper animated loader (~600ms)
 *   2) Home page skeleton preview (~450ms)
 *   3) Smooth crossfade to hydrated live Home page
 * Leaves SSR HTML intact underneath and runs only on the first home visit per session.
 */
export function HomeEntranceGate({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  const [stage, setStage] = useState<'idle' | 'animation' | 'skeleton' | 'done'>('idle')

  useEffect(() => {
    if (reduceMotion) {
      setStage('done')
      return
    }

    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') {
        setStage('done')
        return
      }
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // sessionStorage unavailable (e.g. private contexts); still run once cleanly on mount
    }

    setStage('animation')

    const toSkeleton = window.setTimeout(() => {
      setStage('skeleton')
    }, 620)

    const toDone = window.setTimeout(() => {
      setStage('done')
    }, 1080)

    return () => {
      window.clearTimeout(toSkeleton)
      window.clearTimeout(toDone)
    }
  }, [reduceMotion])

  return (
    <>
      {children}
      <AnimatePresence>
        {(stage === 'animation' || stage === 'skeleton') && (
          <motion.div
            key="home-first-load-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: EASE_SETTLE }}
            className="fixed inset-0 z-50 overflow-y-auto bg-paper"
            aria-hidden="true"
          >
            <AnimatePresence mode="wait">
              {stage === 'animation' ? (
                <motion.div
                  key="gate-animation"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: EASE_SETTLE }}
                >
                  <BrandOrbitLoader />
                </motion.div>
              ) : (
                <motion.div key="gate-skeleton">
                  <HomeSkeletonView />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
