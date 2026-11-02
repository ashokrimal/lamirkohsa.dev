import { Suspense } from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Loading } from '@/components/Loading';
import udemyLogo from './logos/udemy.webp';
import courseraLogo from './logos/coursera.webp';
import ciscoLogo from './logos/cisco.svg';
import dynamic from 'next/dynamic';

// Import types first
import type { 
  FeaturedProject, 
  Certificate,
  HomeContentProps 
} from '@/components/pages/HomeContent';

// Then the dynamic import
const HomeContent = dynamic(
  () => import('@/components/pages/HomeContent'),
  { 
    ssr: false,
    loading: () => <Loading variant="page" />
  }
) as React.ComponentType<HomeContentProps>;

const featuredProjects: FeaturedProject[] = [
  {
    title: 'KaryaMantra',
    blurb: 'A productivity web app that helps students organize assignments with real-time status tracking.',
    tech: ['React', 'Firebase', 'Tailwind CSS'],
    image: 'https://placehold.co/800x600/0f172a/ffffff?text=KaryaMantra',
  },
  {
    title: 'BuyNepal Marketplace',
    blurb: 'A full-stack e-commerce experience for local artisans, supporting secure checkout and admin dashboards.',
    tech: ['Next.js', 'Node.js', 'MongoDB'],
    image: 'https://placehold.co/800x600/1d4ed8/ffffff?text=BuyNepal',
  },
  {
    title: 'InsightHub',
    blurb: 'InsightHub is building the future of data exchange, empowering individuals and organizations to unlock the value of their knowledge.',
    tech: ['React Native', 'Express', 'Socket.io'],
    image: 'https://placehold.co/800x600/0ea5e9/ffffff?text=InsightHub',
  },
  
];

const certificates: Certificate[] = [
  { name: 'Udemy', image: udemyLogo, scale: 1.2 },
  { name: 'Coursera', image: courseraLogo, scale: 0.96 },
  { name: 'Cisco', image: ciscoLogo, scale: 1.2 },
];

export default function HomePage() {
  return (
    <PageLayout
      loadingVariant="page"
      errorTitle="Error loading page"
      errorMessage="We're having trouble loading the page. Please try again later."
    >
      <HomeContent featuredProjects={featuredProjects} certificates={certificates} />
    </PageLayout>
  );
}
