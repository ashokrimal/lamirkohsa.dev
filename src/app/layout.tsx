import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';
import { EMPTY_SITE_CONFIG, getSiteConfig } from '@/lib/site-content';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7f8' };

export const metadata: Metadata = {
  title: {
    default: 'Ashok Rimal - Software Developer Portfolio',
    template: '%s | Ashok Rimal',
  },
  description:
    'Premium personal portfolio and content management studio for software developer Ashok Rimal.',
  metadataBase: new URL('https://ashokrimal.com.np'),
  openGraph: {
    title: 'Ashok Rimal - Software Developer Portfolio',
    description:
      'Premium personal portfolio and content management studio for software developer Ashok Rimal.',
    url: 'https://ashokrimal.com.np',
    siteName: 'Ashok Rimal Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@lamirkohsa',
  },
};

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
  );
}
