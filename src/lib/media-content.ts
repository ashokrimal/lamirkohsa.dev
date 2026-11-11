import { getPublishedCmsContentResult, type CmsRecord } from '@/app/actions/content-cms'
import type { MediaKind, MediaPosterData } from '@/components/ui/MediaPoster'
import type { MediaCollection } from '@/lib/site-content'
import { CMS_MEDIA_RECORDS, CMS_SCHEMA } from '@/lib/cms-schema'

/**
 * Media content, in the order the media page renders it.
 *
 * Each section reads published records from its own CMS collection, so adding an
 * entry in the admin panel is all it takes to make it appear. The section label,
 * description and link come from the `Media Collections` CMS records when they
 * exist; otherwise only the required category name and route are used.
 */
export const MEDIA_SECTION_ORDER = Object.keys(
  CMS_MEDIA_RECORDS,
) as MediaKind[]

export interface MediaSection {
  kind: MediaKind
  label: string
  description?: string
  href: string
  items: MediaPosterData[]
  error?: string
}

function text(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

function mapRecord(record: CmsRecord): MediaPosterData {
  const payload = record.payload || {}
  return {
    id: record.id,
    title: record.title,
    subtitle: text(payload, 'artist') || text(payload, 'subtitle') || text(payload, 'creator'),
    description: text(payload, 'description') || text(payload, 'synopsis'),
    altText: text(payload, 'altText'),
    imageUrl:
      text(payload, 'coverUrl') || text(payload, 'imageUrl') || text(payload, 'posterUrl'),
    rating: text(payload, 'rating') || text(payload, 'score'),
    status: text(payload, 'status'),
    href: text(payload, 'externalUrl') || text(payload, 'href'),
  }
}

function configFor(kind: MediaKind, collections: MediaCollection[]) {
  const definition = CMS_MEDIA_RECORDS[kind]
  const record = collections.find((collection) => collection.key === definition.key)
  return {
    label: record?.label || definition.label,
    description: record?.description,
    href: record?.href || definition.route || `/media/${kind}`,
  }
}

/** All media sections in the required order. Sections without published items are kept but empty. */
export async function getMediaSections(collections: MediaCollection[]): Promise<MediaSection[]> {
  const results = await Promise.all(
    MEDIA_SECTION_ORDER.map((kind) =>
      getPublishedCmsContentResult(
        CMS_MEDIA_RECORDS[kind].collection ?? kind,
      ),
    ),
  )

  return MEDIA_SECTION_ORDER.map((kind, index) => {
    const config = configFor(kind, collections)
    const result = results[index]
    return {
      kind,
      label: config.label,
      description: config.description,
      href: config.href,
      items: result.status === 'ok' ? result.data.map(mapRecord) : [],
      error: result.status === 'error' ? result.message : undefined,
    }
  })
}

export async function getMediaSection(
  kind: MediaKind,
  collections: MediaCollection[],
): Promise<MediaSection> {
  const sections = await getMediaSections(collections)
  return sections.find((section) => section.kind === kind) as MediaSection
}
