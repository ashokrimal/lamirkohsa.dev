'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { getAdminActorId } from '@/lib/admin-auth'
import { CMS_CACHE_TAG, cmsCollectionTag } from '@/lib/cms-cache'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'

async function getUserId() {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized')
  return actorId
}

function parseCsv(text: string) {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map(
      (line) =>
        line
          .match(/(?:^|,)\s*(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g)
          ?.map((cell) =>
            cell
              .replace(/^,?\s*/, '')
              .replace(/^"|"$/g, '')
              .replace(/""/g, ''),
          ) ?? [],
    )
  const headers = rows.shift()?.map((header) => header.trim()) ?? []
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  )
}

export async function importMovieExport(formData: FormData) {
  const userId = await getUserId()
  const file = formData.get('file')
  if (!(file instanceof File) || !/\.csv$/i.test(file.name)) {
    throw new Error('Choose an IMDb CSV export.')
  }
  const rows = parseCsv(await file.text())
    .map((item) => ({
      userId,
      collection: CMS_COLLECTIONS.movies,
      title: String(item.Title ?? item.title ?? '').trim(),
      slug: String(item.Const ?? item.title ?? item.Title ?? crypto.randomUUID())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
      payload: {
        description: item['Your Rating'] ? `IMDb rating: ${item['Your Rating']}` : 'IMDb export',
        source: 'IMDb',
        year: item.Year ?? '',
      },
      status: 'published',
      sortOrder: 0,
    }))
    .filter((item) => item.title)
  if (!rows.length) throw new Error('No movies were found in this CSV export.')
  await db
    .delete(cmsContent)
    .where(
      and(
        eq(cmsContent.userId, userId),
        eq(cmsContent.collection, CMS_COLLECTIONS.movies),
      ),
    )
  await db.insert(cmsContent).values(rows)
  revalidatePath('/admin')
  revalidateTag(CMS_CACHE_TAG)
  revalidateTag(cmsCollectionTag(CMS_COLLECTIONS.movies))
  revalidatePath('/media')
  revalidatePath('/media/movies')
  return { imported: rows.length }
}
