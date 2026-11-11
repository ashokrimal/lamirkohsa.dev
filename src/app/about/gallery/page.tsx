import type { Metadata } from 'next'
import { Camera, ImageOff } from 'lucide-react'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { EmptyState } from '@/components/ui/EmptyState'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { getPageCopy } from '@/lib/site-content'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Photography Archive - Ashok Rimal',
  description:
    'A visual archive of photographs by Ashok Rimal: landscape, workspace and quiet geometry across Nepal.',
}

export default async function GalleryPage() {
  const [rows, copy] = await Promise.all([
    getPublishedCmsContent('Gallery'),
    getPageCopy(),
  ])
  const pageCopy = copy.gallery

  const photos = rows
    .map((item) => {
      const payload = item.payload || {}
      return {
        id: item.id,
        title: item.title,
        imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl : '',
        category: typeof payload.category === 'string' ? payload.category : undefined,
        description: typeof payload.description === 'string' ? payload.description : undefined,
        location: typeof payload.location === 'string' ? payload.location : undefined,
        altText: typeof payload.altText === 'string' ? payload.altText : undefined,
      }
    })
    .filter((item) => Boolean(item.imageUrl))

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? ''}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
        meta={
          photos.length ? <MetaChip icon={Camera}>{photos.length} photographs</MetaChip> : undefined
        }
      />

      <div className="mt-10 md:mt-14">
        {photos.length ? (
          <GalleryGrid items={photos} columns={3} />
        ) : (
          <EmptyState
            icon={ImageOff}
            message="No gallery images published yet."
            hint="Upload images to the Visual Gallery collection."
            actionLabel="Add images in admin"
            actionHref="/admin?section=content&collection=Gallery"
          />
        )}
      </div>

      <PageNav />
    </PageShell>
  )
}
