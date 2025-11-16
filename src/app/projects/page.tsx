import type { Metadata } from 'next';
import ProjectsContent from '@/components/pages/ProjectsContent';

type ProjectCategory = 'Web' | 'Mobile';

const projects: {
  title: string;
  category: ProjectCategory;
  image: string;
  challenge: string;
  solution: string;
  features: string[];
  techStack: string[];
  github: string;
  live?: string;
}[] = [
  {
    title: 'KaryaMantra ',
    category: 'Web',
    image: 'https://placehold.co/1200x900/0f172a/ffffff?text=CampusConnect',
    challenge:
      'Students needed a simple way to stay ahead of coursework deadlines and team deliverables while coordinating across busy schedules.',
    solution:
      'Designed a Kanban-inspired interface with real-time assignment updates, deadline reminders, and collaborative task lists powered by Firebase.',
    features: ['Authentication with role-based dashboards', 'Drag-and-drop task board', 'Deadline reminders via email'],
    techStack: ['React', 'Firebase', 'Tailwind CSS', 'Framer Motion'],
    github: 'https://github.com/ashokrimal',
    live: '#',
  },
  {
    title: 'BuyNepal Marketplace',
    category: 'Web',
    image: 'https://placehold.co/1200x900/1d4ed8/ffffff?text=LocalSphere',
    challenge:
      'Independent artisans required a digital storefront that could scale, support online payments, and surface analytics without sacrificing storytelling.',
    solution:
      'Architected a full-stack marketplace with secure checkout, CMS-like product management, and admin analytics leveraging Next.js and MongoDB.',
    features: ['Product inventory CMS', 'Secure Stripe checkout', 'Sales analytics dashboard'],
    techStack: ['Next.js', 'Node.js', 'MongoDB', 'Stripe'],
    github: 'https://github.com/ashokrimal',
    live: '#',
  },
  {
    title: 'SwiftCare Telehealth',
    category: 'Mobile',
    image: 'https://placehold.co/1200x900/0ea5e9/ffffff?text=SwiftCare',
    challenge:
      'Clinics needed a convenient way for patients to book virtual consultations and share health updates without waiting for email replies.',
    solution:
      'Shipped a cross-platform mobile app integrating scheduling, push notifications, and secure chat to connect patients with doctors in real time.',
    features: ['Cross-platform scheduling', 'Encrypted doctor-patient chat', 'Push notifications & reminders'],
    techStack: ['React Native', 'Express.js', 'Socket.io', 'Expo'],
    github: 'https://github.com/ashokrimal',
    live: '#',
  },
  {
    title: 'Departmental Store Management System',
    category: 'Web',
    image: 'https://placehold.co/1200x900/0ea5e9/ffffff?text=Departmental',
    challenge:
      'Departmental stores needed a way to manage their inventory, sales, and customer orders without relying on paper-based systems.',
    solution:
      'Developed a full-stack inventory management system with real-time sales tracking, order fulfillment, and automated reporting.',
    features: ['Inventory management', 'Order fulfillment', 'Sales analytics'],
    techStack: ['React.js', 'MongoDB', 'Tailwind CSS', 'Express.js', 'Node.js'],
    github: 'https://github.com/ashokrimal/arss',
    live: 'https://dsmsbyarss.vercel.app',
  },
];

const filters: Array<'All' | ProjectCategory> = ['All', 'Web', 'Mobile'];

export const metadata: Metadata = {
  title: 'Projects - Ashok Rimal',
  description: 'In-depth case studies demonstrating Ashok Rimal’s approach to web and mobile product development.',
};

export default function ProjectsPage() {
  return (
    <ProjectsContent
      projects={projects}
      filters={filters}
      heading={
        <>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-500">Selected Case Studies</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-black text-gray-900">Proof that I can ship ideas end-to-end.</h1>
        </>
      }
      description={
        <p className="mt-6 text-lg text-gray-600">
          From discovery to deployment, here are the projects where I balanced UX thinking, technical execution, and measurable outcomes. Filter by web or mobile to find what matters most to you.
        </p>
      }
    />
  );
}
