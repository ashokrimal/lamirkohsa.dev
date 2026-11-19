import type { Metadata } from 'next';
import { PageLayout } from '@/components/layouts/PageLayout';
import HomeContent from '@/components/pages/HomeContent';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const revalidate = 300;

const PAGE_TITLE = `${SITE_NAME} — Product Engineer & Creative Technologist`;
const PAGE_DESCRIPTION =
  "Explore Ashok Rimal's portfolio featuring shipped full-stack systems, case studies, interactive 3D web experiences, and creative experiments.";
const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    creator: '@lamirkohsa',
    images: ['/opengraph-image'],
  },
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_NAME,
      alternateName: 'lamirkohsa',
      url: SITE_URL,
      mainEntityOfPage: SITE_URL,
      jobTitle: 'Product Engineer & Creative Technologist',
      description:
        'Product engineer and creative technologist based in Butwal building considered interfaces, 3D web experiences, and resilient full-stack systems.',
      email: 'mailto:info.ashokrimal@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Butwal',
        addressCountry: 'NP',
      },
      sameAs: ['https://github.com/ashokrimal', 'https://www.linkedin.com'],
      knowsAbout: [
        'Next.js',
        'React',
        'TypeScript',
        'PostgreSQL',
        'Drizzle ORM',
        'Three.js',
        'Framer Motion',
        'Tailwind CSS',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: `${SITE_NAME} Portfolio & CMS Studio`,
      url: SITE_URL,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'Portfolio & Headless CMS Web Application',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      description: PAGE_DESCRIPTION,
      image: OG_IMAGE_URL,
      author: { '@id': `${SITE_URL}/#person` },
      creator: { '@id': `${SITE_URL}/#person` },
      featureList: [
        'Dynamic Postgres-backed CMS collections with ISR tag revalidation',
        'Structured project case studies, experience timelines, and media shelves',
        'Interactive 3D edition accessible at /a2',
        'Accessible reduced-motion scroll reveal choreography',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <PageLayout
        loadingVariant="page"
        errorTitle="Error loading page"
        errorMessage="We're having trouble loading the page. Please try again later."
      >
        <HomeContent />
      </PageLayout>
    </>
  );
}
