import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import WorkInProgressNotice from '@/components/WorkInProgressNotice';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

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
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} leading-relaxed tracking-wide bg-bg-light text-text-dark`}>
        <SiteHeader />
        <WorkInProgressNotice />
        <main className="pt-24 md:pt-28">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
