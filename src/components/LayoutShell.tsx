'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
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
  const pathname = usePathname()
  const isCmsRoute = pathname.startsWith('/admin')
  const isAdminSignIn = pathname.startsWith('/admin/sign-in')
  const isImmersive = pathname === '/' || pathname.startsWith('/immersive')
  // The CMS host is read after mount so the shared layout stays free of request
  // headers and the public pages can be cached and revalidated.
  const [isCmsHostname, setIsCmsHostname] = useState(false)
  useEffect(() => {
    setIsCmsHostname(window.location.hostname === 'cms.ashokrimal.com.np')
  }, [])
  const showCmsShell = (isCmsHost || isCmsHostname || isCmsRoute) && !isAdminSignIn
  return (
    <DevModeProvider>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          {showCmsShell ? (
            <CmsShell>{children}</CmsShell>
          ) : isImmersive ? (
            <div className="min-h-screen">{children}</div>
          ) : isAdminSignIn ? (
            <div className="min-h-screen">{children}</div>
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
