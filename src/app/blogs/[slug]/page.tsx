import Link from 'next/link'
import { notFound } from 'next/navigation'
export default function BlogArticlePage({ params }: { params: { slug: string } }) { if (!params.slug) notFound(); return <main className="collection-page shell-width"><p className="section-label">Journal / Article</p><h1>{params.slug.replace(/-/g, ' ')}</h1><div className="empty-state">This article is not published yet.</div><Link href="/blogs" className="text-link">View all notes ↗</Link></main> }
