import type { Metadata } from 'next';
import ContactContent from '@/components/pages/ContactContent';
import { Loading } from '@/components/Loading';
import { useDevMode } from '@/contexts/DevModeContext';
import DevSection from '@/components/devmode/DevSection';

export const metadata: Metadata = {
  title: 'Contact            <span className="inline-block bg-transparent">echo "hello" &gt; collaboration.txt</span>',
  description: 'Reach out to Ashok Rimal for internship roles, freelance collaborations, or tech partnerships.',
};

export default function ContactPage() {
  return <ContactContent />;
}
