'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { galleryItem, portfolioProject } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getPublishedGallery() {
  return db.select().from(galleryItem).where(eq(galleryItem.published, true)).orderBy(desc(galleryItem.createdAt))
}

export async function getAdminContent() {
  const userId = await requireUser()
  const [gallery, projects] = await Promise.all([
    db.select().from(galleryItem).where(eq(galleryItem.userId, userId)).orderBy(desc(galleryItem.createdAt)),
    db.select().from(portfolioProject).where(eq(portfolioProject.userId, userId)).orderBy(desc(portfolioProject.createdAt)),
  ])
  return { gallery, projects }
}

export async function createGalleryItem(formData: FormData) {
  const userId = await requireUser()
  const title = String(formData.get('title') || '').trim()
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  if (!title || !imageUrl) throw new Error('Title and image URL are required')
  await db.insert(galleryItem).values({ userId, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), imageUrl, category: String(formData.get('category') || 'Selected work'), description: String(formData.get('description') || '') })
  revalidatePath('/gallery'); revalidatePath('/admin')
}

export async function deleteGalleryItem(id: number) {
  const userId = await requireUser()
  await db.delete(galleryItem).where(and(eq(galleryItem.id, id), eq(galleryItem.userId, userId)))
  revalidatePath('/gallery'); revalidatePath('/admin')
}
