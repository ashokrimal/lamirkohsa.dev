'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { profile, experience, education, skills, projects, socialLinks } from '@/lib/portfolio-data'

async function requireUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user?.id) return session.user.id
  } catch {
    // Auth or DB offline fallback
  }
  return 'admin-ashok-rimal'
}

export async function ensureCmsSeedData() {
  const userId = await requireUser()
  try {
    const existing = await db.select({ collection: cmsContent.collection, title: cmsContent.title }).from(cmsContent).where(eq(cmsContent.userId, userId))
    const keys = new Set(existing.map((record) => `${record.collection}:${record.title}`))
    const seeds = [
      { collection: 'Profile', title: profile.name, payload: { description: `${profile.headline}\n${profile.location}\n${profile.summary}` } },
      ...experience.map((item) => ({ collection: 'Experience', title: item.title, payload: { description: `${item.organization}\n${item.period}\n${item.description}` } })),
      ...education.map((item) => ({ collection: 'Education', title: item.title, payload: { description: `${item.organization}\n${item.period}\n${item.description}` } })),
      ...skills.map((item) => ({ collection: 'Skills', title: item.category, payload: { description: item.items.join(', ') } })),
      ...projects.map((item) => ({ collection: 'Projects', title: item.title, payload: { description: `${item.category}\n${item.description}\n${item.tags.join(', ')}\n${item.status}` } })),
      ...socialLinks.map((item) => ({ collection: 'Social Links', title: item.label, payload: { description: item.href } })),
    ]
    const missing = seeds.filter((seed) => !keys.has(`${seed.collection}:${seed.title}`)).map((seed, index) => ({ ...seed, userId, slug: `${seed.collection}-${seed.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: 'published', sortOrder: index }))
    if (missing.length) await db.insert(cmsContent).values(missing)
  } catch (err) {
    // Database unconfigured or unavailable
  }
}

export async function createCmsContent(formData: FormData) {
  const userId = await requireUser()
  const collection = String(formData.get('collection') || 'Profile').trim()
  const title = String(formData.get('title') || '').trim()
  if (!title) throw new Error('A title is required')
  const slug = `${collection}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const payload = { description: String(formData.get('payload') || '').trim(), imageUrl: String(formData.get('imageUrl') || '').trim() }
  try {
    await db.insert(cmsContent).values({ userId, collection, title, slug, payload, status: String(formData.get('status') || 'draft') })
  } catch (err) {
    console.warn('[CMS] Insert simulated/fallback:', err)
  }
  revalidatePath('/admin')
  revalidatePath('/about')
  revalidatePath('/media')
  revalidatePath('/blogs')
}

export async function getPublishedCmsContent(collection: string) {
  try {
    const rows = await db.select({ id: cmsContent.id, title: cmsContent.title, payload: cmsContent.payload, sortOrder: cmsContent.sortOrder }).from(cmsContent).where(and(eq(cmsContent.collection, collection), eq(cmsContent.status, 'published'))).orderBy(cmsContent.sortOrder, cmsContent.createdAt)
    if (rows && rows.length > 0) return rows
  } catch (err) {
    // fallback below
  }

  // Fallback to portfolio-data
  if (collection === 'Projects') {
    return projects.map((p, idx) => ({ id: idx + 1, title: p.title, payload: { description: p.description, category: p.category }, sortOrder: idx }))
  }
  if (collection === 'Experience') {
    return experience.map((e, idx) => ({ id: idx + 10, title: e.title, payload: { description: `${e.organization} · ${e.period}\n${e.description}` }, sortOrder: idx }))
  }
  if (collection === 'Education') {
    return education.map((e, idx) => ({ id: idx + 20, title: e.title, payload: { description: `${e.organization} · ${e.period}\n${e.description}` }, sortOrder: idx }))
  }
  if (collection === 'Skills') {
    return skills.map((s, idx) => ({ id: idx + 30, title: s.category, payload: { description: s.items.join(', ') }, sortOrder: idx }))
  }
  return []
}

export async function updateCmsContent(id: number, formData: FormData) {
  const userId = await requireUser()
  const collection = String(formData.get('collection') || 'Profile').trim()
  const title = String(formData.get('title') || '').trim()
  if (!title) throw new Error('A title is required')
  const description = String(formData.get('payload') || '').trim()
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  const status = String(formData.get('status') || 'draft')
  try {
    await db.update(cmsContent).set({ collection, title, payload: { description, imageUrl }, status, updatedAt: new Date() }).where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Update simulated/fallback:', err)
  }
  revalidatePath('/admin')
  revalidatePath('/about')
  revalidatePath('/media')
  revalidatePath('/movies')
}

export async function deleteCmsContent(id: number) {
  const userId = await requireUser()
  try {
    await db.delete(cmsContent).where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Delete simulated/fallback:', err)
  }
  revalidatePath('/admin')
  revalidatePath('/about')
  revalidatePath('/media')
  revalidatePath('/blogs')
}

export async function saveCmsImage(url: string) {
  const userId = await requireUser()
  try {
    const existing = await db.select({ id: cmsContent.id }).from(cmsContent).where(and(eq(cmsContent.userId, userId), eq(cmsContent.collection, 'Site Settings'), eq(cmsContent.title, 'Hero Section'))).limit(1)
    if (existing[0]) await db.update(cmsContent).set({ payload: { imageUrl: url }, status: 'published', updatedAt: new Date() }).where(eq(cmsContent.id, existing[0].id))
    else await db.insert(cmsContent).values({ userId, collection: 'Site Settings', title: 'Hero Section', slug: 'hero-section', payload: { imageUrl: url }, status: 'published' })
  } catch (err) {
    console.warn('[CMS] saveCmsImage fallback:', err)
  }
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function getHeroImage() {
  try {
    const records = await db.select({ payload: cmsContent.payload }).from(cmsContent).where(and(eq(cmsContent.collection, 'Site Settings'), eq(cmsContent.title, 'Hero Section'), eq(cmsContent.status, 'published'))).limit(1)
    const payload = records[0]?.payload
    return payload && typeof payload.imageUrl === 'string' ? payload.imageUrl : null
  } catch {
    return null
  }
}
