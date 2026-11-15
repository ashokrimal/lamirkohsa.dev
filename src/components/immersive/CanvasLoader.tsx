'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { IMMERSIVE_EASE } from './ImmersiveMotion';

/**
 * Reads Drei's real loader store. With no external GLB present the store is
 * idle, so the overlay clears with a smooth Framer Motion crossfade instead of snapping.
 */
export function CanvasLoader() {
  const { active, progress } = useProgress();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const delay = reduceMotion ? 220 : 850;
    const timer = window.setTimeout(() => setMinimumElapsed(true), delay);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  useEffect(() => {
    if (!minimumElapsed || active) return;
    const delay = reduceMotion ? 80 : 320;
    const timer = window.setTimeout(() => setVisible(false), delay);
    return () => window.clearTimeout(timer);
  }, [active, minimumElapsed, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="immersive-loader"
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: reduceMotion ? 0.12 : 0.55,
              ease: IMMERSIVE_EASE,
            },
          }}
        >
          <div className="immersive-loader-row">
            <span>INITIALIZING / WEBGL EXPERIENCE</span>
            <strong>{active ? `${Math.round(progress)}%` : 'STANDBY'}</strong>
          </div>
          <div className="immersive-loader-track">
            <span style={{ width: `${Math.max(active ? progress : 8, 8)}%` }} />
          </div>
          <small>ASHOK RIMAL — IMMERSIVE PORTFOLIO</small>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
