'use client';

import { ReactNode, useEffect, useState } from 'react';
import { SkeletonPage } from '@/components/Skeleton';

export default function SkeletonReveal({ children, variant = 'page' }: { children: ReactNode; variant?: 'page' | 'home' | 'cards' }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 380); return () => window.clearTimeout(timer); }, []);
  return ready ? <>{children}</> : <SkeletonPage variant={variant} />;
}
