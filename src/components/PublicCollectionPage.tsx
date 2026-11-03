'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, Download, Mail, MapPin } from 'lucide-react';
import { education, experience, profile, projects, skills } from '@/lib/portfolio-data';
import EmptyCollectionState from '@/components/EmptyCollectionState';

type Collection = 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'gallery';

const copy: Record<Collection, { eyebrow: string; title: string; intro: string }> = {
  experience: { eyebrow: '02 / Professional history', title: 'A career built through curiosity.', intro: 'A chronological view of the roles, responsibilities, and experiments shaping my path.' },
  education: { eyebrow: '03 / Education', title: 'Learning with intention.', intro: 'The classrooms and communities that gave me a foundation for building useful things.' },
  skills: { eyebrow: '04 / Skills & interests', title: 'Tools for turning ideas real.', intro: 'Owner-entered self-assessments across the technologies and disciplines I am actively exploring.' },
  projects: { eyebrow: '05 / Selected work', title: 'Things I have made.', intro: 'A growing archive of products, prototypes, and experiments. Status labels reflect where each idea stands today.' },
  certificates: { eyebrow: '06 / Certificates', title: 'Proof of steady progress.', intro: 'Credentials and learning milestones will live here as the library grows.' },
  gallery: { eyebrow: '07 / Gallery', title: 'Life between the commits.', intro: 'A visual collection of personal, professional, and behind-the-scenes moments.' },
};

export default function PublicCollectionPage({ type }: { type: Collection }) {
  const content = copy[type];
  return <main className="collection-page shell-width">
    <div className="collection-intro"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.intro}</p></div>
    {type === 'experience' && <Timeline items={experience} />}
    {type === 'education' && <Timeline items={education} />}
    {type === 'skills' && <div className="skill-grid">{skills.map((group) => <section className="skill-group" key={group.category}><p className="project-type">{group.category}</p>{group.items.map((item) => <div className="skill-item" key={item}><span>{item}</span><span className="skill-check"><Check size={13} /></span></div>)}</section>)}</div>}
    {type === 'projects' && <div className="collection-projects">{projects.map((project, index) => <article className="project-row" key={project.title}><span className="project-number">0{index + 1}</span><div className="project-main"><p className="project-type">{project.category} · {project.status}</p><h2>{project.title}</h2><p className="project-description">{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><ArrowUpRight size={20} /></article>)}</div>}
    {(type === 'certificates' || type === 'gallery') && <EmptyCollectionState eyebrow={`${content.eyebrow} / Empty`} title="The collection is taking shape." description="This section is ready for verified records and media to be added through the private owner dashboard." action={{ label: 'Have something to share', href: '/contact' }} />}
  </main>;
}

function Timeline({ items }: { items: { period: string; title: string; organization: string; description: string }[] }) {
  return <div className="timeline">{items.map((item) => <article className="timeline-item" key={`${item.title}-${item.organization}`}><div className="timeline-period">{item.period}</div><div className="timeline-dot" /><div className="timeline-content"><h2>{item.title}</h2><p className="timeline-org">{item.organization}</p><p>{item.description}</p></div></article>)}</div>;
}

export function ResumePage() {
  return <main className="resume-page shell-width"><div className="collection-intro"><p className="eyebrow">08 / Resume</p><h1>An evolving CV.</h1><p>A concise, portfolio-derived view of my experience, education, and current direction.</p><div className="hero-actions"><button className="button button-primary" type="button"><Download size={16} /> Download CV</button><Link className="button button-quiet" href="/contact"><Mail size={16} /> Contact me</Link></div></div><article className="resume-card"><header><div><p className="project-type">Curriculum vitae</p><h2>{profile.name}</h2><p>{profile.headline} · {profile.location}</p></div><MapPin size={20} /></header><section><p className="project-type">Profile</p><p>{profile.summary}</p></section><section><p className="project-type">Experience</p>{experience.map((item) => <div className="resume-line" key={item.title}><strong>{item.title}</strong><span>{item.organization} · {item.period}</span></div>)}</section><section><p className="project-type">Education</p>{education.slice(0, 1).map((item) => <div className="resume-line" key={item.title}><strong>{item.title}</strong><span>{item.organization}</span></div>)}</section></article></main>;
}
