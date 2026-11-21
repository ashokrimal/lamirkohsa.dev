import type { Metadata } from 'next'
import { Camera, ImageOff } from 'lucide-react'
import { getGalleryResult } from '@/lib/gallery'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { getUiCopy } from '@/lib/ui-copy'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { InstagramFeed } from '@/components/ui/InstagramFeed'
import { SectionRenderer } from '@/components/studio/SectionRenderer'
import { getPageWithSections } from '@/lib/studio/data'
import { getSiteConfig } from '@/lib/site-content'
import { MetaChip, PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.gallery : undefined, undefined, '/about/gallery')
}

export default async function GalleryPage() {
  const uiStrings = await getUiCopy()
  const [galleryResult, copyResult, pageResult, siteResult] = await Promise.all([
    getGalleryResult(),
    getPageCopy(),
    getPageWithSections('/about/gallery'),
    getSiteConfig(),
  ])
  const pageCopy = copyResult.status === 'ok' ? copyResult.data.gallery : undefined
  const photos = galleryResult.status === 'ok' ? galleryResult.data : []
  // Studio → Pages owns the feed once an `instagram` section exists for this
  // page; until then the built-in block below renders the same embed.
  const instagramSection = pageResult.sections.find(
    (section) => section.sectionKey === 'instagram' && section.isEnabled,
  )
  const socials = siteResult.status === 'ok' ? siteResult.data.navigation.socials : []
  const instagramHref = socials.find((social) =>
    /instagram/i.test(`${social.kind ?? ''} ${social.label} ${social.href}`),
  )?.href

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? ''}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
        meta={
          photos.length ? (
            <MetaChip icon={Camera}>{uiStrings.gallery.photographs(photos.length)}</MetaChip>
          ) : undefined
        }
      />

      <div className="mt-10 md:mt-14">
        {galleryResult.status === 'error' ? (
          <CmsErrorState message={galleryResult.message} />
        ) : photos.length ? (
          <GalleryGrid items={photos} columns={3} />
        ) : (
          <EmptyState
            eyebrow="Photo Gallery"
            icon={ImageOff}
            message={CMS_SCHEMA.sections.pages.gallery.emptyState.message}
            hint={CMS_SCHEMA.sections.pages.gallery.emptyState.hint}
          />
        )}
      </div>

      {instagramSection ? (
        <SectionRenderer sections={[instagramSection]} />
      ) : (
        <InstagramFeed
          widgetId={uiStrings.gallery.instagramWidgetId.en}
          title={uiStrings.gallery.instagramTitle.en}
          description={uiStrings.gallery.instagramDescription.en}
          followHref={instagramHref}
          followLabel={uiStrings.gallery.instagramFollowLabel.en}
        />
      )}

      <PageNav />
    </PageShell>
  )
}
