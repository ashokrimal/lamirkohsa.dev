import Link from 'next/link';
import { ArrowUpRight, Download, Linkedin, Github } from 'lucide-react';

const projects = [
  { number: '01', title: 'KaryaMantra', type: 'Productivity platform', description: 'A focused workspace for students to organize assignments and make progress visible.', tags: ['React', 'Firebase'] },
  { number: '02', title: 'BuyNepal', type: 'Commerce experience', description: 'A considered marketplace experience connecting local makers with modern shoppers.', tags: ['Next.js', 'Node.js'] },
  { number: '03', title: 'InsightHub', type: 'Knowledge platform', description: 'A data exchange product helping people and teams unlock the value of their knowledge.', tags: ['React Native', 'Express'] },
];

export default function HomeContent() {
  return (
    <div className="portfolio-home">
      <section className="hero-section shell-width" aria-labelledby="hero-heading">
        <div className="hero-kicker"><span className="status-dot" aria-hidden="true" /> Open to internships and thoughtful collaborations</div>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Digital creator · developer · learner</p>
            <h1 id="hero-heading" className="hero-heading">Building <em>useful</em><br />things for people.</h1>
            <p className="hero-copy">I&apos;m Ashok Rimal, a developer and Computer Engineering student from Kathmandu. I care about clear interfaces, thoughtful systems, and work that earns its place in the world.</p>
            <div className="hero-actions">
              <Link href="/projects" className="button button-primary">View selected work <ArrowUpRight size={15} aria-hidden="true" /></Link>
              <Link href="/resume" className="button button-quiet"><Download size={15} aria-hidden="true" /> Download CV</Link>
            </div>
          </div>
          <div className="hero-aside">
            <div className="portrait-frame"><span className="portrait-initials" aria-hidden="true">AR</span><span className="portrait-caption">Kathmandu<br />Nepal · 2026</span></div>
            <p className="aside-note">Currently learning in public, building with care, and looking for the next meaningful problem to solve.</p>
          </div>
        </div>
        <div className="hero-meta"><span><span className="status-dot" aria-hidden="true" /> Available for opportunities</span><span>Scroll to explore ↓</span><span>01 / 07</span></div>
      </section>

      <section className="statement-section" aria-labelledby="statement-heading">
        <div className="statement-grid shell-width">
          <h2 id="statement-heading">Good work is quiet, <span>clear,</span> and useful.</h2>
          <div><p>My work sits between design and engineering. I enjoy turning a loose idea into a calm, reliable digital experience that feels obvious to use.</p><Link className="text-link" href="/about">More about my approach <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        </div>
      </section>

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

      <section className="contact-section shell-width" aria-labelledby="contact-heading"><div className="contact-card"><p className="section-label">Have a good question?</p><h2 id="contact-heading">Let&apos;s make<br /><em>something matter.</em></h2><Link href="/contact" className="button button-primary">Start a conversation <ArrowUpRight size={15} aria-hidden="true" /></Link><div className="social-links"><Link href="https://github.com/ashokrimal" aria-label="Ashok on GitHub"><Github size={17} /></Link><Link href="https://linkedin.com/in/ashokrimal" aria-label="Ashok on LinkedIn"><Linkedin size={17} /></Link></div></div></section>
    </div>
  );
}
