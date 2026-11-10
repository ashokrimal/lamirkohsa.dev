import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';
import { getSiteConfig } from '@/lib/site-content';

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
  const headersList = await headers()
  const host = headersList.get('host')?.split(':')[0]
  const isCmsHost = host === 'cms.ashokrimal.com.np'
  // Navigation, brand, footer and contact details all come from the CMS.
  const site = await getSiteConfig()
  return (
    <html lang="en" className="scroll-smooth">
      <body className="leading-relaxed tracking-wide">
        <LayoutShell site={site} isCmsHost={isCmsHost}>{children}</LayoutShell>
      </body>
    </html>
  );
}
