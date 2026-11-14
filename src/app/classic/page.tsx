import type { Metadata } from 'next';
import { PageLayout } from '@/components/layouts/PageLayout';
import HomeContent from '@/components/pages/HomeContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Classic Portfolio',
  description:
    'The original editorial portfolio of Ashok Rimal — product engineer and creative technologist based in Kathmandu.',
  alternates: { canonical: '/classic' },
};

export default function ClassicHomePage() {
  return (
    <PageLayout
      loadingVariant="page"
      errorTitle="Error loading page"
      errorMessage="We're having trouble loading the page. Please try again later."
    >
      <HomeContent />
    </PageLayout>
  );
}
