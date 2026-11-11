import type { Metadata } from 'next'
import { Camera, ImageOff } from 'lucide-react'
import { getGalleryResult } from '@/lib/gallery'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_SCHEMA } from '@/lib/cms-schema'
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
  const [galleryResult, copyResult] = await Promise.all([getGalleryResult(), getPageCopy()])
  const pageCopy = copyResult.status === 'ok' ? copyResult.data.gallery : undefined
  const photos = galleryResult.status === 'ok' ? galleryResult.data : []

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
        {galleryResult.status === 'error' ? (
          <CmsErrorState message={galleryResult.message} />
        ) : photos.length ? (
          <GalleryGrid items={photos} columns={3} />
        ) : (
          <EmptyState
            icon={ImageOff}
            message={CMS_SCHEMA.sections.pages.gallery.emptyState.message}
            hint={CMS_SCHEMA.sections.pages.gallery.emptyState.hint}
            actionLabel={CMS_SCHEMA.sections.pages.gallery.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.sections.pages.gallery.emptyState.actionHref}
          />
        )}
      </div>

      <PageNav />
    </PageShell>
  )
}
