'use client';

import { Suspense, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollObserver from '@/components/ScrollObserver';
import ErrorBoundary from '@/components/ErrorBoundaryWrapper';
import { Loading } from '@/components/Loading';
import { useDevMode } from '@/contexts/DevModeContext';
import DevSection from '@/components/devmode/DevSection';

const PAGE_KEY = 'about';
const DEFAULT_SECTIONS = ['profile', 'skills', 'experience', 'education', 'focus', 'certifications'] as const;

type SectionId = (typeof DEFAULT_SECTIONS)[number];

const strengths = [
  'Focused learning path across Swift, Kotlin, and the MERN stack keeps me aligned with industry needs.',
  'Hands-on, experimental builder who turns concepts into prototypes and iterates quickly.',
  'Cross-platform mindset enables crafting cohesive experiences across mobile and web.',
  'Comfortable pairing human creativity with AI tools to ideate, validate, and ship faster.',
];

const growthFocus = [
  'Advance from fundamentals to production-ready apps in Swift, Kotlin, and MERN.',
  'Document every project with context, decisions, and lessons to share the journey.',
  'Maintain end-to-end builds in GitHub that showcase code ownership beyond AI-assisted snippets.',
];

const skillGroups = [
  {
    title: 'Mobile Development (Learning)',
    items: ['Swift (iOS fundamentals)', 'Kotlin (Android essentials)'],
  },
  {
    title: 'Full-Stack Web (MERN)',
    items: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Tailwind CSS'],
  },
  {
    title: 'Foundations',
    items: ['C++', 'C', 'Web Design', 'Responsive Web Development'],
  },
  {
    title: 'Tools & Workflow',
    items: ['Git & GitHub', 'Figma', 'VS Code', 'AI-assisted prototyping'],
  },
];

const experiences = [
  {
    title: 'Freelance Web Developer',
    company: 'Self-Employed',
    period: '2023 – Present',
    description:
      'Deliver bespoke websites and web apps for small businesses. I handle everything from discovery to deployment, ensuring responsive design and measurable performance improvements.',
  },
  {
    title: 'Open Source Contributor',
    company: 'GitHub Projects',
    period: '2022 – Present',
    description:
      'Collaborate on community-driven repositories focused on bug fixes, documentation, and feature prototypes—honing version control discipline and code review etiquette.',
  },
];

const education = {
  degree: 'Bachelor of Computer Applications',
  institution: 'Crimson College of Technology',
  period: '2022 – Present',
  summary:
    'Building a strong foundation in software development, data structures, and systems design while translating coursework into hands-on projects across mobile and web.',
};

const certifications = [
  { title: 'Responsive Web Design', org: 'freeCodeCamp' },
  { title: 'MERN Stack Bootcamp', org: 'Udemy' },
  { title: 'JavaScript Algorithms & Data Structures', org: 'freeCodeCamp' },
];

function ClassicAboutContent() {
  return (
    <div className="py-20 md:py-32">
      <ScrollObserver />
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <section className="flex flex-col md:flex-row gap-10 items-start mb-20">
            <div className="w-full md:w-1/3 lg:w-2/5 fade-in-up">
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <Image
                  src="https://github.com/ashokrimal.png"
                  alt="Ashok Rimal portrait"
                  fill
                  priority
                  className="rounded-3xl border border-gray-200 shadow-lg object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 lg:w-3/5 fade-in-up" style={{ transitionDelay: '120ms' }}>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Builder. Problem-solver. Lifelong learner.</h1>
              <p className="mt-6 text-lg text-gray-600">
                I&apos;m Ashok Rimal, a Bachelor of Computer Applications student at Crimson College of Technology, where I&apos;m turning classroom fundamentals into real-world software. I thrive on learning by doing, whether that&apos;s crafting polished interfaces or architecting the systems that power them.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                Right now I&apos;m deep-diving into Swift for iOS, Kotlin for Android, and the MERN stack so I can build seamless experiences across devices. AI-assisted development helps me prototype ideas quickly, document my lessons, and iterate toward production-quality solutions.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Explore My Projects
                </Link>
                <a
                  href="/resume.pdf"
                  download="Ashok-Rimal-Resume.pdf"
                  className="inline-flex items-center justify-center border border-blue-200 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Download Résumé
                </a>
              </div>
            </div>
          </section>

          <section className="fade-in-up mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Skills at a glance</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {skillGroups.map(group => (
                <article key={group.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900">{group.title}</h3>
                  <ul className="mt-4 space-y-2 text-gray-600">
                    {group.items.map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-6 rounded-sm bg-blue-500/70" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="fade-in-up mb-20" style={{ transitionDelay: '120ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Experience</h2>
            <div className="relative border-l-2 border-gray-200 pl-8 space-y-12">
              {experiences.map((experience, index) => (
                <article key={experience.title} className="relative timeline-item" style={{ transitionDelay: `${index * 120}ms` }}>
                  <h3 className="text-xl font-semibold text-gray-900">{experience.title}</h3>
                  <p className="text-gray-500 font-medium">
                    {experience.company} &bull; {experience.period}
                  </p>
                  <p className="mt-3 text-gray-700 leading-relaxed">{experience.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="fade-in-up mb-20" style={{ transitionDelay: '200ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Education</h2>
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">{education.degree}</h3>
              <p className="text-gray-500 font-medium mt-1">
                {education.institution} &bull; {education.period}
              </p>
              <p className="mt-3 text-gray-700">{education.summary}</p>
            </article>
          </section>

          <section className="fade-in-up mb-20" style={{ transitionDelay: '240ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Strengths &amp; Growth Focus</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">What sets me apart</h3>
                <ul className="mt-4 space-y-3 text-gray-600">
                  {strengths.map(point => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-5 rounded-sm bg-blue-500/80" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Where I&apos;m leveling up next</h3>
                <ul className="mt-4 space-y-3 text-gray-600">
                  {growthFocus.map(point => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-5 rounded-sm bg-violet-500/80" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className="fade-in-up" style={{ transitionDelay: '260ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Certifications</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {certifications.map(cert => (
                <article key={cert.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{cert.title}</h3>
                  <p className="text-gray-500 mt-1">{cert.org}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DevAboutContent() {
  return (
    <div className="py-20 md:py-32 bg-slate-950 text-slate-100">
      <ScrollObserver />
      <div className="container mx-auto px-6 space-y-12">
        <DevSection
          pageKey={PAGE_KEY}
          sectionId="profile"
          label="Profile"
          fallbackAccent="#2563eb"
          className="border border-slate-700 bg-slate-900 p-6"
        >
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="relative aspect-square w-full md:w-60 overflow-hidden rounded-3xl border border-slate-700">
              <Image
                src="/images/ashok.jpg"
                alt="Ashok Rimal"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl font-black text-white">
                ~/about — dev mode
              </h1>
              <p className="text-sm text-slate-200">
                Use the CLI to explore sections and view information.
              </p>
              <p className="font-mono text-sm text-emerald-300">
                gh issue list --state open
              </p>
            </div>
          </div>
        </DevSection>

        <DevSection
          pageKey={PAGE_KEY}
          sectionId="skills"
          label="Skills"
          fallbackAccent="#9333ea"
          className="bg-slate-900 border border-slate-700 p-6"
        >
          <ClassicAboutContent />
        </DevSection>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { mode } = useDevMode();

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        {mode === 'classic' ? <ClassicAboutContent /> : <DevAboutContent />}
      </Suspense>
    </ErrorBoundary>
  );
}
