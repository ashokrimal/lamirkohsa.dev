'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useDevMode } from '@/contexts/DevModeContext';

interface DevSectionProps {
  pageKey: string;
  sectionId: string;
  label?: string;
  fallbackAccent?: string;
  className?: string;
  children: ReactNode;
}

export default function DevSection({
  pageKey,
  sectionId,
  label,
  fallbackAccent = '#2563eb',
  className = '',
  children,
}: DevSectionProps) {
  const { mode, getAccentColor } = useDevMode();
  const accent = mode === 'dev' ? getAccentColor(pageKey, sectionId, fallbackAccent) : fallbackAccent;

  const style: CSSProperties = {
    '--dev-accent': accent,
  } as CSSProperties;

  const containerClass =
    mode === 'dev'
      ? 'relative rounded-3xl border-2 border-dashed border-[var(--dev-accent)] p-6 transition'
      : '';

  return (
    <section className={`${containerClass} ${className}`} style={style} data-dev-section={sectionId}>
      {mode === 'dev' && (
        <div className="pointer-events-none absolute -top-3 left-6 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200 shadow">
          <span>{label ?? sectionId}</span>
        </div>
      )}
      {children}
    </section>
  );
}
