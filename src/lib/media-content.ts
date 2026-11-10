import { getPublishedCmsContent, type CmsRecord } from '@/app/actions/content-cms'
import type { MediaKind, MediaPosterData } from '@/components/ui/MediaPoster'
import type { MediaCollection } from '@/lib/site-content'

/**
 * Media content, in the order the media page renders it.
 *
 * Each section reads published records from its own CMS collection, so adding an
 * entry in the admin panel is all it takes to make it appear. The section label,
 * description and link come from the `Media Collections` CMS records when they
 * exist; otherwise only the required category name and route are used.
 */
export const MEDIA_SECTION_ORDER: MediaKind[] = ['music', 'movies', 'anime', 'manga']

const CMS_COLLECTION: Record<MediaKind, string> = {
  music: 'Music',
  movies: 'Movies',
  anime: 'Anime',
  manga: 'Manga',
}

const DEFAULT_LABEL: Record<MediaKind, string> = {
  music: 'Music',
  movies: 'Movies',
  anime: 'Anime',
  manga: 'Manga',
}

const DEFAULT_HREF: Record<MediaKind, string> = {
  music: '/media/music',
  movies: '/media/movies',
  anime: '/media/anime',
  manga: '/media/manga',
}

/** Older data used `films` for the movie collection. */
const COLLECTION_KEY_ALIASES: Record<MediaKind, string[]> = {
  music: ['music'],
  movies: ['movies', 'films'],
  anime: ['anime'],
  manga: ['manga'],
}

export interface MediaSection {
  kind: MediaKind
  label: string
  description?: string
  href: string
  items: MediaPosterData[]
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
    imageUrl:
      text(payload, 'coverUrl') || text(payload, 'imageUrl') || text(payload, 'posterUrl'),
    rating: text(payload, 'rating') || text(payload, 'score'),
    status: text(payload, 'status'),
    href: text(payload, 'externalUrl') || text(payload, 'href'),
  }
}

function configFor(kind: MediaKind, collections: MediaCollection[]) {
  const keys = COLLECTION_KEY_ALIASES[kind]
  const record = collections.find((collection) => keys.includes(collection.key.toLowerCase()))
  return {
    label: record?.label || DEFAULT_LABEL[kind],
    description: record?.description,
    href: record?.href || DEFAULT_HREF[kind],
  }
}

/** All media sections in the required order. Sections without published items are kept but empty. */
export async function getMediaSections(collections: MediaCollection[]): Promise<MediaSection[]> {
  const records = await Promise.all(
    MEDIA_SECTION_ORDER.map((kind) => getPublishedCmsContent(CMS_COLLECTION[kind])),
  )

  return MEDIA_SECTION_ORDER.map((kind, index) => {
    const config = configFor(kind, collections)
    return {
      kind,
      label: config.label,
      description: config.description,
      href: config.href,
      items: records[index].map(mapRecord),
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
