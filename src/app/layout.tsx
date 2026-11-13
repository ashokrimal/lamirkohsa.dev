import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import 'lenis/dist/lenis.css';
import LayoutShell from '@/components/LayoutShell';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SmoothScroll } from '@/components/SmoothScroll';
import { EMPTY_SITE_CONFIG, getSiteConfig } from '@/lib/site-content';
import { SITE_NAME, SITE_URL, SEO_TITLE_TEMPLATE } from '@/lib/seo';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7f8' };

/**
 * Site-wide metadata. The brand name, role line and tagline come from the CMS;
 * only the title template and the URL are structural. Per-page titles and
 * descriptions come from each page's Page Copy record.
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteResult = await getSiteConfig();
  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG;

  const name = site.brand.name || SITE_NAME;
  const defaultTitle = site.brand.role ? `${name} — ${site.brand.role}` : name;
  const description = site.footer.tagline;

  return {
    title: {
      default: defaultTitle,
      template: SEO_TITLE_TEMPLATE,
    },
    ...(description ? { description } : {}),
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: defaultTitle,
      ...(description ? { description } : {}),
      url: SITE_URL,
      siteName: name,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@lamirkohsa',
    },
  };
}

import { ThemeProvider } from '@/contexts/ThemeContext';

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Navigation, brand, footer and contact details all come from the CMS. Reading
  // no request headers here keeps the public routes cacheable; the CMS subdomain
  // is detected in the client shell instead.
  const siteResult = await getSiteConfig()
  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('portfolio_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=(t==='dark'||(!t&&d)||(t==='system'&&d));var root=document.documentElement;if(dark){root.classList.add('dark');root.classList.remove('light');root.setAttribute('data-theme','dark');root.style.colorScheme='dark';}else{root.classList.remove('dark');root.classList.add('light');root.setAttribute('data-theme','light');root.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="leading-relaxed tracking-wide">
        <ThemeProvider>
          <ScrollProgress />
          <SmoothScroll />
          <LayoutShell site={site}>{children}</LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
