'use client';

import { Suspense, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import ScrollObserver from '@/components/ScrollObserver';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import ProjectsShowcase from '@/components/ProjectsShowcase';
import { ProjectsTimeline, type ProjectPhase } from '@/components/ProjectsTimeline';
import DevSection from '@/components/devmode/DevSection';
import { useDevMode } from '@/contexts/DevModeContext';
import SkeletonReveal from '@/components/SkeletonReveal';

export interface Project {
  title: string;
  category: 'Web' | 'Mobile';
  image: string;
  challenge: string;
  solution: string;
  features: string[];
  techStack: string[];
  github: string;
  live?: string;
  completionDate?: string;
  period?: string;
  status?: string;
  phases?: ProjectPhase[];
}

interface ProjectsContentProps {
  projects: Project[];
  filters: Array<'All' | 'Web' | 'Mobile'>;
  heading: ReactNode;
  description: ReactNode;
}

const PAGE_KEY = 'projects';
const DEFAULT_SECTIONS = ['intro', 'timeline', 'showcase'] as const;

type SectionId = (typeof DEFAULT_SECTIONS)[number];

function IntroSection({
  heading,
  description,
}: {
  heading: ReactNode;
  description: ReactNode;
}) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label="Intro"
      fallbackAccent="#52725d"
      className="pt-6 pb-2"
    >
      <header className="max-w-4xl space-y-3">
        {heading}
        {description}
      </header>
    </DevSection>
  );
}

function TimelineSection({ projects }: { projects: Project[] }) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="timeline"
      label="Timeline & Milestones"
      fallbackAccent="#52725d"
      className="py-2"
    >
      <ProjectsTimeline projects={projects} />
    </DevSection>
  );
}

function ShowcaseSection({
  projects,
  filters,
}: {
  projects: Project[];
  filters: Array<'All' | 'Web' | 'Mobile'>;
}) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="showcase"
      label="Case Studies Showcase"
      fallbackAccent="#52725d"
      className="py-4"
    >
      <ProjectsShowcase projects={projects} filters={filters} />
    </DevSection>
  );
}

export default function ProjectsContent({
  projects,
  filters,
  heading,
  description,
}: ProjectsContentProps) {
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

  const intro = <IntroSection heading={heading} description={description} />;
  const timeline = <TimelineSection projects={projects} />;
  const showcase = <ShowcaseSection projects={projects} filters={filters} />;

  const sectionMap: Record<SectionId, JSX.Element> = {
    intro,
    timeline,
    showcase,
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <SkeletonReveal variant="cards">
          <main className="projects-page shell-width">
            <ScrollObserver />
            <div className="projects-content">
              {mode === 'classic' ? (
                <div className="space-y-6">
                  <header className="max-w-4xl space-y-3">
                    {heading}
                    {description}
                  </header>
                  <ProjectsTimeline projects={projects} />
                  <ProjectsShowcase projects={projects} filters={filters} />
                </div>
              ) : (
                orderedSections.map((sectionId) => (
                  <div key={sectionId}>{sectionMap[sectionId]}</div>
                ))
              )}
            </div>
          </main>
        </SkeletonReveal>
      </Suspense>
    </ErrorBoundary>
  );
}
