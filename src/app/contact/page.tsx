import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollObserver from '@/components/ScrollObserver';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact - Ashok Rimal',
  description: 'Reach out to Ashok Rimal for internship roles, freelance collaborations, or tech partnerships.',
};

export default function ContactPage() {
  return (
    <div className="py-20 md:py-32">
      <ScrollObserver />
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-500">Let&apos;s collaborate</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black text-gray-900">Tell me about your next idea.</h1>
            <p className="mt-6 text-lg text-gray-600">
              I&apos;m open to internship opportunities, freelance projects, or partnering on something new. Share the details below or connect through any of the channels.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="fade-in-up">
              <ContactForm />
            </div>

            <aside className="fade-in-up rounded-2xl border border-gray-200 bg-white p-8 shadow-sm" style={{ transitionDelay: '150ms' }}>
              <h2 className="text-2xl font-semibold text-gray-900">Prefer a direct line?</h2>
              <p className="mt-3 text-gray-600">
                Drop me a note and I&apos;ll follow up. You can also connect via LinkedIn or GitHub if that&apos;s easier.
              </p>

              <div className="mt-6 space-y-4 text-gray-700">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Email</p>
                  <a href="mailto:contact@lamirkohsa.com" className="mt-1 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800">
                    contact@lamirkohsa.com
                  </a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-500">LinkedIn</p>
                  <Link href="https://www.linkedin.com/in/lamirkohsa/" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800">
                    linkedin.com/in/lamirkohsa/
                  </Link>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-500">GitHub</p>
                  <Link href="https://github.com/ashokrimal" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800">
                    github.com/ashokrimal
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-blue-50 p-6 text-blue-900">
                <h3 className="text-lg font-semibold">Let&apos;s make it happen</h3>
                <p className="mt-2 text-sm">
                  Share what you&apos;re building, your timeline, and the outcomes you&apos;re aiming for. I&apos;ll review and suggest how we can collaborate.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
