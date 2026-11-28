'use client';

import type { ReactNode } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { DevModeProvider } from '@/contexts/DevModeContext';
import DevConsoleHUD from '@/components/devmode/DevConsoleHUD';
import DevModeTrigger from '@/components/devmode/DevModeTrigger';
import OfflineFlappy from '@/components/OfflineFlappy';
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration';
import Preloader from '@/components/ui/Preloader';
import { SubpageBar } from '@/components/ui/SubpageBar';
import type { SiteConfig } from '@/lib/site-content';

interface LayoutShellProps {
  children: ReactNode;
  site: SiteConfig;
  /** Studio-managed footer socials; empty falls back to the CMS navigation. */
  footerSocialLinks?: Array<{
    id: string;
    platform: string;
    label: string;
    url: string;
    is_visible: boolean;
    sort_order: number;
  }>;
  footerContactEmail?: string;
  footerAvailability?: string;
}

export default function LayoutShell({
  children,
  site,
  footerSocialLinks,
  footerContactEmail,
  footerAvailability,
}: LayoutShellProps) {
  return (
    <DevModeProvider>
      <ErrorBoundary>
        {/*
          No Suspense boundary here on purpose. A boundary begins the streamed
          response, which commits a 200 before the page can 404 or redirect; the
          per-route loading.tsx files cover the sections that want a skeleton.
        */}
        <>
          <>
            {/* One first-visit curtain per session, public routes only. The
                preloader records the visit, so client-side navigations do not
                replay it. */}
            <Preloader
              brandName={site.brand.name || 'lamirkohsa'}
              studioLabel={site.brand.domain || 'ashokrimal.com.np'}
            />
            <SiteHeader brand={site.brand} navigation={site.navigation} contact={site.contact} />
            {/* On a nested page the hero publishes its title here; the strip
                pins under the navbar once the hero scrolls away. */}
            <SubpageBar />
            {/* Pages own their own <main> landmark; wrapping them in another nested one. */}
            <div className="min-h-screen">{children}</div>
            <SiteFooter
              brand={site.brand}
              navigation={site.navigation}
              footer={site.footer}
              contact={site.contact}
              socialLinks={footerSocialLinks}
              contactEmail={footerContactEmail}
              availabilityStatus={footerAvailability}
            />
          </>
          <div className="fixed bottom-6 right-6 z-40">
            <DevModeTrigger />
          </div>
          <DevConsoleHUD />
          <OfflineFlappy />
          <ServiceWorkerRegistration />
        </>
      </ErrorBoundary>
    </DevModeProvider>
  );
}
