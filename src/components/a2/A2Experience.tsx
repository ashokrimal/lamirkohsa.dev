'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowDown, ArrowUpRight, Github, MapPin, X } from 'lucide-react'
import { TechRadar } from './TechRadar'
import { createA2SceneState, type A2SceneState } from './A2Scene'
import type { A2Content } from '@/lib/a2-content'
import type { ProjectEntry } from '@/lib/projects'

const A2Scene = dynamic(() => import('./A2Scene').then((module) => module.A2Scene), {
  ssr: false,
})

const CHAPTERS = ['ENTRY', 'WORK', 'STACK', 'PATH', 'SIGNAL'] as const
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function splitWords(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.75, delay: reduceMotion ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function SectionHead({
  index,
  eyebrow,
  title,
  accent,
  children,
}: {
  index: string
  eyebrow: string
  title: string
  accent?: string
  children?: React.ReactNode
}) {
  return (
    <header className="a2-section-head">
      <div className="a2-section-index" aria-hidden="true">
        {index}
      </div>
      <div className="a2-section-copy">
        <p className="a2-eyebrow">{eyebrow}</p>
        <h2 className="a2-heading">
          {title} {accent && <em>{accent}</em>}
        </h2>
        {children}
      </div>
    </header>
  )
}

function ProjectDialog({
  project,
  onClose,
}: {
  project: ProjectEntry
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      className="a2-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.24 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.article
        className="a2-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a2-project-title"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.1 : 0.4, ease: EASE }}
      >
        <button type="button" className="a2-modal-close" onClick={onClose} aria-label="Close project">
          <X size={18} strokeWidth={1.6} />
        </button>

        {project.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="a2-modal-image" src={project.image} alt={project.altText || project.title} />
        )}

        <p className="a2-eyebrow">
          {project.category || 'Project'} {project.completionDate ? `· ${project.completionDate}` : ''}
        </p>
        <h2 id="a2-project-title">{project.title}</h2>
        <p className="a2-modal-lede">{project.summary}</p>
        <p className="a2-modal-body">{project.description || project.summary}</p>

        {project.techStack.length > 0 && (
          <ul className="a2-tags">
            {project.techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}

        <div className="a2-modal-actions">
          <Link href={project.slug ? `/projects/${project.slug}` : '/projects'} className="a2-button">
            Open case study <ArrowUpRight size={15} strokeWidth={1.7} />
          </Link>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="a2-ghost">
              <Github size={15} strokeWidth={1.6} /> Repository
            </a>
          )}
        </div>
      </motion.article>
    </motion.div>
  )
}

export default function A2Experience({ content }: { content: A2Content }) {
  const reduceMotion = useReducedMotion()
  const sceneRef = useRef<A2SceneState>(createA2SceneState())
  const chapterRefs = useRef<Array<HTMLElement | null>>([])
  const [chapter, setChapter] = useState(0)
  const [selected, setSelected] = useState<ProjectEntry | null>(null)
  const [sceneMounted, setSceneMounted] = useState(false)

  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const railScale = useTransform(smoothProgress, (value) => 0.04 + value * 0.96)

  const name = content.profile.fullName || content.brand.name || 'Portfolio'
  const role = content.profile.headline || content.brand.role || 'Creative technologist'
  const location = content.profile.location || content.contact.location || ''
  const availability = content.profile.availability || content.contact.availability || ''
  const email = content.profile.email || content.contact.email || ''
  const subtitle =
    content.hero.subtitle ||
    content.profile.summary ||
    'Interfaces, real-time 3D and the systems underneath them.'
  const heading = (content.hero.heading || `I'm ${name}`).replace(/\.$/, '')
  const headingWords = splitWords(heading)

  const projects = content.projects.slice(0, 6)
  const featuredProject = projects[0]
  const timeline = useMemo(
    () => [
      ...content.experience.map((entry) => ({ ...entry, kind: 'Experience' as const })),
      ...content.education.map((entry) => ({ ...entry, kind: 'Education' as const })),
    ],
    [content.experience, content.education],
  )

  useEffect(() => {
    setSceneMounted(true)
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    sceneRef.current.progress = value
  })

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      sceneRef.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      sceneRef.current.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  useEffect(() => {
    const nodes = chapterRefs.current.filter((node): node is HTMLElement => Boolean(node))
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = nodes.indexOf(entry.target as HTMLElement)
          if (index >= 0) setChapter(index)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const closeProject = useCallback(() => {
    setSelected(null)
    sceneRef.current.burst = 0
  }, [])

  const openProject = useCallback((project: ProjectEntry) => {
    setSelected(project)
    sceneRef.current.burst = 1
  }, [])

  return (
    <div className="a2">
      <div className="a2-canvas" aria-hidden="true">
        {sceneMounted && <A2Scene state={sceneRef} />}
      </div>
      <div className="a2-veil" aria-hidden="true" />

      <header className="a2-nav">
        <Link href="/" className="a2-brand" aria-label={`${name} — classic site`}>
          <span className="a2-brand-mark">{(content.hero.heading ? 'A2' : name.slice(0, 2)).toUpperCase()}</span>
          <span className="a2-brand-copy">
            {name}
            <small>{role}</small>
          </span>
        </Link>

        <nav className="a2-nav-links" aria-label="3D edition sections">
          {CHAPTERS.map((label, index) => (
            <a key={label} href={`#a2-${index}`} data-active={chapter === index ? 'true' : undefined}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {label}
            </a>
          ))}
        </nav>

        <Link href="/" className="a2-exit">
          Classic site <ArrowUpRight size={14} strokeWidth={1.6} />
        </Link>
      </header>

      <div className="a2-rail" aria-hidden="true">
        <motion.span style={{ scaleY: railScale }} />
        <small>{String(chapter + 1).padStart(2, '0')} / 05</small>
      </div>

      <main className="a2-main">
        {/* ENTRY */}
        <section
          className="a2-chapter a2-hero"
          id="a2-0"
          ref={(node) => {
            chapterRefs.current[0] = node
          }}
        >
          <div className="a2-hero-inner">
            <motion.p
              className="a2-eyebrow a2-hero-eyebrow"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <span className="a2-pulse" aria-hidden="true" />
              {role.toUpperCase()}
              {location ? ` / ${location.toUpperCase()}` : ''}
            </motion.p>

            <h1 className="a2-title">
              {headingWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  className={index === headingWords.length - 1 ? 'a2-title-accent' : undefined}
                  initial={reduceMotion ? false : { opacity: 0, y: 44, rotateX: -35 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 + index * 0.08, ease: EASE }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="a2-lede"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="a2-actions"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
            >
              <a href="#a2-1" className="a2-button">
                Explore the work <ArrowDown size={15} strokeWidth={1.8} />
              </a>
              <a href="#a2-4" className="a2-ghost">
                Start a conversation <ArrowUpRight size={14} strokeWidth={1.6} />
              </a>
            </motion.div>

            <motion.dl
              className="a2-hero-stats"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
            >
              <div>
                <dt>Projects</dt>
                <dd>{content.projects.length}</dd>
              </div>
              <div>
                <dt>Disciplines</dt>
                <dd>{content.skills.length}</dd>
              </div>
              <div>
                <dt>Frames</dt>
                <dd>{content.photos.length}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className="a2-live">{availability || 'Open'}</dd>
              </div>
            </motion.dl>
          </div>

          {featuredProject && (
            <motion.div
              className="a2-hero-card"
              initial={reduceMotion ? false : { opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            >
              <span>Latest signal</span>
              <strong>{featuredProject.title}</strong>
              <p>{featuredProject.summary}</p>
              <button type="button" onClick={() => openProject(featuredProject)}>
                Inspect <ArrowUpRight size={13} strokeWidth={1.7} />
              </button>
            </motion.div>
          )}
        </section>

        {/* WORK */}
        <section
          className="a2-chapter"
          id="a2-1"
          ref={(node) => {
            chapterRefs.current[1] = node
          }}
        >
          <SectionHead index="01" eyebrow="Selected work" title="Built with" accent="intent.">
            <p className="a2-body">
              Case studies from discovery to deployment. Open any card for the short version, or jump
              into the full study.
            </p>
          </SectionHead>

          {projects.length === 0 ? (
            <p className="a2-empty">Published projects appear here as soon as the studio has one.</p>
          ) : (
            <div className="a2-project-grid">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 0.05} className="a2-project-cell">
                  <motion.article
                    className="a2-project"
                    whileHover={reduceMotion ? undefined : { y: -6 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <button type="button" className="a2-project-open" onClick={() => openProject(project)}>
                      <span className="a2-project-index">{String(index + 1).padStart(2, '0')}</span>
                      {project.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="a2-project-image"
                          src={project.image}
                          alt={project.altText || project.title}
                          loading="lazy"
                        />
                      ) : (
                        <span className="a2-project-plate" aria-hidden="true">
                          {project.title.slice(0, 1)}
                        </span>
                      )}
                      <span className="a2-project-meta">
                        <strong>{project.title}</strong>
                        <small>{project.category || project.status || 'Project'}</small>
                      </span>
                      <span className="a2-project-arrow">
                        <ArrowUpRight size={17} strokeWidth={1.6} />
                      </span>
                    </button>
                    <p className="a2-project-summary">{project.summary}</p>
                    {project.techStack.length > 0 && (
                      <ul className="a2-tags">
                        {project.techStack.slice(0, 4).map((tech) => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>
                    )}
                  </motion.article>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* STACK */}
        <section
          className="a2-chapter"
          id="a2-2"
          ref={(node) => {
            chapterRefs.current[2] = node
          }}
        >
          <SectionHead index="02" eyebrow="Toolkit" title="A stack with" accent="range.">
            <p className="a2-body">
              The split below is calculated live from the published projects, so it changes whenever
              the work does.
            </p>
          </SectionHead>

          <div className="a2-stack-grid">
            <Reveal className="a2-stack-diagram">
              <TechRadar projects={content.projects} />
            </Reveal>

            <div className="a2-skill-groups">
              {content.skills.length === 0 ? (
                <p className="a2-empty">Skill groups appear here once they are published.</p>
              ) : (
                content.skills.map((group, index) => (
                  <Reveal key={group.id} delay={index * 0.04}>
                    <article className="a2-skill">
                      <header>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h3>{group.category}</h3>
                      </header>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                ))
              )}
            </div>
          </div>
        </section>

        {/* PATH */}
        <section
          className="a2-chapter"
          id="a2-3"
          ref={(node) => {
            chapterRefs.current[3] = node
          }}
        >
          <SectionHead index="03" eyebrow="The path" title="Practice, then" accent="proof.">
            <p className="a2-body">Roles and classrooms that turned curiosity into working systems.</p>
          </SectionHead>

          {timeline.length === 0 ? (
            <p className="a2-empty">Timeline entries appear here once experience or education is published.</p>
          ) : (
            <ol className="a2-timeline">
              {timeline.map((entry, index) => (
                <Reveal key={`${entry.kind}-${entry.id}`} delay={index * 0.05}>
                  <li className="a2-timeline-item">
                    <span className="a2-timeline-node" aria-hidden="true" />
                    <div className="a2-timeline-meta">
                      <span className="a2-timeline-kind">{entry.kind}</span>
                      <span>{entry.period}</span>
                    </div>
                    <h3>{entry.title}</h3>
                    <p className="a2-timeline-org">
                      {entry.organization}
                      {entry.location ? ` · ${entry.location}` : ''}
                    </p>
                    {entry.description && <p className="a2-body">{entry.description}</p>}
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </section>

        {/* SIGNAL */}
        <section
          className="a2-chapter"
          id="a2-4"
          ref={(node) => {
            chapterRefs.current[4] = node
          }}
        >
          <SectionHead index="04" eyebrow="Signal" title="Let's make something" accent="unreal.">
            <p className="a2-body">
              A product, a story, or a strange idea that needs a home on the internet — the channel is
              open.
            </p>
          </SectionHead>

          <div className="a2-contact">
            {email && (
              <Reveal>
                <a className="a2-email" href={`mailto:${email}`}>
                  {email}
                  <ArrowUpRight size={26} strokeWidth={1.2} />
                </a>
              </Reveal>
            )}

            <Reveal delay={0.1}>
              <div className="a2-contact-meta">
                {location && (
                  <span>
                    <MapPin size={13} strokeWidth={1.6} /> {location}
                  </span>
                )}
                {content.socials.map((social) => (
                  <a key={`${social.label}-${social.href}`} href={social.href} target="_blank" rel="noreferrer">
                    {social.label} <ArrowUpRight size={12} strokeWidth={1.6} />
                  </a>
                ))}
                <Link href="/">
                  Classic portfolio <ArrowUpRight size={12} strokeWidth={1.6} />
                </Link>
              </div>
            </Reveal>
          </div>

          {content.photos.length > 0 && (
            <div className="a2-marquee" aria-label="Photography">
              <motion.div
                className="a2-marquee-row"
                animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
                transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
              >
                {[...content.photos, ...content.photos].map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${photo.id}-${index}`}
                    src={photo.imageUrl}
                    alt={photo.altText || photo.title}
                    loading="lazy"
                  />
                ))}
              </motion.div>
            </div>
          )}

          <footer className="a2-footer">
            <span>© {new Date().getFullYear()} {name}</span>
            <span>{location}</span>
            <span>Three.js / Framer Motion / Next.js</span>
          </footer>
        </section>
      </main>

      <AnimatePresence>{selected && <ProjectDialog project={selected} onClose={closeProject} />}</AnimatePresence>
    </div>
  )
}
