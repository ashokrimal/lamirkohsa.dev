import type { Metadata } from 'next'
import { Camera } from 'lucide-react'
import { getPublishedGallery } from '@/app/actions/content'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'

export const dynamic = 'force-dynamic'

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
  const rows = (await getPublishedGallery()) as GalleryRow[]

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
        eyebrow="Archive / Photography"
        krEyebrow="사진"
        title="A collection of"
        accent="frames."
        description="Landscapes, workspaces and quiet geometry collected along the way — the visual journal behind the software."
        meta={
          photos.length ? <MetaChip icon={Camera}>{photos.length} photographs</MetaChip> : undefined
        }
      />

      <div className="mt-10 md:mt-14">
        {photos.length ? (
          <GalleryGrid items={photos} columns={3} />
        ) : (
          <EmptyCollectionState
            eyebrow="Gallery / Empty"
            title="The archive is taking shape."
            description="Photographs, experiments, and selected work will appear here as they are published."
            action={{ label: 'Return to About', href: '/about' }}
          />
        )}
      </div>

      <PageNav backLabel="Return home" nextHref="/media" nextLabel="Browse the media library" />
    </PageShell>
  )
}
