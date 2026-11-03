import Link from 'next/link'
import EmptyCollectionState from '@/components/EmptyCollectionState'
export const dynamic = 'force-dynamic'
export default function BlogsPage() { return <main className="collection-page shell-width"><p className="section-label">Journal / Blogs</p><h1>Notes in<br /><span className="accent-text">progress.</span></h1><p className="collection-intro">Essays, experiments, and observations will live here.</p><EmptyCollectionState eyebrow="Journal / Empty" title="The first note is still forming." description="Essays, experiments, and observations will appear here when they are ready to share." action={{ label: 'Return home', href: '/' }} /><Link href="/contact" className="text-link">Start a conversation ↗</Link></main> }
