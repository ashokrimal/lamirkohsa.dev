import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ArrowUpRight, Code2, Layers3, Sparkles } from 'lucide-react'
import { getHeroImage } from '@/app/actions/content-cms'
import SkeletonReveal from '@/components/SkeletonReveal'

const projects = [
  { number: '01', title: 'KaryaMantra', type: 'Productivity platform', description: 'A focused workspace that helps students turn scattered assignments into visible progress.', tags: ['React', 'Firebase'], icon: Layers3 },
  { number: '02', title: 'BuyNepal', type: 'Commerce experience', description: 'A marketplace concept connecting local makers with a more considered online shopping experience.', tags: ['Next.js', 'Node.js'], icon: Sparkles },
  { number: '03', title: 'InsightHub', type: 'Knowledge platform', description: 'A product for making shared knowledge easier to discover, use, and build on.', tags: ['React Native', 'Express'], icon: Code2 },
]

export default async function HomeContent() {
  const heroImage = await getHeroImage()
  const heroStyle = heroImage ? { '--hero-image': `url("${heroImage}")` } as CSSProperties : undefined
  return <SkeletonReveal variant="home"><div className="portfolio-home home-redesign">
    <section className="hero-section shell-width" style={heroStyle} aria-labelledby="hero-heading"><div className="hero-editorial"><div className="hero-vertical"><span>BCA student</span><span>Portfolio</span></div><div className="hero-copy-block"><div className="hero-stats"><span><strong>03+</strong><small>Selected projects</small></span><span><strong>04</strong><small>Creative disciplines</small></span></div><p className="eyebrow">Developer · designer · learner</p><h1 id="hero-heading" className="hero-heading">Hello<span>.</span></h1><p className="hero-subtitle">I&apos;m Ashok, a developer building calm, useful digital experiences.</p></div><div className="hero-portrait"><div className="portrait-frame"><span className="portrait-initials" aria-hidden="true">AR</span></div><p>Butwal, Nepal<br />Available for thoughtful collaborations</p></div></div><div className="hero-meta"><span>Scroll to explore ↓</span><span>Selected work · 01 / 07</span></div></section>
    <section className="home-intent shell-width" aria-labelledby="intent-heading"><div><p className="section-label">The point of view</p><h2 id="intent-heading">Useful by design.<br /><span className="accent-text">Quietly ambitious.</span></h2></div><div className="intent-copy"><p>I like the space between a rough idea and the moment it becomes obvious to use.</p><Link href="/about" className="text-link">Read the approach <ArrowUpRight aria-hidden="true" /></Link></div></section>
    <section className="home-work shell-width" aria-labelledby="work-heading"><div className="section-heading"><div><p className="section-label">Selected work</p><h2 id="work-heading">Small ideas,<br /><span className="accent-text">made real.</span></h2></div><Link href="/projects" className="text-link">Browse the archive <ArrowUpRight aria-hidden="true" /></Link></div><div className="home-project-grid">{projects.map((project) => { const Icon = project.icon; return <article className="home-project-card" key={project.title}><div className="project-card-top"><span>{project.number}</span><Icon aria-hidden="true" /></div><div className="project-card-diagram" aria-hidden="true"><span /><span /><span /></div><p className="project-type">{project.type}</p><h3>{project.title}</h3><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article> })}</div></section>
    <section className="home-practice shell-width" aria-labelledby="practice-heading"><div><p className="section-label">How I work</p><h2 id="practice-heading">From question<br /><span className="accent-text">to clarity.</span></h2></div><div className="practice-steps"><article><span>01</span><h3>Listen closely</h3><p>Start with the real problem, not the loudest request.</p></article><article><span>02</span><h3>Shape the system</h3><p>Turn complexity into a flow that feels easy to trust.</p></article><article><span>03</span><h3>Make it useful</h3><p>Ship the smallest thoughtful version and keep learning.</p></article></div></section>
    <section className="home-footer-note shell-width"><p className="section-label">Next / About</p><Link href="/about">A little more about the person behind the work <ArrowUpRight aria-hidden="true" /></Link></section>
  </div></SkeletonReveal>
}
