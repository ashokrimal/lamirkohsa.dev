import { getPublishedCmsContentResult, type CmsRecord } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS, type CmsResult } from '@/lib/cms-schema'

export interface GalleryPhoto {
  id: number
  title: string
  imageUrl: string
  altText?: string
  category?: string
  description?: string
  location?: string
}

function optionalText(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

export function mapGalleryRecord(record: CmsRecord): GalleryPhoto {
  const payload = record.payload ?? {}
  return {
    id: record.id,
    title: record.title,
    imageUrl: optionalText(payload, 'imageUrl') ?? '',
    altText: optionalText(payload, 'altText'),
    category: optionalText(payload, 'category'),
    description: optionalText(payload, 'description'),
    location: optionalText(payload, 'location'),
  }
}

/** Public gallery read with an explicit empty/error state. */
export async function getGalleryResult(limit?: number): Promise<CmsResult<GalleryPhoto[]>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.gallery)
  if (result.status !== 'ok') return result

  const photos = result.data.map(mapGalleryRecord).filter((photo) => Boolean(photo.imageUrl))
  if (photos.length === 0) return { status: 'empty' }

  return { status: 'ok', data: typeof limit === 'number' ? photos.slice(0, limit) : photos }
}
