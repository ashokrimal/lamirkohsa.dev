import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: {
    default: 'Ashok Rimal - Digital Creator & Developer',
    template: '%s | Ashok Rimal',
  },
  description:
    'Portfolio of Ashok Rimal, a student, designer, and developer from Nepal passionate about building beautiful digital experiences.',
  metadataBase: new URL('https://ashokrimal.com.np'),
  openGraph: {
    title: 'Ashok Rimal - Digital Creator & Developer',
    description:
      'Portfolio of Ashok Rimal, a student, designer, and developer from Nepal passionate about building beautiful digital experiences.',
    url: 'https://ashokrimal.com.np',
    siteName: 'lamirkohsa',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@lamirkohsa',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const host = headers().get('host')?.split(':')[0]
  const isCmsHost = host === 'cms.ashokrimal.com.np'
  return (
    <html lang="en" className="scroll-smooth">
      <body className="leading-relaxed tracking-wide">
        <LayoutShell isCmsHost={isCmsHost}>{children}</LayoutShell>
      </body>
    </html>
  );
}
