import type { Metadata } from 'next'
import { Camera, ImageOff } from 'lucide-react'
import { getPublishedGallery } from '@/app/actions/content'
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

type GalleryRow = {
  id: number | string
  title?: string
  imageUrl?: string
  category?: string
  description?: string
  location?: string
}

export default async function GalleryPage() {
  const [rows, copy] = await Promise.all([
    getPublishedGallery() as Promise<GalleryRow[]>,
    getPageCopy(),
  ])
  const pageCopy = copy.gallery

  const photos = rows
    .filter((item) => Boolean(item.imageUrl))
    .map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl as string,
      category: item.category,
      description: item.description,
      location: item.location,
    }))

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
          <EmptyState icon={ImageOff} message="Gallery updating..." />
        )}
      </div>

      <PageNav />
    </PageShell>
  )
}
