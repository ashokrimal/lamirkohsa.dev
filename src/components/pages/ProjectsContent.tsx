'use client';

import { Suspense, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import ScrollObserver from '@/components/ScrollObserver';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import ProjectsShowcase from '@/components/ProjectsShowcase';
import DevSection from '@/components/devmode/DevSection';
import { useDevMode } from '@/contexts/DevModeContext';

interface Project {
  title: string;
  category: 'Web' | 'Mobile';
  image: string;
  challenge: string;
  solution: string;
  features: string[];
  techStack: string[];
  github: string;
  live?: string;
}

interface ProjectsContentProps {
  projects: Project[];
  filters: Array<'All' | 'Web' | 'Mobile'>;
  heading: ReactNode;
  description: ReactNode;
}

const PAGE_KEY = 'projects';
const DEFAULT_SECTIONS = ['intro', 'showcase'] as const;

type SectionId = (typeof DEFAULT_SECTIONS)[number];

type SectionRenderer = () => JSX.Element;

function IntroSection({ children }: { children: ReactNode }) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label="Intro"
      fallbackAccent="#22d3ee"
      className="py-12"
    >
      <header className="max-w-3xl mx-auto text-center space-y-4">
        {children}
      </header>
    </DevSection>
  );
}

function ShowcaseSection({ projects, filters }: { projects: Project[]; filters: Array<'All' | 'Web' | 'Mobile'> }) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="showcase"
      label="Showcase"
      fallbackAccent="#2563eb"
      className="py-12"
    >
      <ProjectsShowcase projects={projects} filters={filters} />
    </DevSection>
  );
}

const SECTION_RENDERERS: Record<SectionId, SectionRenderer> = {
  intro: () => <div className="hidden" />,
  showcase: () => <div className="hidden" />,
};

export default function ProjectsContent({ projects, filters, heading, description }: ProjectsContentProps) {
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

  const intro = (
    <IntroSection>
      <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
        Selected Case Studies
      </p>
      <h1 className="mt-4 text-4xl md:text-5xl font-black text-gray-900">
        Proof that I can ship ideas end-to-end.
      </h1>
      <p className="mt-6 text-lg text-gray-600">
        A collection of projects showcasing my work across web and mobile platforms.
      </p>
    </IntroSection>
  );

  const showcase = <ShowcaseSection projects={projects} filters={filters} />;

  const sectionMap: Record<SectionId, JSX.Element> = {
    intro,
    showcase,
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <div className="py-20 md:py-32">
          <ScrollObserver />
          <div className="container mx-auto px-6 space-y-12">
            {mode === 'classic'
              ? (
                <>
                  {heading}
                  {description}
                  <ProjectsShowcase projects={projects} filters={filters} />
                </>
              )
              : orderedSections.map(sectionId => (
                  <div key={sectionId}>{sectionMap[sectionId]}</div>
                ))}
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
