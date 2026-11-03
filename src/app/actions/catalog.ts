'use server'

import { XMLParser } from 'fast-xml-parser'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { animeMangaItem } from '@/lib/db/schema'

type CatalogKind = 'anime' | 'manga'
type ImportItem = Record<string, unknown>

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function asText(value: unknown) {
  if (value === null || value === undefined) return null
  return String(value)
}

function extractItems(value: unknown): ImportItem[] {
  if (Array.isArray(value)) return value.filter((item): item is ImportItem => Boolean(item && typeof item === 'object'))
  if (!value || typeof value !== 'object') return []
  const object = value as Record<string, unknown>
  for (const key of ['items', 'data', 'anime', 'manga', 'entry', 'entries']) {
    const nested = object[key]
    if (Array.isArray(nested)) return extractItems(nested)
    if (nested && typeof nested === 'object') return extractItems(nested)
  }
  return [object]
}

export async function importAnimeManga(formData: FormData) {
  const userId = await getUserId()
  const file = formData.get('file')
  const kind = formData.get('kind')
  if (!(file instanceof File) || !['anime', 'manga'].includes(String(kind))) throw new Error('Choose an anime or manga file.')
  if (!['application/json', 'application/xml', 'text/xml', ''].includes(file.type) && !/\.(json|xml)$/i.test(file.name)) throw new Error('Only JSON and XML files are supported.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Files must be smaller than 5 MB.')

  const text = await file.text()
  let parsed: unknown
  try { parsed = /\.xml$/i.test(file.name) || file.type.includes('xml') ? new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' }).parse(text) : JSON.parse(text) } catch { throw new Error('The file could not be parsed. Check that it is valid JSON or XML.') }
  const items = extractItems(parsed).map((item) => ({ userId, kind: String(kind) as CatalogKind, externalId: asText(item.id ?? item.mal_id ?? item.media_id), title: asText(item.title ?? item.name ?? item.series_title) ?? 'Untitled entry', status: asText(item.status ?? item.watching_status ?? item.reading_status), score: asText(item.score ?? item.rating), progress: asText(item.progress ?? item.progress_string ?? item.num_episodes_watched ?? item.num_chapters_read), imageUrl: asText(item.image_url ?? item.images ?? item.cover ?? item.picture), synopsis: asText(item.synopsis ?? item.description), source: file.name, rawData: item }))
  if (!items.length) throw new Error('No anime or manga entries were found in this file.')
  await db.delete(animeMangaItem).where(and(eq(animeMangaItem.userId, userId), eq(animeMangaItem.kind, String(kind))))
  await db.insert(animeMangaItem).values(items)
  revalidatePath('/admin')
  revalidatePath('/media')
  return { imported: items.length, kind }
}

export async function getCatalogItems(kind: CatalogKind) {
  const userId = await getUserId()
  return db.select().from(animeMangaItem).where(and(eq(animeMangaItem.userId, userId), eq(animeMangaItem.kind, kind))).orderBy(animeMangaItem.updatedAt)
}
