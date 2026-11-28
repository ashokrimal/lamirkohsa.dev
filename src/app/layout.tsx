import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import 'lenis/dist/lenis.css';
import LayoutShell from '@/components/LayoutShell';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SmoothScroll } from '@/components/SmoothScroll';
import { EMPTY_SITE_CONFIG, getSiteConfig } from '@/lib/site-content';
import { getSiteSettings } from '@/lib/studio/data';
import { getUiCopyOverrides } from '@/lib/ui-copy';
import { UiCopyProvider } from '@/components/ui/UiCopyProvider'
import { ClientErrorReporter } from '@/components/ClientErrorReporter'
import { WebVitalsReporter } from '@/components/WebVitalsReporter';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SEO_TITLE_TEMPLATE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f1eb' },
    { media: '(prefers-color-scheme: dark)', color: '#161618' },
  ],
};

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
  const description =
    site.footer.tagline || `The official portfolio of ${name}.`;
  const socialImage = {
    url: DEFAULT_OG_IMAGE,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt: defaultTitle,
  };

  return {
    title: {
      default: defaultTitle,
      template: SEO_TITLE_TEMPLATE,
    },
    description,
    applicationName: name,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    appleWebApp: {
      capable: true,
      title: name,
      statusBarStyle: 'default',
    },
    authors: [{ name }],
    creator: name,
    publisher: name,
    category: 'Portfolio',
    metadataBase: new URL(SITE_URL),
    // Feed readers discover the journal through this, not by guessing a path.
    alternates: {
      types: { 'application/rss+xml': '/feed.xml' },
    },
    // Search Console and Bing Webmaster Tools prove ownership by reading a
    // token from the page, so each engine's token is passed in as an environment
    // variable rather than being edited into this file.
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION?.trim()
        ? { google: process.env.GOOGLE_SITE_VERIFICATION.trim() }
        : {}),
      ...(process.env.YANDEX_SITE_VERIFICATION?.trim()
        ? { yandex: process.env.YANDEX_SITE_VERIFICATION.trim() }
        : {}),
      other: {
        ...(process.env.BING_SITE_VERIFICATION?.trim()
          ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION.trim() }
          : {}),
        ...(process.env.PINTEREST_SITE_VERIFICATION?.trim()
          ? { 'p:domain_verify': process.env.PINTEREST_SITE_VERIFICATION.trim() }
          : {}),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: defaultTitle,
      description,
      url: SITE_URL,
      siteName: name,
      locale: 'en_US',
      type: 'website',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description,
      images: [socialImage],
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
  // Footer socials, email and availability come from the studio's single-row
  // settings table; the fallback keeps the configured CMS values until seeded.
  const studioSettings = await getSiteSettings()
  // Interface labels are CMS copy too; missing records keep the built-in text.
  const uiCopyOverrides = await getUiCopyOverrides()
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('portfolio_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var setting=(t==='light'||t==='dark'||t==='system')?t:'system';var dark=(setting==='dark'||(setting==='system'&&d));var root=document.documentElement;if(dark){root.classList.add('dark');root.classList.remove('light');root.setAttribute('data-theme','dark');root.style.colorScheme='dark';}else{root.classList.remove('dark');root.classList.add('light');root.setAttribute('data-theme','light');root.style.colorScheme='light';}root.setAttribute('data-theme-setting',setting);try{if(sessionStorage.getItem('ar_preloader_seen')==='1'){root.setAttribute('data-preloader-seen','1');}else if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){root.setAttribute('data-preloader-reduced','');}}catch(e){}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="leading-relaxed tracking-wide">
        <ThemeProvider>
          <ClientErrorReporter />
          <WebVitalsReporter />
          <UiCopyProvider overrides={uiCopyOverrides}>
          <ScrollProgress />
          <SmoothScroll />
          <LayoutShell
            site={site}
            footerSocialLinks={studioSettings.socialLinks}
            footerContactEmail={studioSettings.contactEmail}
            footerAvailability={studioSettings.availabilityStatus}
          >
            {children}
          </LayoutShell>
          </UiCopyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
