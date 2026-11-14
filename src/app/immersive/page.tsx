import type { Metadata } from 'next';
import ImmersivePortfolio from '@/components/immersive/ImmersivePortfolio';
import './immersive.css';

export const metadata: Metadata = {
  title: 'Immersive Portfolio',
  description:
    'An immersive, scroll-driven portfolio by Ashok Rimal — full-stack creative technologist working across product, 3D, and motion.',
  alternates: { canonical: '/' },
};

export default function ImmersivePortfolioPage() {
  return <ImmersivePortfolio />;
}
