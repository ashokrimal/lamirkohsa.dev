import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';
import { EMPTY_SITE_CONFIG, getSiteConfig } from '@/lib/site-content';
import { SITE_URL, SEO_TITLE_TEMPLATE } from '@/lib/seo';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7f8' };

/**
 * Site-wide metadata. The brand name, role line and tagline come from the CMS;
 * only the title template and the URL are structural. Per-page titles and
 * descriptions come from each page's Page Copy record.
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteResult = await getSiteConfig();
  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG;

  const name = site.brand.name || 'Ashok Rimal';
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Navigation, brand, footer and contact details all come from the CMS. Reading
  // no request headers here keeps the public routes cacheable; the CMS subdomain
  // is detected in the client shell instead.
  const siteResult = await getSiteConfig()
  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG
  return (
    <html lang="en" className="scroll-smooth">
      <body className="leading-relaxed tracking-wide">
        <LayoutShell site={site}>{children}</LayoutShell>
      </body>
    </html>
  )
}
