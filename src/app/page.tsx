import { PageLayout } from '@/components/layouts/PageLayout';
import HomeContent from '@/components/pages/HomeContent';

export default function HomePage() {
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
