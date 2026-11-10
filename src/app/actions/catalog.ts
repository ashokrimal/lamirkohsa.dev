'use server'

import { XMLParser } from 'fast-xml-parser'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { animeMangaItem, cmsContent, musicTrack } from '@/lib/db/schema'
import { ADMIN_OWNER_ID, hasAdminSession } from '@/lib/admin-auth'

type CatalogKind = 'anime' | 'manga'
type ImportItem = Record<string, unknown>

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.id) return session.user.id
  if (await hasAdminSession()) return ADMIN_OWNER_ID
  throw new Error('Unauthorized')
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

function parseCsv(text: string) {
  const rows = text.trim().split(/\r?\n/).map((line) => line.match(/(?:^|,)\s*(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g)?.map((cell) => cell.replace(/^,?\s*/, '').replace(/^"|"$/g, '').replace(/""/g, '')) ?? [])
  const headers = rows.shift()?.map((header) => header.trim()) ?? []
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])))
}

export async function importMusicExport(formData: FormData) {
  const userId = await getUserId(); const file = formData.get('file')
  if (!(file instanceof File) || !/\.json$/i.test(file.name)) throw new Error('Choose a Spotify or YouTube Music JSON export.')
  const parsed = JSON.parse(await file.text()); const rows = (Array.isArray(parsed) ? parsed : [parsed]).map((item) => item as Record<string, unknown>).map((item) => ({ userId, title: String(item.master_metadata_track_name ?? item.track ?? item.title ?? '').trim(), artist: String(item.master_metadata_album_artist_name ?? item.artist ?? item.artist_name ?? 'Unknown artist').trim(), album: String(item.master_metadata_album_album_name ?? item.album ?? '').trim() || null, audioUrl: String(item.spotify_track_uri ?? item.youtube_url ?? item.videoId ?? `https://music.youtube.com/search?q=${encodeURIComponent(String(item.track ?? item.title ?? ''))}`), coverUrl: typeof item.image_url === 'string' ? item.image_url : null, published: true, sortOrder: 0 })).filter((item) => item.title)
  if (!rows.length) throw new Error('No music tracks were found in this export.')
  await db.delete(musicTrack).where(eq(musicTrack.userId, userId)); await db.insert(musicTrack).values(rows); revalidatePath('/admin'); revalidatePath('/media'); return { imported: rows.length }
}

export async function importMovieExport(formData: FormData) {
  const userId = await getUserId(); const file = formData.get('file')
  if (!(file instanceof File) || !/\.csv$/i.test(file.name)) throw new Error('Choose an IMDb CSV export.')
  const rows = parseCsv(await file.text()).map((item) => ({ userId, collection: 'Movies', title: String(item.Title ?? item.title ?? '').trim(), slug: String(item.Const ?? item.title ?? item.Title ?? crypto.randomUUID()).toLowerCase().replace(/[^a-z0-9]+/g, '-'), payload: { description: item['Your Rating'] ? `IMDb rating: ${item['Your Rating']}` : 'IMDb export', source: 'IMDb', year: item.Year ?? '' }, status: 'published', sortOrder: 0 })).filter((item) => item.title)
  if (!rows.length) throw new Error('No movies were found in this CSV export.')
  await db.delete(cmsContent).where(and(eq(cmsContent.userId, userId), eq(cmsContent.collection, 'Movies'))); await db.insert(cmsContent).values(rows); revalidatePath('/admin'); revalidatePath('/media'); revalidatePath('/movies'); return { imported: rows.length }
}
