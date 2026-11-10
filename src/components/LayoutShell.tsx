'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import { DevModeProvider } from '@/contexts/DevModeContext';
import DevConsoleHUD from '@/components/devmode/DevConsoleHUD';
import DevModeTrigger from '@/components/devmode/DevModeTrigger';
import OfflineFlappy from '@/components/OfflineFlappy';
import CmsShell from '@/components/CmsShell';
import type { SiteConfig } from '@/lib/site-content';

interface LayoutShellProps {
  children: ReactNode;
  site: SiteConfig;
  isCmsHost?: boolean;
}

export default function LayoutShell({ children, site, isCmsHost = false }: LayoutShellProps) {
  const isCmsRoute = usePathname().startsWith('/admin')
  const showCmsShell = isCmsHost || isCmsRoute
  return (
    <DevModeProvider>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          {showCmsShell ? (
            <CmsShell>{children}</CmsShell>
          ) : (
            <>
              <SiteHeader brand={site.brand} navigation={site.navigation} contact={site.contact} />
              {/* Pages own their own <main> landmark; wrapping them in another nested one. */}
              <div className="min-h-screen">{children}</div>
              <SiteFooter
                brand={site.brand}
                navigation={site.navigation}
                footer={site.footer}
                contact={site.contact}
              />
            </>
          )}
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
