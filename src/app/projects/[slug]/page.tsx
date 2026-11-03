import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects } from '@/lib/portfolio-data'
export function generateStaticParams() { return projects.map((project) => ({ slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') })) }
export default function ProjectDetailPage({ params }: { params: { slug: string } }) { const project = projects.find((item) => item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug); if (!project) notFound(); return <main className="collection-page shell-width"><p className="section-label">Project case study</p><h1>{project.title}</h1><p className="collection-intro">{project.description}</p><div className="project-detail-grid"><p>{project.category}</p><div><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div><Link href="/projects" className="text-link">View all projects ↗</Link></main> }
