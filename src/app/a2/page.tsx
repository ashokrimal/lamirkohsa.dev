import type { Metadata } from 'next';
import ImmersivePortfolio from '@/components/immersive/ImmersivePortfolio';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import '../immersive/immersive.css';

export const revalidate = 300;

const PAGE_URL = `${SITE_URL}/a2`;
const OG_IMAGE_URL = `${PAGE_URL}/opengraph-image`;
const PAGE_TITLE = 'Ashok Rimal — Interactive 3D Creative Portfolio';
const PAGE_DESCRIPTION =
  "Explore Ashok Rimal's interactive 3D creative portfolio featuring scroll-driven WebGL scenes, selected case studies, toolkit, and studio contact.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/a2' },
  openGraph: {
    type: 'website',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/a2/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Ashok Rimal — Interactive 3D Creative Technologist Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    creator: '@lamirkohsa',
    images: ['/a2/opengraph-image'],
  },
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Ashok Rimal',
      alternateName: 'lamirkohsa',
      url: SITE_URL,
      mainEntityOfPage: PAGE_URL,
      jobTitle: 'Full-Stack Creative Technologist',
      description:
        'Full-stack creative technologist and product engineer designing interfaces, real-time 3D web experiences, and resilient systems.',
      email: 'mailto:info.ashokrimal@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kathmandu',
        addressCountry: 'NP',
      },
      sameAs: ['https://github.com/ashokrimal', 'https://www.linkedin.com'],
      knowsAbout: [
        'Next.js',
        'React',
        'TypeScript',
        'Three.js',
        'React Three Fiber',
        'GLSL',
        'GSAP',
        'Framer Motion',
        'PostgreSQL',
        'Drizzle ORM',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${PAGE_URL}#software`,
      name: 'Ashok Rimal Interactive 3D Portfolio (A2)',
      url: PAGE_URL,
      applicationCategory: 'DesignApplication',
      applicationSubCategory: 'Interactive 3D Web Portfolio',
      operatingSystem: 'Any (Web Browser with WebGL)',
      browserRequirements: 'Requires JavaScript and a WebGL2-capable browser',
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      description: PAGE_DESCRIPTION,
      image: OG_IMAGE_URL,
      author: { '@id': `${SITE_URL}/#person` },
      creator: { '@id': `${SITE_URL}/#person` },
      featureList: [
        'Scroll-linked Three.js 3D camera choreography',
        'Real-time WebGL lighting, post-processing bloom, and depth of field',
        'Interactive 3D project showcase cards with case-study modal inspection',
        'Reduced-motion accessible chapter reveal animations',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
};

export default function A2HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <ImmersivePortfolio />
    </>
  );
}
