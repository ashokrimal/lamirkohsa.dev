import Link from 'next/link'
export const dynamic = 'force-dynamic'
export default function BlogsPage() { return <main className="collection-page shell-width"><p className="section-label">Journal / Blogs</p><h1>Notes in<br /><em>progress.</em></h1><p className="collection-intro">Essays, experiments, and observations will live here.</p><div className="empty-state">No published articles yet.</div><Link href="/contact" className="text-link">Start a conversation ↗</Link></main> }
