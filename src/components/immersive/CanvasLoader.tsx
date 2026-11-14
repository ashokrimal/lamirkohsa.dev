'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * Reads Drei's real loader store. With no external GLB present the store is
 * idle, so the overlay clears after a short boot sequence instead of sticking.
 */
export function CanvasLoader() {
  const { active, progress } = useProgress();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumElapsed(true), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minimumElapsed || active) return;
    const timer = window.setTimeout(() => setVisible(false), 320);
    return () => window.clearTimeout(timer);
  }, [active, minimumElapsed]);

  if (!visible) return null;

  return (
    <div className="immersive-loader" role="status" aria-live="polite">
      <div className="immersive-loader-row">
        <span>INITIALIZING / WEBGL EXPERIENCE</span>
        <strong>{active ? `${Math.round(progress)}%` : 'STANDBY'}</strong>
      </div>
      <div className="immersive-loader-track">
        <span style={{ width: `${Math.max(active ? progress : 8, 8)}%` }} />
      </div>
      <small>ASHOK RIMAL — IMMERSIVE PORTFOLIO</small>
    </div>
  );
}
