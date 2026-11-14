'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, X } from 'lucide-react';
import { CanvasLoader } from './CanvasLoader';
import { ScrollDirector } from './ScrollDirector';
import { IMMERSIVE_CHAPTERS, IMMERSIVE_PROJECTS, type ImmersiveProject } from './data';
import { createRigState } from './rig';

const PortfolioScene = dynamic(
  () => import('./PortfolioScene').then((module) => module.PortfolioScene),
  { ssr: false, loading: () => null },
);

const TOOLKIT = [
  { number: '01', title: 'Interface', body: 'React, Next.js, TypeScript, Tailwind — fast products with a point of view.' },
  { number: '02', title: 'Dimension', body: 'Three.js, R3F, Drei, GLSL — space, light, and motion with weight.' },
  { number: '03', title: 'Motion', body: 'GSAP, ScrollTrigger, spring physics — pacing that makes a page feel alive.' },
  { number: '04', title: 'Substance', body: 'Postgres, Drizzle, Node — the quiet systems that make an experience real.' },
];

export default function ImmersivePortfolio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rig = useRef(createRigState());
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const [chapter, setChapter] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ImmersiveProject | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <div ref={rootRef} className="immersive">
      <div className="immersive-canvas" aria-hidden="true">
        <PortfolioScene rig={rig} onOpenProject={setSelectedProject} />
      </div>
      <div className="immersive-vignette" aria-hidden="true" />
      <div className="immersive-grain" aria-hidden="true" />

      <header className="immersive-nav">
        <Link href="/" className="immersive-brand" aria-label="Ashok Rimal — home">
          <span className="immersive-brand-mark">AR</span>
          <span className="immersive-brand-copy">
            ASHOK RIMAL
            <small>CREATIVE TECHNOLOGIST</small>
          </span>
        </Link>

        <nav className="immersive-nav-links" aria-label="Immersive portfolio sections">
          <a href="#work">Work</a>
          <a href="#studio">Studio</a>
          <a href="#stack">Toolkit</a>
          <a href="#contact">Contact</a>
        </nav>

        <Link href="/classic" className="immersive-exit">
          CLASSIC SITE <ArrowUpRight size={13} strokeWidth={1.6} />
        </Link>
      </header>

      <div className="immersive-progress" aria-hidden="true">
        <span className="immersive-chapter-number">0{chapter + 1}</span>
        <span className="immersive-progress-track">
          <span ref={progressBarRef} />
        </span>
        <span className="immersive-progress-total">05</span>
        <small>{IMMERSIVE_CHAPTERS[chapter]}</small>
      </div>

      <ScrollDirector
        rootRef={rootRef}
        rig={rig}
        progressBarRef={progressBarRef}
        onChapter={setChapter}
      />

      <main className="immersive-main">
        <section className="chapter chapter--hero" id="top">
          <div className="chapter-inner hero-copy">
            <p className="immersive-eyebrow">
              <span className="immersive-signal" />
              FULL-STACK CREATIVE TECHNOLOGIST / KATHMANDU
            </p>

            <h1 className="immersive-title">
              I BUILD
              <br />
              <em>WORLDS</em>
              <br />
              THAT MOVE.
            </h1>

            <p className="immersive-lede">
              I&apos;m Ashok Rimal. I design and engineer digital experiences where considered
              interfaces meet real-time 3D, motion, and systems that hold up.
            </p>

            <div className="immersive-actions">
              <a href="#work" className="immersive-button">
                EXPLORE THE WORK
                <ArrowDown size={15} strokeWidth={1.7} />
              </a>
              <a href="#contact" className="immersive-link">
                START A CONVERSATION <ArrowUpRight size={14} strokeWidth={1.6} />
              </a>
            </div>

            <div className="hero-meta">
              <span>
                <b>05</b> CHAPTERS
              </span>
              <span>
                <b>01</b> CANVAS
              </span>
              <span>
                <b>∞</b> CURIOSITY
              </span>
              <span className="hero-scroll-note">SCROLL TO ENTER</span>
            </div>
          </div>

          <div className="hero-side" aria-hidden="true">
            <span>27.7172° N / 85.3240° E</span>
            <i />
            <span>PORTFOLIO — VOL. 03</span>
          </div>
        </section>

        <section className="chapter chapter--projects" id="work">
          <div className="chapter-inner project-copy">
            <p className="immersive-eyebrow">
              <span className="immersive-signal" />
              01 / SELECTED WORK
            </p>
            <h2 className="immersive-heading">
              INTERFACES
              <br />
              WITH <em>A PULSE.</em>
            </h2>
            <p className="immersive-body">
              Two products built around real questions: how money should feel, and how a
              film culture should be remembered. Turn the cards in the scene, or open a case
              here.
            </p>

            <div className="project-index">
              {IMMERSIVE_PROJECTS.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  style={{ '--project-accent': project.accent } as CSSProperties}
                >
                  <span>{project.index}</span>
                  <strong>{project.title}</strong>
                  <span>{project.category}</span>
                  <ArrowUpRight size={15} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="chapter chapter--studio" id="studio">
          <div className="chapter-inner">
            <p className="immersive-eyebrow">
              <span className="immersive-signal" />
              02 / THE STUDIO
            </p>
            <h2 className="immersive-heading">
              A DESK BUILT
              <br />
              FOR <em>DEEP WORK.</em>
            </h2>
            <p className="immersive-body">
              The work is equal parts architecture and atmosphere. I move between product
              thinking, interface design, and the technical details that make an idea feel
              inevitable.
            </p>

            <div className="studio-readout">
              <div>
                <span>BASED IN</span>
                <strong>Kathmandu, NP</strong>
              </div>
              <div>
                <span>FOCUS</span>
                <strong>Products / 3D / Systems</strong>
              </div>
              <div>
                <span>STATUS</span>
                <strong className="is-live">Open to select work</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="chapter chapter--stack" id="stack">
          <div className="chapter-inner stack-copy">
            <p className="immersive-eyebrow">
              <span className="immersive-signal" />
              03 / TOOLKIT
            </p>
            <h2 className="immersive-heading">
              FULL STACK.
              <br />
              FULL <em>FRAME.</em>
            </h2>

            <div className="toolkit-grid">
              {TOOLKIT.map((item) => (
                <article key={item.number}>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="chapter chapter--contact" id="contact">
          <div className="chapter-inner contact-copy">
            <p className="immersive-eyebrow">
              <span className="immersive-signal" />
              04 / SIGNAL
            </p>
            <h2 className="immersive-heading">
              LET&apos;S MAKE
              <br />
              SOMETHING <em>UNREAL.</em>
            </h2>
            <p className="immersive-body">
              Have a product, a story, or a strange idea that needs a home on the internet?
              The signal is open.
            </p>

            <a className="contact-email" href="mailto:info.ashokrimal@gmail.com">
              info.ashokrimal@gmail.com
              <ArrowUpRight size={26} strokeWidth={1.2} />
            </a>

            <div className="contact-links">
              <a href="https://github.com/ashokrimal" target="_blank" rel="noreferrer">
                GITHUB <ArrowUpRight size={13} strokeWidth={1.5} />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                LINKEDIN <ArrowUpRight size={13} strokeWidth={1.5} />
              </a>
              <Link href="/classic">
                CLASSIC PORTFOLIO <ArrowUpRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <footer className="immersive-footer">
            <span>© {new Date().getFullYear()} ASHOK RIMAL</span>
            <span>DESIGNED + BUILT IN KATHMANDU</span>
            <span>THREE.JS / GSAP / NEXT.JS</span>
          </footer>
        </section>
      </main>

      <CanvasLoader />

      {selectedProject && (
        <div
          className="project-modal-backdrop"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProject(null);
          }}
        >
          <article
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            style={{ '--project-accent': selectedProject.accent } as CSSProperties}
          >
            <button
              type="button"
              className="project-modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <p className="project-modal-kicker">
              {selectedProject.index} / {selectedProject.category} / {selectedProject.year}
            </p>
            <h2 id="project-modal-title">{selectedProject.title}</h2>
            <p className="project-modal-subtitle">{selectedProject.subtitle}</p>
            <p className="project-modal-body">{selectedProject.description}</p>

            <div className="project-modal-stack">
              {selectedProject.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="project-modal-actions">
              <Link href={selectedProject.href} className="immersive-button">
                VIEW ALL PROJECTS
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </Link>
              <button type="button" className="immersive-link" onClick={() => setSelectedProject(null)}>
                BACK TO THE SCENE
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
