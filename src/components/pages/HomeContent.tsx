'use client';

import Link from 'next/link';
import { ArrowUpRight, Github, Linkedin, Mail, MapPin, MoveUpRight } from 'lucide-react';

export interface FeaturedProject {
  title: string;
  blurb: string;
  tech: string[];
  image: string;
}

export interface Certificate {
  name: string;
  image: string;
  scale: number;
}

export interface HomeContentProps {
  featuredProjects?: FeaturedProject[];
  certificates?: Certificate[];
}

const projects = [
  { number: '01', title: 'KaryaMantra', type: 'Productivity platform', description: 'A calm, focused workspace that helps students turn scattered assignments into steady progress.', tags: ['Product design', 'React', 'Firebase'] },
  { number: '02', title: 'BuyNepal', type: 'E-commerce experience', description: 'A marketplace concept connecting local makers with a simpler, more human online storefront.', tags: ['Next.js', 'Node.js', 'MongoDB'] },
  { number: '03', title: 'InsightHub', type: 'Knowledge platform', description: 'A collaborative data exchange for teams that want to make more value from what they know.', tags: ['React Native', 'Express', 'Socket.io'] },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label">{children}</p>;
}

export default function HomeContent() {
  return (
    <div className="portfolio-home">
      <section className="hero-section shell-width">
        <div className="hero-kicker"><span className="status-dot" /> Available for internships &amp; freelance work</div>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Developer · Designer · Learner</p>
            <h1 className="hero-heading">Building digital<br /><em>things that matter.</em></h1>
            <p className="hero-copy">I&apos;m Ashok Rimal, a computer engineering student and full-stack developer from Kathmandu. I care about thoughtful interfaces, useful products, and the details that make software feel human.</p>
            <div className="hero-actions">
              <Link href="/projects" className="button button-primary">Explore my work <ArrowUpRight size={16} /></Link>
              <Link href="/contact" className="button button-quiet">Let&apos;s talk <MoveUpRight size={16} /></Link>
            </div>
          </div>
          <div className="hero-aside">
            <div className="portrait-frame"><div className="portrait-initials">AR</div><span className="portrait-caption">Kathmandu<br />27° 42&apos; N</span></div>
            <p className="aside-note">Currently learning in public, building with intention, and looking for the next meaningful problem to solve.</p>
          </div>
        </div>
        <div className="hero-meta"><span><MapPin size={14} /> Kathmandu, Nepal</span><span>Scroll to explore ↓</span><span>01 — 05</span></div>
      </section>

      <section className="statement-section shell-width">
        <SectionLabel>01 / A little about me</SectionLabel>
        <div className="statement-grid"><h2>I turn curiosity into <span>clear, useful experiences.</span></h2><div><p>I enjoy working across the stack — from the first rough idea to the final polished interaction. My approach is equal parts engineering discipline and creative curiosity.</p><Link href="/about" className="text-link">More about my story <ArrowUpRight size={16} /></Link></div></div>
      </section>

      <section className="work-section shell-width">
        <div className="section-heading"><div><SectionLabel>02 / Selected work</SectionLabel><h2>A few things I&apos;ve made.</h2></div><Link href="/projects" className="text-link">View all projects <ArrowUpRight size={16} /></Link></div>
        <div className="project-list">{projects.map((project) => <article className="project-row" key={project.number}><span className="project-number">{project.number}</span><div className="project-main"><p className="project-type">{project.type}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><ArrowUpRight className="project-arrow" size={21} /></article>)}</div>
      </section>

      <section className="contact-section shell-width"><div className="contact-card"><SectionLabel>03 / Start a conversation</SectionLabel><h2>Have a good idea?<br /><em>Let&apos;s make it real.</em></h2><Link href="/contact" className="button button-primary">Get in touch <Mail size={16} /></Link><div className="social-links"><a href="https://github.com/ashokrimal" aria-label="GitHub"><Github size={18} /></a><a href="https://linkedin.com/in/ashokrimal" aria-label="LinkedIn"><Linkedin size={18} /></a><a href="mailto:hello@ashokrimal.com.np" aria-label="Email"><Mail size={18} /></a></div></div></section>
    </div>
  );
}
