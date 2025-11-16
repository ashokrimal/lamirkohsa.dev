'use client';

import { Suspense, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ScrollObserver from '@/components/ScrollObserver';
import ContactForm from '@/components/ContactForm';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import { useDevMode } from '@/contexts/DevModeContext';
import DevSection from '@/components/devmode/DevSection';

const PAGE_KEY = 'contact';
const DEFAULT_SECTIONS = ['intro', 'terminal', 'channel'] as const;

type SectionId = (typeof DEFAULT_SECTIONS)[number];

const SECTION_ACCENTS: Record<SectionId, string> = {
  intro: '#1d4ed8',
  terminal: '#0f172a',
  channel: '#2563eb',
};

function IntroSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label="Intro"
      fallbackAccent={SECTION_ACCENTS.intro}
      className="text-center py-10"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
        Let&apos;s collaborate
      </p>
      <h1 className="mt-4 text-4xl md:text-6xl font-black text-gray-900">
        Tell me about your next idea.
      </h1>
      <p className="mt-6 text-lg text-gray-600">
        I&apos;m open to internship opportunities, freelance projects, or partnering on something new. Let&apos;s connect!
      </p>
    </DevSection>
  );
}

function TerminalSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="terminal"
      label="Terminal"
      fallbackAccent={SECTION_ACCENTS.terminal}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-slate-100"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1200&q=60')] bg-cover bg-center opacity-10" />
      <div className="relative p-6">
        <div className="flex items-center gap-2 rounded-t-2xl bg-slate-950/80 px-4 py-2 shadow-inner">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500" />
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-400" />
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400" />
          <span className="ml-4 text-xs text-slate-400">dev@lamirkohsa — zsh</span>
        </div>
        <div className="rounded-b-2xl bg-slate-950/70 p-6 font-mono text-sm leading-relaxed">
          <p className="text-emerald-300">last login: Sat Nov 15 08:03:45 on console</p>
          <p className="text-slate-100">You have mail.</p>
          <p className="mt-4 text-white">
            <span className="text-emerald-300">lamirkohsa@portfolio</span>
            <span className="text-white"> % </span>
            <span className="inline-block bg-transparent">echo {"\""}hello{"\""} &gt; collaboration.txt</span>
          </p>
        </div>
      </div>
    </DevSection>
  );
}

function ChannelSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="channel"
      label="Channels"
      fallbackAccent={SECTION_ACCENTS.channel}
      className="py-12"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
            Arcane terminal
          </p>
          <p className="mt-2 text-gray-600">
            Drop your message and I&apos;ll respond with next steps.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
              Signal beacons
            </p>
            <p className="mt-2 text-gray-600">
              Prefer a direct line? Contact me through any channel.
            </p>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Courier raven</p>
              <a
                href="mailto:contact@lamirkohsa.com"
                className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
              >
                contact@lamirkohsa.com ↗
              </a>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Guild hall</p>
              <Link
                href="https://www.linkedin.com/in/lamirkohsa/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
              >
                linkedin.com/in/lamirkohsa/ ↗
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Forge archives</p>
              <Link
                href="https://github.com/ashokrimal"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
              >
                github.com/ashokrimal ↗
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </DevSection>
  );
}

export default function ContactContent() {
  const { mode, registerPageSections, getSectionOrder } = useDevMode();

  useEffect(() => {
    registerPageSections(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[]);
  }, [registerPageSections]);

  const orderedSections = useMemo(() => {
    const sections = getSectionOrder(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[]);
    const filtered = sections.filter((section): section is SectionId =>
      (DEFAULT_SECTIONS as readonly string[]).includes(section as SectionId),
    );
    return filtered.length ? filtered : [...DEFAULT_SECTIONS];
  }, [getSectionOrder]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <div className="py-20 md:py-32">
          <ScrollObserver />
          <div className="container mx-auto px-6 space-y-12">
            {mode === 'classic'
              ? (
                <>
                  <IntroSection />
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <div className="fade-in-up">
                      <ContactForm />
                    </div>
                    <aside className="fade-in-up rounded-2xl border border-gray-200 bg-white p-8 shadow-sm" style={{ transitionDelay: '150ms' }}>
                      <h2 className="text-2xl font-semibold text-gray-900">Prefer a direct line?</h2>
                      <p className="mt-3 text-gray-600">
                        Drop me a note and I’ll follow up. You can also connect via LinkedIn or GitHub if that’s easier.
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
                    </aside>
                  </div>
                </>
              )
              : orderedSections.map(sectionId => {
                  if (sectionId === 'intro') return <IntroSection key={sectionId} />;
                  if (sectionId === 'terminal') return <TerminalSection key={sectionId} />;
                  if (sectionId === 'channel') return <ChannelSection key={sectionId} />;
                  return null;
                })}
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
