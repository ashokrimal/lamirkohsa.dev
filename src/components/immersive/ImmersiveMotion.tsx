'use client';

import { useRef, type ReactNode } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

export const IMMERSIVE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ImmersiveMotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Smooth entrance for fixed HUD/navigation elements on page load.
 * Collapses to static placement when reduced motion is preferred.
 */
export function ImmersiveChromeReveal({
  children,
  className,
  direction = 'down',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'down' | 'up' | 'left' | 'none';
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset =
    direction === 'down'
      ? { y: -14, x: 0 }
      : direction === 'up'
        ? { y: 14, x: 0 }
        : direction === 'left'
          ? { y: 0, x: 16 }
          : { y: 0, x: 0 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.65, delay, ease: IMMERSIVE_EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Cross-fades and gently slides the active chapter number / label in the HUD rail.
 */
export function ImmersiveChapterHUDText({
  valueKey,
  children,
  className,
}: {
  valueKey: string | number;
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={valueKey}
        className={className}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.24, ease: IMMERSIVE_EASE }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * Choreographs entry animations across a chapter or grid.
 * Uses immediate mount animation for the Hero ('mount') and viewport-triggered
 * scroll reveal ('inView') for downstream chapters.
 */
export function ImmersiveChapterSequence({
  children,
  className,
  mode = 'inView',
  stagger = 0.08,
  delay = 0.04,
}: {
  children: ReactNode;
  className?: string;
  mode?: 'mount' | 'inView';
  stagger?: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  if (mode === 'mount') {
    return (
      <motion.div className={className} initial="hidden" animate="visible" variants={variants}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual staggered child block inside ImmersiveChapterSequence.
 * Animates only compositor properties (opacity, transform).
 */
export function ImmersiveRevealItem({
  children,
  className,
  distance = 22,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  as?: 'div' | 'article' | 'footer';
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: IMMERSIVE_EASE,
      },
    },
  };

  if (as === 'article') {
    return (
      <motion.article className={className} variants={variants}>
        {children}
      </motion.article>
    );
  }

  if (as === 'footer') {
    return (
      <motion.footer className={className} variants={variants}>
        {children}
      </motion.footer>
    );
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/**
 * Subtle scroll-linked vertical depth transition for non-sticky chapters,
 * keeping content glide synchronized with the 3D camera sweep between sections.
 */
export function ImmersiveScrollGlide({
  children,
  className,
  range = 24,
}: {
  children: ReactNode;
  className?: string;
  range?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.45,
  });

  const y = useTransform(smoothProgress, [0, 0.5, 1], [range, 0, -range * 0.65]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
