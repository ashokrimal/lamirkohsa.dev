import type { Metadata } from 'next';
import ImmersivePortfolio from '@/components/immersive/ImmersivePortfolio';
import './immersive/immersive.css';

export const metadata: Metadata = {
  title: { absolute: 'Ashok Rimal — Creative Technologist' },
  description:
    'An immersive, scroll-driven portfolio by Ashok Rimal — full-stack creative technologist working across product, 3D, and motion.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <ImmersivePortfolio />;
}
