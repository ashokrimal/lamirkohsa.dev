import { getPublishedGallery } from '@/app/actions/content'
import EmptyCollectionState from '@/components/EmptyCollectionState'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const items = await getPublishedGallery()
  return <main className="gallery-page shell-width"><header className="gallery-header"><div><p className="section-label">Archive / 01</p><h1>A collection of <span className="accent-text">frames.</span></h1></div></header><div className="gallery-grid">{items.length ? items.map((item) => <article className="gallery-card" key={item.id}><div className="gallery-image"><img src={item.imageUrl} alt={item.title || 'Gallery photograph'} loading="lazy" /></div><div className="gallery-meta"><div><h2>{item.title}</h2><p>{item.description}</p></div><span>{item.category}</span></div></article>) : <EmptyCollectionState eyebrow="Gallery / Empty" title="The archive is taking shape." description="Photographs, experiments, and selected work will appear here as they are published." action={{ label: 'Return to About', href: '/about' }} />}</div></main>
}
