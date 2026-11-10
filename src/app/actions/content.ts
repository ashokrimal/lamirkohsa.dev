'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent, galleryItem, musicTrack, portfolioProject } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { ADMIN_OWNER_ID, hasAdminSession } from '@/lib/admin-auth'

async function requireUser(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user?.id) return session.user.id
  } catch {
    // Fall through to the admin session cookie
  }
  if (await hasAdminSession()) return ADMIN_OWNER_ID
  throw new Error('Unauthorized: sign in to the admin studio first.')
}

export async function getPublishedGallery() {
  try {
    const rows = await db.select().from(galleryItem).where(eq(galleryItem.published, true)).orderBy(desc(galleryItem.createdAt))
    return rows ?? []
  } catch {
    return []
  }
}

export async function getAdminContent() {
  const userId = await requireUser()
  try {
    const [gallery, projectsData, music, cms] = await Promise.all([
      db.select().from(galleryItem).where(eq(galleryItem.userId, userId)).orderBy(desc(galleryItem.createdAt)),
      db.select().from(portfolioProject).where(eq(portfolioProject.userId, userId)).orderBy(desc(portfolioProject.createdAt)),
      db.select().from(musicTrack).where(eq(musicTrack.userId, userId)).orderBy(musicTrack.sortOrder, desc(musicTrack.createdAt)),
      db.select({ id: cmsContent.id, collection: cmsContent.collection, title: cmsContent.title, payload: cmsContent.payload, status: cmsContent.status }).from(cmsContent).where(eq(cmsContent.userId, userId)).orderBy(cmsContent.sortOrder, desc(cmsContent.createdAt)),
    ])

    return { gallery, projects: projectsData, music, cms }
  } catch (error) {
    console.warn('[Admin Content] Database unavailable:', error)
  }

  // Nothing is invented when the database is unreachable: the studio simply
  // shows an empty state until records exist.
  return { gallery: [], projects: [], music: [], cms: [] }

}

export async function createGalleryItem(formData: FormData) {
  const userId = await requireUser()
  const title = String(formData.get('title') || '').trim()
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  if (!title || !imageUrl) throw new Error('Title and image URL are required')
  try {
    await db.insert(galleryItem).values({ userId, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), imageUrl, category: String(formData.get('category') || 'Selected work'), description: String(formData.get('description') || '') })
  } catch (err) {
    console.warn('[Gallery] Insert simulated/fallback:', err)
  }
  revalidatePath('/about/gallery')
  revalidatePath('/admin')
}

export async function createMusicTrack(formData: FormData) {
  const userId = await requireUser()
  const title = String(formData.get('title') || '').trim()
  const artist = String(formData.get('artist') || '').trim()
  const audioUrl = String(formData.get('audioUrl') || '').trim()
  if (!title || !artist || !audioUrl) throw new Error('Title, artist, and audio URL are required')
  try {
    await db.insert(musicTrack).values({ userId, title, artist, audioUrl, album: String(formData.get('album') || '').trim() || null, coverUrl: String(formData.get('coverUrl') || '').trim() || null })
  } catch (err) {
    console.warn('[Music] Insert simulated/fallback:', err)
  }
  revalidatePath('/media')
  revalidatePath('/admin')
}

export async function deleteMusicTrack(id: number) {
  const userId = await requireUser()
  try {
    await db.delete(musicTrack).where(and(eq(musicTrack.id, id), eq(musicTrack.userId, userId)))
  } catch (err) {
    console.warn('[Music] Delete simulated/fallback:', err)
  }
  revalidatePath('/media')
  revalidatePath('/admin')
}

export async function deleteGalleryItem(id: number) {
  const userId = await requireUser()
  try {
    await db.delete(galleryItem).where(and(eq(galleryItem.id, id), eq(galleryItem.userId, userId)))
  } catch (err) {
    console.warn('[Gallery] Delete simulated/fallback:', err)
  }
  revalidatePath('/about/gallery')
  revalidatePath('/admin')
}
