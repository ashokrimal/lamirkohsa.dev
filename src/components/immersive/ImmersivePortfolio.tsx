'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, X } from 'lucide-react';
import { CanvasLoader } from './CanvasLoader';
import {
  IMMERSIVE_EASE,
  ImmersiveChapterHUDText,
  ImmersiveChapterSequence,
  ImmersiveChromeReveal,
  ImmersiveMotionRoot,
  ImmersiveRevealItem,
  ImmersiveScrollGlide,
} from './ImmersiveMotion';
import { PortfolioScene } from './PortfolioScene';
import { ScrollDirector } from './ScrollDirector';
import { IMMERSIVE_CHAPTERS, IMMERSIVE_PROJECTS, type ImmersiveProject } from './data';
import { createRigState } from './rig';

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
  const [sceneMounted, setSceneMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setSceneMounted(true);
  }, []);

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
    <ImmersiveMotionRoot>
      <div ref={rootRef} className="immersive">
        <div className="immersive-canvas" aria-hidden="true">
          {sceneMounted && <PortfolioScene rig={rig} onOpenProject={setSelectedProject} />}
        </div>
        <div className="immersive-vignette" aria-hidden="true" />
        <div className="immersive-grain" aria-hidden="true" />

        <motion.header
          className="immersive-nav"
          initial={reduceMotion ? false : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: IMMERSIVE_EASE }}
        >
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

          <Link href="/" className="immersive-exit">
            CLASSIC SITE <ArrowUpRight size={13} strokeWidth={1.6} />
          </Link>
        </motion.header>

        <motion.div
          className="immersive-progress"
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: IMMERSIVE_EASE }}
        >
          <span className="immersive-chapter-number">
            <ImmersiveChapterHUDText valueKey={`num-${chapter}`}>
              0{chapter + 1}
            </ImmersiveChapterHUDText>
          </span>
          <span className="immersive-progress-track">
            <span ref={progressBarRef} />
          </span>
          <span className="immersive-progress-total">05</span>
          <small>
            <ImmersiveChapterHUDText valueKey={`label-${chapter}`}>
              {IMMERSIVE_CHAPTERS[chapter]}
            </ImmersiveChapterHUDText>
          </small>
        </motion.div>

        <ScrollDirector
          rootRef={rootRef}
          rig={rig}
          progressBarRef={progressBarRef}
          onChapter={setChapter}
        />

        <main className="immersive-main">
          <section className="chapter chapter--hero" id="top">
            <ImmersiveChapterSequence mode="mount" stagger={0.09} delay={0.14} className="chapter-inner hero-copy">
              <ImmersiveRevealItem distance={14}>
                <p className="immersive-eyebrow">
                  <span className="immersive-signal" />
                  FULL-STACK CREATIVE TECHNOLOGIST / KATHMANDU
                </p>
              </ImmersiveRevealItem>

              <ImmersiveRevealItem distance={26}>
                <h1 className="immersive-title">
                  I BUILD
                  <br />
                  <em>WORLDS</em>
                  <br />
                  THAT MOVE.
                </h1>
              </ImmersiveRevealItem>

              <ImmersiveRevealItem distance={18}>
                <p className="immersive-lede">
                  I&apos;m Ashok Rimal. I design and engineer digital experiences where considered
                  interfaces meet real-time 3D, motion, and systems that hold up.
                </p>
              </ImmersiveRevealItem>

              <ImmersiveRevealItem distance={16}>
                <div className="immersive-actions">
                  <a href="#work" className="immersive-button">
                    EXPLORE THE WORK
                    <ArrowDown size={15} strokeWidth={1.7} />
                  </a>
                  <a href="#contact" className="immersive-link">
                    START A CONVERSATION <ArrowUpRight size={14} strokeWidth={1.6} />
                  </a>
                </div>
              </ImmersiveRevealItem>

              <ImmersiveRevealItem distance={12}>
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
              </ImmersiveRevealItem>
            </ImmersiveChapterSequence>

            <ImmersiveChromeReveal direction="up" delay={0.45} className="hero-side">
              <span>27.7172° N / 85.3240° E</span>
              <i />
              <span>PORTFOLIO — VOL. 03</span>
            </ImmersiveChromeReveal>
          </section>

          <section className="chapter chapter--projects" id="work">
            {/* Keep .project-copy untransformed so CSS position: sticky stays active across 300vh */}
            <div className="chapter-inner project-copy">
              <ImmersiveChapterSequence mode="inView" stagger={0.085}>
                <ImmersiveRevealItem distance={16}>
                  <p className="immersive-eyebrow">
                    <span className="immersive-signal" />
                    01 / SELECTED WORK
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={24}>
                  <h2 className="immersive-heading">
                    INTERFACES
                    <br />
                    WITH <em>A PULSE.</em>
                  </h2>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={18}>
                  <p className="immersive-body">
                    Two products built around real questions: how money should feel, and how a
                    film culture should be remembered. Turn the cards in the scene, or open a case
                    here.
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={16}>
                  <div className="project-index">
                    {IMMERSIVE_PROJECTS.map((project, index) => (
                      <motion.button
                        key={project.id}
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        style={{ '--project-accent': project.accent } as CSSProperties}
                        initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: 0.6,
                          delay: reduceMotion ? 0 : 0.18 + index * 0.08,
                          ease: IMMERSIVE_EASE,
                        }}
                        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                      >
                        <span>{project.index}</span>
                        <strong>{project.title}</strong>
                        <span>{project.category}</span>
                        <ArrowUpRight size={15} strokeWidth={1.5} />
                      </motion.button>
                    ))}
                  </div>
                </ImmersiveRevealItem>
              </ImmersiveChapterSequence>
            </div>
          </section>

          <section className="chapter chapter--studio" id="studio">
            <ImmersiveScrollGlide className="chapter-inner" range={22}>
              <ImmersiveChapterSequence mode="inView" stagger={0.085}>
                <ImmersiveRevealItem distance={16}>
                  <p className="immersive-eyebrow">
                    <span className="immersive-signal" />
                    02 / THE STUDIO
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={24}>
                  <h2 className="immersive-heading">
                    A DESK BUILT
                    <br />
                    FOR <em>DEEP WORK.</em>
                  </h2>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={18}>
                  <p className="immersive-body">
                    The work is equal parts architecture and atmosphere. I move between product
                    thinking, interface design, and the technical details that make an idea feel
                    inevitable.
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={16}>
                  <div className="studio-readout">
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.55, delay: 0.08, ease: IMMERSIVE_EASE }}
                    >
                      <span>BASED IN</span>
                      <strong>Butwal, NP</strong>
                    </motion.div>
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.55, delay: 0.16, ease: IMMERSIVE_EASE }}
                    >
                      <span>FOCUS</span>
                      <strong>Products / 3D / Systems</strong>
                    </motion.div>
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.55, delay: 0.24, ease: IMMERSIVE_EASE }}
                    >
                      <span>STATUS</span>
                      <strong className="is-live">Open to select work</strong>
                    </motion.div>
                  </div>
                </ImmersiveRevealItem>
              </ImmersiveChapterSequence>
            </ImmersiveScrollGlide>
          </section>

          <section className="chapter chapter--stack" id="stack">
            <ImmersiveScrollGlide className="chapter-inner stack-copy" range={22}>
              <ImmersiveChapterSequence mode="inView" stagger={0.08}>
                <ImmersiveRevealItem distance={16}>
                  <p className="immersive-eyebrow">
                    <span className="immersive-signal" />
                    03 / TOOLKIT
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={24}>
                  <h2 className="immersive-heading">
                    FULL STACK.
                    <br />
                    FULL <em>FRAME.</em>
                  </h2>
                </ImmersiveRevealItem>

                <div className="toolkit-grid">
                  {TOOLKIT.map((item) => (
                    <ImmersiveRevealItem key={item.number} as="article" distance={18}>
                      <span>{item.number}</span>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </ImmersiveRevealItem>
                  ))}
                </div>
              </ImmersiveChapterSequence>
            </ImmersiveScrollGlide>
          </section>

          <section className="chapter chapter--contact" id="contact">
            <ImmersiveScrollGlide className="chapter-inner contact-copy" range={18}>
              <ImmersiveChapterSequence mode="inView" stagger={0.085}>
                <ImmersiveRevealItem distance={16}>
                  <p className="immersive-eyebrow">
                    <span className="immersive-signal" />
                    04 / SIGNAL
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={24}>
                  <h2 className="immersive-heading">
                    LET&apos;S MAKE
                    <br />
                    SOMETHING <em>UNREAL.</em>
                  </h2>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={18}>
                  <p className="immersive-body">
                    Have a product, a story, or a strange idea that needs a home on the internet?
                    The signal is open.
                  </p>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={16}>
                  <a className="contact-email" href="mailto:info.ashokrimal@gmail.com">
                    info.ashokrimal@gmail.com
                    <ArrowUpRight size={26} strokeWidth={1.2} />
                  </a>
                </ImmersiveRevealItem>

                <ImmersiveRevealItem distance={14}>
                  <div className="contact-links">
                    <a href="https://github.com/ashokrimal" target="_blank" rel="noreferrer">
                      GITHUB <ArrowUpRight size={13} strokeWidth={1.5} />
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                      LINKEDIN <ArrowUpRight size={13} strokeWidth={1.5} />
                    </a>
                    <Link href="/">
                      CLASSIC PORTFOLIO <ArrowUpRight size={13} strokeWidth={1.5} />
                    </Link>
                  </div>
                </ImmersiveRevealItem>
              </ImmersiveChapterSequence>
            </ImmersiveScrollGlide>

            <motion.footer
              className="immersive-footer"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, ease: IMMERSIVE_EASE }}
            >
              <span>© {new Date().getFullYear()} ASHOK RIMAL</span>
              <span>DESIGNED + BUILT IN KATHMANDU</span>
              <span>THREE.JS / FRAMER MOTION / NEXT.JS</span>
            </motion.footer>
          </section>
        </main>

        <CanvasLoader />

        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="project-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: IMMERSIVE_EASE }}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) setSelectedProject(null);
              }}
            >
              <motion.article
                className="project-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-modal-title"
                style={{ '--project-accent': selectedProject.accent } as CSSProperties}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 20, scale: 0.97 }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 14, scale: 0.98 }
                }
                transition={{ duration: reduceMotion ? 0.12 : 0.36, ease: IMMERSIVE_EASE }}
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
                  <button
                    type="button"
                    className="immersive-link"
                    onClick={() => setSelectedProject(null)}
                  >
                    BACK TO THE SCENE
                  </button>
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ImmersiveMotionRoot>
  );
}
