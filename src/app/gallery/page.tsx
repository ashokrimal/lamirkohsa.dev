import Link from 'next/link'
import { getPublishedGallery } from '@/app/actions/content'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const items = await getPublishedGallery()
  return <main className="gallery-page shell-width"><header className="gallery-header"><div><p className="section-label">Archive / 01</p><h1>A collection of <em>frames.</em></h1></div><Link href="/" className="text-link">Back home <span>↗</span></Link></header><div className="gallery-grid">{items.length ? items.map((item) => <article className="gallery-card" key={item.id}><div className="gallery-image"><img src={item.imageUrl} alt={item.title || 'Gallery photograph'} loading="lazy" /></div><div className="gallery-meta"><div><h2>{item.title}</h2><p>{item.description}</p></div><span>{item.category}</span></div></article>) : <div className="empty-gallery"><p className="section-label">No published work yet</p><h2>The archive is taking shape.</h2><p>Check back soon for new photographs, experiments, and selected work.</p></div>}</div></main>
}
