'use client';

import { Suspense, type ReactNode } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import { DevModeProvider } from '@/contexts/DevModeContext';
import DevConsoleHUD from '@/components/devmode/DevConsoleHUD';
import DevModeTrigger from '@/components/devmode/DevModeTrigger';
import OfflineFlappy from '@/components/OfflineFlappy';

interface LayoutShellProps {
  children: ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  return (
    <DevModeProvider>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <div className="fixed bottom-6 right-6 z-40">
            <DevModeTrigger />
          </div>
          <DevConsoleHUD />
          <OfflineFlappy />
        </Suspense>
      </ErrorBoundary>
    </DevModeProvider>
  );
}
