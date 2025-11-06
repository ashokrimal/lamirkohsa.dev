import type { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Messages',
  description: 'View submitted contact form messages.',
};

export default function AdminPage() {
  return (
    <div className="py-20 md:py-24">
      <div className="container mx-auto px-6">
        <AdminDashboard />
      </div>
    </div>
  );
}
