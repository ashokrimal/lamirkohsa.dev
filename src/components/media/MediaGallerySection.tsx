import Link from 'next/link'
import { getPublishedGallery } from '@/app/actions/content'
import { ActionLink, ContentSection, Label, SectionTitle } from '@/components/ui/ContentPrimitives'
import EmptyCollectionState from '@/components/EmptyCollectionState'

export async function MediaGallerySection() {
  const gallery = await getPublishedGallery()
  return <ContentSection className="gallery-preview-section"><SectionTitle label="01 / Gallery" title={<>Frames in <span className="accent-text">between.</span></>} description="A visual log of places, details, and moments collected along the way." action={<ActionLink href="/gallery">View All Photos</ActionLink>} /><div className="media-gallery-grid">{gallery.slice(0, 7).map((item) => <Link href="/gallery" className="media-gallery-card" key={item.id}><img src={item.imageUrl} alt={item.title || 'Gallery photograph'} loading="lazy" /><span>{item.title}</span><Label className="media-gallery-category">{item.category}</Label></Link>)}</div>{gallery.length === 0 && <EmptyCollectionState title="The visual archive is taking shape." description="Selected photographs and personal frames will appear here as they are published." action={{ label: 'Open gallery', href: '/gallery' }} />}<Link href="/gallery" className="button button-quiet media-gallery-view-all">View All Photos <span aria-hidden="true">↗</span></Link></ContentSection>
}
