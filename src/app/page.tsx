import type { Metadata } from 'next';
import { PageLayout } from '@/components/layouts/PageLayout';
import HomeContent from '@/components/pages/HomeContent';
import { getPageMetadata } from '@/lib/studio/data';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { organizationJsonLd } from '@/lib/structured-data';

// The homepage is the most-visited route and its content is CMS data that is
// already cached under `cms-content`; render it statically and refresh it on the
// same five-minute window as the other public pages. Studio mutations call
// `revalidatePath('/')`, so an edit still shows up on the next request.
export const revalidate = 300;

const PAGE_TITLE = `${SITE_NAME} — Product Engineer & Creative Technologist`;
const PAGE_DESCRIPTION =
  "Explore Ashok Rimal's portfolio featuring shipped full-stack systems, case studies, interactive data visualizations, and creative engineering experiments.";
const OG_IMAGE_URL = `${SITE_URL}/og.png`;

export async function generateMetadata(): Promise<Metadata> {
  // The page row owns the public title and description; the block below is the
  // structural default used before the studio has a record for `/`.
  const studio = await getPageMetadata('/')
  const title = studio?.title ? { absolute: studio.title } : { absolute: PAGE_TITLE }
  const description = studio?.description || PAGE_DESCRIPTION
  return {
    ...BASE_METADATA,
    title,
    description,
    openGraph: { ...BASE_METADATA.openGraph, title: studio?.title || PAGE_TITLE, description },
    twitter: { ...BASE_METADATA.twitter, title: studio?.title || PAGE_TITLE, description },
  }
}

const BASE_METADATA: Metadata = {
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
        url: '/og.png',
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
    images: ['/og.png'],
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
        'Product engineer and creative technologist based in Butwal building considered interfaces, structured case studies, and resilient full-stack systems.',
      email: 'mailto:info.ashokrimal@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Butwal',
        addressCountry: 'NP',
      },
      sameAs: [
        'https://github.com/ashokrimal',
        // The bare linkedin.com root identifies nothing; this is the profile the
        // site's own social links point at.
        'https://www.linkedin.com/in/lamirkohsa/',
      ],
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
    // The publisher every article on the site references by @id. Declaring it
    // once here keeps the logo in one place instead of repeating it per page.
    organizationJsonLd(),
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
        'Structured project case studies, technology distributions, and media shelves',
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
        loadingVariant="home"
        errorTitle="Error loading page"
        errorMessage="We're having trouble loading the page. Please try again later."
      >
        <HomeContent />
      </PageLayout>
    </>
  );
}
