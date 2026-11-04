'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { profile, experience, education, skills, projects, socialLinks } from '@/lib/portfolio-data'
async function requireUser() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) throw new Error('Unauthorized'); return session.user.id }
export async function ensureCmsSeedData() { const userId = await requireUser(); const existing = await db.select({ collection: cmsContent.collection, title: cmsContent.title }).from(cmsContent).where(eq(cmsContent.userId, userId)); const keys = new Set(existing.map((record) => `${record.collection}:${record.title}`)); const seeds = [
  { collection: 'Profile', title: profile.name, payload: { description: `${profile.headline}\n${profile.location}\n${profile.summary}` } },
  ...experience.map((item) => ({ collection: 'Experience', title: item.title, payload: { description: `${item.organization}\n${item.period}\n${item.description}` } })),
  ...education.map((item) => ({ collection: 'Education', title: item.title, payload: { description: `${item.organization}\n${item.period}\n${item.description}` } })),
  ...skills.map((item) => ({ collection: 'Skills', title: item.category, payload: { description: item.items.join(', ') } })),
  ...projects.map((item) => ({ collection: 'Projects', title: item.title, payload: { description: `${item.category}\n${item.description}\n${item.tags.join(', ')}\n${item.status}` } })),
  ...socialLinks.map((item) => ({ collection: 'Social Links', title: item.label, payload: { description: item.href } })),
]
  const missing = seeds.filter((seed) => !keys.has(`${seed.collection}:${seed.title}`)).map((seed, index) => ({ ...seed, userId, slug: `${seed.collection}-${seed.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: 'published', sortOrder: index }))
  if (missing.length) await db.insert(cmsContent).values(missing)
}

export async function createCmsContent(formData: FormData) { const userId = await requireUser(); const collection = String(formData.get('collection') || 'Profile').trim(); const title = String(formData.get('title') || '').trim(); if (!title) throw new Error('A title is required'); const slug = `${collection}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const payload = { description: String(formData.get('payload') || '').trim(), imageUrl: String(formData.get('imageUrl') || '').trim() }; await db.insert(cmsContent).values({ userId, collection, title, slug, payload, status: String(formData.get('status') || 'draft') }); revalidatePath('/admin'); revalidatePath('/about'); revalidatePath('/media'); revalidatePath('/blogs') }
export async function getPublishedCmsContent(collection: string) { return db.select({ id: cmsContent.id, title: cmsContent.title, payload: cmsContent.payload, sortOrder: cmsContent.sortOrder }).from(cmsContent).where(and(eq(cmsContent.collection, collection), eq(cmsContent.status, 'published'))).orderBy(cmsContent.sortOrder, cmsContent.createdAt) }
export async function updateCmsContent(id: number, formData: FormData) { const userId = await requireUser(); const collection = String(formData.get('collection') || 'Profile').trim(); const title = String(formData.get('title') || '').trim(); if (!title) throw new Error('A title is required'); const description = String(formData.get('payload') || '').trim(); const imageUrl = String(formData.get('imageUrl') || '').trim(); const status = String(formData.get('status') || 'draft'); await db.update(cmsContent).set({ collection, title, payload: { description, imageUrl }, status, updatedAt: new Date() }).where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId))); revalidatePath('/admin'); revalidatePath('/about'); revalidatePath('/media'); revalidatePath('/movies') }
export async function deleteCmsContent(id: number) { const userId = await requireUser(); await db.delete(cmsContent).where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId))); revalidatePath('/admin'); revalidatePath('/about'); revalidatePath('/media'); revalidatePath('/blogs') }
export async function saveCmsImage(url: string) { const userId = await requireUser(); const existing = await db.select({ id: cmsContent.id }).from(cmsContent).where(and(eq(cmsContent.userId, userId), eq(cmsContent.collection, 'Site Settings'), eq(cmsContent.title, 'Hero Section'))).limit(1); if (existing[0]) await db.update(cmsContent).set({ payload: { imageUrl: url }, status: 'published', updatedAt: new Date() }).where(eq(cmsContent.id, existing[0].id)); else await db.insert(cmsContent).values({ userId, collection: 'Site Settings', title: 'Hero Section', slug: 'hero-section', payload: { imageUrl: url }, status: 'published' }); revalidatePath('/'); revalidatePath('/admin') }
export async function getHeroImage() { const records = await db.select({ payload: cmsContent.payload }).from(cmsContent).where(and(eq(cmsContent.collection, 'Site Settings'), eq(cmsContent.title, 'Hero Section'), eq(cmsContent.status, 'published'))).limit(1); const payload = records[0]?.payload; return payload && typeof payload.imageUrl === 'string' ? payload.imageUrl : null }
