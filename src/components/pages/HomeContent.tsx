import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SkeletonReveal from '@/components/SkeletonReveal';
import { Section } from '@/components/ui/Section';

const projects = [
  { number: '01', title: 'KaryaMantra', type: 'Productivity platform', description: 'A focused workspace for students to organize assignments and make progress visible.', tags: ['React', 'Firebase'] },
  { number: '02', title: 'BuyNepal', type: 'Commerce experience', description: 'A considered marketplace experience connecting local makers with modern shoppers.', tags: ['Next.js', 'Node.js'] },
  { number: '03', title: 'InsightHub', type: 'Knowledge platform', description: 'A data exchange product helping people and teams unlock the value of their knowledge.', tags: ['React Native', 'Express'] },
];

export default function HomeContent() {
  return (
    <SkeletonReveal variant="home">
      <div className="portfolio-home">
      <section className="hero-section shell-width" aria-labelledby="hero-heading">
        
        <div className="hero-editorial">
          <div className="hero-vertical"><span>Computer engineering student</span><span>2026</span></div>
          <div className="hero-copy-block"><div className="hero-stats"><span><strong>03+</strong><small>Projects shipped</small></span><span><strong>04</strong><small>Core disciplines</small></span></div><p className="eyebrow">Developer · designer · learner</p><h1 id="hero-heading" className="hero-heading">Hello<span>.</span></h1><p className="hero-subtitle">I&apos;m Ashok, a developer building calm, useful digital experiences.</p></div>
          <div className="hero-portrait"><div className="portrait-frame"><span className="portrait-initials" aria-hidden="true">AR</span></div><p>Butwal, Nepal<br />Available for thoughtful collaborations</p></div>
        </div>
        <div className="hero-meta"><span>Scroll to explore ↓</span><span>Selected work · 01 / 07</span></div>
      </section>

      <Section className="statement-section" aria-labelledby="statement-heading">
        <div className="statement-grid shell-width">
          <h2 id="statement-heading">Good work is quiet, <span>clear,</span> and useful.</h2>
          <div><p>My work sits between design and engineering. I enjoy turning a loose idea into a calm, reliable digital experience that feels obvious to use.</p><Link className="text-link" href="/about">More about my approach <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        </div>
      </Section>

      <section className="proof-section shell-width" aria-label="At a glance">
        <div className="proof-intro"><p className="section-label">A small dashboard of facts</p><p>Interfaces, systems, and experiments shaped by curiosity and care.</p></div>
        <div className="proof-grid">
          <div><strong>03+</strong><span>Selected projects</span></div>
          <div><strong>04</strong><span>Core disciplines</span></div>
          <div><strong>2026</strong><span>Graduating soon</span></div>
          <div><strong>100%</strong><span>Curiosity driven</span></div>
        </div>
      </section>

      <section className="work-section" aria-labelledby="work-heading">
        <div className="shell-width">
          <div className="section-heading"><div><p className="section-label">Selected work</p><h2 id="work-heading">A few things<br />I&apos;ve made.</h2></div><Link className="text-link" href="/projects">View all projects <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
          <div className="project-list project-bento">{projects.map((project, index) => <article className={`project-row project-card project-card-${index + 1}`} key={project.title}><span className="project-number">{project.number}</span><div className="project-main"><p className="project-type">{project.type}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><ArrowUpRight className="text-[var(--accent)]" size={20} aria-hidden="true" /></article>)}</div>
        </div>
      </section>

      <section className="media-sneak-peek-section shell-width" aria-labelledby="media-sneak-peek-heading"><div className="section-heading"><div><p className="section-label">Media / Sneak peek</p><h2 id="media-sneak-peek-heading">A little of<br /><span className="accent-text">everything.</span></h2></div><Link className="text-link" href="/media">View all <ArrowUpRight size={15} aria-hidden="true" /></Link></div><div className="media-sneak-peek-grid"><Link href="/gallery" className="home-media-card"><span className="section-label">Gallery</span><strong>Frames, places, and quiet details.</strong><span>View all <ArrowUpRight size={15} /></span></Link><Link href="/music" className="home-media-card"><span className="section-label">Music</span><strong>What is in rotation right now.</strong><span>View all <ArrowUpRight size={15} /></span></Link><Link href="/anime" className="home-media-card"><span className="section-label">Anime / manga</span><strong>Stories currently being watched and read.</strong><span>View all <ArrowUpRight size={15} /></span></Link><Link href="/github" className="home-media-card"><span className="section-label">GitHub</span><strong>Code, activity, and momentum.</strong><span>View all <ArrowUpRight size={15} /></span></Link></div></section>
      </div>
    </SkeletonReveal>
  );
}
