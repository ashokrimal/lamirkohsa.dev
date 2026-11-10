import Link from 'next/link'
import Image from 'next/image'
import { getPublishedGallery } from '@/app/actions/content'
import { ContentSection, Label, SectionTitle } from '@/components/ui/ContentPrimitives'
import EmptyCollectionState from '@/components/EmptyCollectionState'

export async function MediaGallerySection() {
  const gallery = await getPublishedGallery()
  return (
    <ContentSection className="gallery-preview-section">
      <SectionTitle
        label="01 / Gallery"
        title={
          <>
            Frames in <span className="accent-text">between.</span>
          </>
        }
        description="A visual log of places, details, and moments collected along the way."
      />
      <div className="media-gallery-carousel">
        {gallery.slice(0, 7).map((item) => (
          <Link href="/gallery" className="media-gallery-card group" key={item.id}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/[0.02]">
              <Image
                src={item.imageUrl}
                alt={item.title || 'Gallery photograph'}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                referrerPolicy="no-referrer"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span>{item.title}</span>
            <Label className="media-gallery-category">{item.category}</Label>
          </Link>
        ))}
      </div>
      {gallery.length === 0 && (
        <EmptyCollectionState
          title="The visual archive is taking shape."
          description="Selected photographs and personal frames will appear here as they are published."
        />
      )}
      {gallery.length > 0 && (
        <Link href="/gallery" className="button button-quiet media-gallery-view-all">
          View All Photos <span aria-hidden="true">↗</span>
        </Link>
      )}
    </ContentSection>
  )
}
