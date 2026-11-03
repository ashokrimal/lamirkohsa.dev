import Link from 'next/link'
import { getPublishedGallery } from '@/app/actions/content'
import { ActionLink, ContentSection, Label, SectionTitle } from '@/components/ui/ContentPrimitives'

export async function MediaGallerySection() {
  const gallery = await getPublishedGallery()
  return <ContentSection className="gallery-preview-section"><SectionTitle label="01 / Gallery" title={<>Frames in <em>between.</em></>} description="A visual log of places, details, and moments collected along the way." action={<ActionLink href="/gallery">View all photography</ActionLink>} /><div className="media-gallery-grid">{gallery.slice(0, 7).map((item) => <Link href="/gallery" className="media-gallery-card" key={item.id}><img src={item.imageUrl} alt={item.title} loading="lazy" /><span>{item.title}</span><Label className="media-gallery-category">{item.category}</Label></Link>)}</div>{gallery.length === 0 && <div className="empty-state">The visual archive is taking shape.</div>}<Link href="/gallery" className="button button-quiet media-gallery-view-all">View all photos <span aria-hidden="true">↗</span></Link></ContentSection>
}
