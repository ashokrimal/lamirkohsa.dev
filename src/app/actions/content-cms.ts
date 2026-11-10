'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { and, asc, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CmsRecord {
  id: number
  userId?: string
  collection: string
  title: string
  slug: string
  payload: Record<string, unknown>
  status: string
  sortOrder: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

async function requireUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user?.id) return session.user.id
  } catch {
    // Auth or DB offline fallback
  }
  return 'admin-ashok-rimal'
}

// Master Initial CMS Data Set (Source of Truth for initial seed)
// Resilient In-Memory CMS Repository
// Ensures immediate, zero-latency responsiveness and real-time mutations
class MemoryCmsRepository {
  private records: Map<number, CmsRecord> = new Map()
  private nextId = 100

  // Starts empty on purpose: content is authored in the CMS, never bundled.

  public getAll(collection?: string): CmsRecord[] {
    const list = Array.from(this.records.values())
    if (!collection) return list.sort((a, b) => a.sortOrder - b.sortOrder)
    return list
      .filter((r) => r.collection.toLowerCase() === collection.toLowerCase())
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  public getPublished(collection: string): CmsRecord[] {
    return this.getAll(collection).filter((r) => r.status === 'published')
  }

  public getById(id: number): CmsRecord | undefined {
    return this.records.get(id)
  }

  public getByTitle(collection: string, title: string): CmsRecord | undefined {
    return this.getAll(collection).find(
      (r) => r.title.toLowerCase() === title.toLowerCase()
    )
  }

  public create(
    collection: string,
    title: string,
    payload: Record<string, unknown>,
    status = 'published',
    sortOrder?: number
  ): CmsRecord {
    const id = this.nextId++
    const slug = `${collection}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const record: CmsRecord = {
      id,
      userId: 'admin-ashok-rimal',
      collection,
      title,
      slug,
      payload,
      status,
      sortOrder: sortOrder ?? this.records.size,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.records.set(id, record)
    return record
  }

  public update(id: number, updates: Partial<CmsRecord>): CmsRecord | null {
    const current = this.records.get(id)
    if (!current) return null
    const updated: CmsRecord = {
      ...current,
      ...updates,
      payload: updates.payload
        ? { ...current.payload, ...updates.payload }
        : current.payload,
      updatedAt: new Date(),
    }
    this.records.set(id, updated)
    return updated
  }

  public delete(id: number): boolean {
    return this.records.delete(id)
  }
}

// Global singleton instance
declare global {
  var __cmsMemoryRepo: MemoryCmsRepository | undefined
}

function getMemoryRepo(): MemoryCmsRepository {
  if (!globalThis.__cmsMemoryRepo) {
    globalThis.__cmsMemoryRepo = new MemoryCmsRepository()
  }
  return globalThis.__cmsMemoryRepo
}

// --- CMS QUERY FUNCTIONS FOR FRONTEND & ADMIN ---

/**
 * Retrieve all published records for a collection
 */
export async function getPublishedCmsContent(collection: string): Promise<CmsRecord[]> {
  const repo = getMemoryRepo()
  try {
    const rows = await db
      .select({
        id: cmsContent.id,
        collection: cmsContent.collection,
        title: cmsContent.title,
        slug: cmsContent.slug,
        payload: cmsContent.payload,
        status: cmsContent.status,
        sortOrder: cmsContent.sortOrder,
        createdAt: cmsContent.createdAt,
        updatedAt: cmsContent.updatedAt,
      })
      .from(cmsContent)
      .where(
        and(
          eq(cmsContent.collection, collection),
          eq(cmsContent.status, 'published')
        )
      )
      .orderBy(asc(cmsContent.sortOrder), desc(cmsContent.createdAt))

    if (rows && rows.length > 0) {
      // Synchronize back to memory cache
      rows.forEach((r) => repo.update(r.id, r as CmsRecord))
      return rows as CmsRecord[]
    }
  } catch {
    // Database offline fallback to memory
  }

  return repo.getPublished(collection)
}

/**
 * Retrieve all records (draft + published) for admin management
 */
export async function getAllCmsContent(collection?: string): Promise<CmsRecord[]> {
  const repo = getMemoryRepo()
  try {
    const userId = await requireUser()
    let query = db
      .select({
        id: cmsContent.id,
        collection: cmsContent.collection,
        title: cmsContent.title,
        slug: cmsContent.slug,
        payload: cmsContent.payload,
        status: cmsContent.status,
        sortOrder: cmsContent.sortOrder,
        createdAt: cmsContent.createdAt,
        updatedAt: cmsContent.updatedAt,
      })
      .from(cmsContent)
      .where(eq(cmsContent.userId, userId))
      .orderBy(asc(cmsContent.sortOrder), desc(cmsContent.createdAt))

    const rows = await query
    if (rows && rows.length > 0) {
      if (collection) {
        return (rows as CmsRecord[]).filter(
          (r) => r.collection.toLowerCase() === collection.toLowerCase()
        )
      }
      return rows as CmsRecord[]
    }
  } catch {
    // Database offline fallback
  }

  return repo.getAll(collection)
}

export interface HeroSectionConfig {
  heading?: string
  subtitle?: string
  location?: string
  initials?: string
  imageUrl?: string
  stats?: Array<{ label: string; value: string }>
  metaLeft?: string
  metaRight?: string
  [key: string]: any
}

export interface ProfileContent {
  title?: string
  fullName?: string
  headline?: string
  summary?: string
  bio?: string
  location?: string
  status?: string
  avatarUrl?: string
  email?: string
  github?: string
  linkedin?: string
  website?: string
  interests?: string[]
  [key: string]: any
}

/**
 * Retrieve Hero Section configuration from CMS
 */
export async function getHeroSectionConfig(): Promise<HeroSectionConfig> {
  const records = await getPublishedCmsContent('Site Settings')
  const heroRecord = records.find(
    (r) => r.title.toLowerCase() === 'hero section'
  )
  if (heroRecord && heroRecord.payload) {
    return heroRecord.payload as HeroSectionConfig
  }
  const repo = getMemoryRepo()
  const fallback = repo.getByTitle('Site Settings', 'Hero Section')
  return (fallback?.payload as HeroSectionConfig) ?? {}
}

/**
 * Retrieve Homepage Sections Ordering & Visibility from CMS
 */
export interface HomepageSectionMeta {
  eyebrow?: string
  kr?: string
  title?: string
  accent?: string
  description?: string
  href?: string
  primaryLabel?: string
  secondaryLabel?: string
  meta?: string
}

export async function getHomepageSectionsConfig(): Promise<{
  order: string[]
  enabled: Record<string, boolean>
  sectionMeta: Record<string, HomepageSectionMeta>
}> {
  const records = await getPublishedCmsContent('Site Settings')
  const sectionsRecord = records.find(
    (r) => r.title.toLowerCase() === 'homepage sections'
  )
  if (sectionsRecord && sectionsRecord.payload) {
    return sectionsRecord.payload as any
  }

  // No homepage configuration in the CMS means no sections to show.
  return { order: [], enabled: {}, sectionMeta: {} }
}

/**
 * Retrieve Profile biography from CMS
 */
export async function getProfileContent(): Promise<ProfileContent> {
  const records = await getPublishedCmsContent('Profile')
  if (records[0]) {
    return {
      title: records[0].title,
      ...records[0].payload,
    } as ProfileContent
  }
  const repo = getMemoryRepo()
  const fallback = repo.getAll('Profile')[0]
  return fallback ? ({ title: fallback.title, ...fallback.payload } as ProfileContent) : {}
}

/**
 * Retrieve featured projects from CMS
 */
export async function getFeaturedProjects(limit = 3): Promise<CmsRecord[]> {
  const projects = await getPublishedCmsContent('Projects')
  const featured = projects.filter((p) => p.payload?.featured === true)
  return (featured.length ? featured : projects).slice(0, limit)
}

/**
 * Retrieve gallery items from CMS
 */
export async function getGalleryItems(limit = 4): Promise<CmsRecord[]> {
  const gallery = await getPublishedCmsContent('Gallery')
  return gallery.slice(0, limit)
}

/**
 * Retrieve experience milestones from CMS
 */
export async function getExperienceItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Experience')
}

/**
 * Retrieve education history from CMS
 */
export async function getEducationItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Education')
}

/**
 * Retrieve categorized skills from CMS
 */
export async function getSkillsContent(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Skills')
}

/**
 * Retrieve media items from CMS (Music, Anime, Manga)
 */
export async function getMediaPreviews(): Promise<{
  music: CmsRecord[]
  anime: CmsRecord[]
  manga: CmsRecord[]
}> {
  const [music, anime, manga] = await Promise.all([
    getPublishedCmsContent('Music'),
    getPublishedCmsContent('Anime'),
    getPublishedCmsContent('Manga'),
  ])
  return { music, anime, manga }
}

/**
 * Retrieve social links from CMS
 */
export async function getSocialLinks(): Promise<CmsRecord[]> {
  return getPublishedCmsContent('Social Links')
}

// --- CMS MUTATION FUNCTIONS ---

export async function createCmsContent(formData: FormData) {
  const collection = String(formData.get('collection') || 'Profile').trim()
  const title = String(formData.get('title') || '').trim()
  if (!title) throw new Error('A title is required')

  let payload: Record<string, unknown> = {}
  const rawPayload = formData.get('payload')
  if (typeof rawPayload === 'string' && rawPayload.trim()) {
    try {
      const parsed = JSON.parse(rawPayload)
      payload =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : { description: rawPayload.trim() }
    } catch {
      payload = { description: rawPayload.trim() }
    }
  }

  // Page Copy and Media Collections are looked up by key, not by title, so the
  // key is taken from the form when present.
  const key = String(formData.get('key') || '').trim().toLowerCase()
  if (key) payload.key = key

  // Also extract explicit common fields from form if present
  const imageUrl = formData.get('imageUrl')
  if (imageUrl) payload.imageUrl = String(imageUrl).trim()
  const category = formData.get('category')
  if (category) payload.category = String(category).trim()
  const status = String(formData.get('status') || 'published')

  const repo = getMemoryRepo()
  const created = repo.create(collection, title, payload, status)

  try {
    const userId = await requireUser()
    await db.insert(cmsContent).values({
      userId,
      collection,
      title,
      slug: created.slug,
      payload,
      status,
      sortOrder: created.sortOrder,
    })
  } catch (err) {
    console.warn('[CMS] Database insert fallback to memory repo:', err)
  }

  revalidateAllRoutes()
}

export async function updateCmsContent(id: number, formData: FormData) {
  const collection = String(formData.get('collection') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const status = String(formData.get('status') || '').trim()

  // A JSON body replaces the payload. Plain text only changes the description and
  // leaves every other field of the record intact, so editing a structured record
  // from the simple form can never wipe its configuration.
  let replacement: Record<string, unknown> | undefined
  let description: string | undefined
  const rawPayload = formData.get('payload')
  if (typeof rawPayload === 'string' && rawPayload.trim()) {
    try {
      const parsed = JSON.parse(rawPayload)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        replacement = parsed as Record<string, unknown>
      } else {
        description = rawPayload.trim()
      }
    } catch {
      description = rawPayload.trim()
    }
  }

  const imageUrl = String(formData.get('imageUrl') || '').trim()

  let payloadUpdates: Record<string, unknown> =
    replacement ?? ((getMemoryRepo().getById(id)?.payload as Record<string, unknown>) ?? {})
  if (description !== undefined) payloadUpdates = { ...payloadUpdates, description }
  if (imageUrl) payloadUpdates = { ...payloadUpdates, imageUrl }

  const repo = getMemoryRepo()
  const updates: Partial<CmsRecord> = { payload: payloadUpdates }
  if (collection) updates.collection = collection
  if (title) updates.title = title
  if (status) updates.status = status

  repo.update(id, updates)

  try {
    const userId = await requireUser()

    // The memory repo is never seeded, so the stored payload has to come from the
    // database when the form only supplied a description.
    const [current] = await db
      .select({ payload: cmsContent.payload })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)

    let storedPayload: Record<string, unknown> =
      replacement ?? ((current?.payload as Record<string, unknown>) ?? {})
    if (description !== undefined) storedPayload = { ...storedPayload, description }
    if (imageUrl) storedPayload = { ...storedPayload, imageUrl }

    await db
      .update(cmsContent)
      .set({
        ...(title ? { title } : {}),
        ...(collection ? { collection } : {}),
        ...(status ? { status } : {}),
        payload: storedPayload,
        updatedAt: new Date(),
      })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Database update fallback to memory repo:', err)
  }

  revalidateAllRoutes()
}

export async function deleteCmsContent(id: number) {
  const repo = getMemoryRepo()
  repo.delete(id)

  try {
    const userId = await requireUser()
    await db
      .delete(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Database delete fallback to memory repo:', err)
  }

  revalidateAllRoutes()
}

export async function toggleCmsStatus(id: number) {
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ status: cmsContent.status })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)
    const current = rows[0]
    if (!current) return
    const nextStatus = current.status === 'published' ? 'draft' : 'published'
    await db
      .update(cmsContent)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (error) {
    console.warn('[CMS] Status toggle failed:', error)
    return
  }

  revalidateAllRoutes()
}

export async function toggleCmsFeatured(id: number) {
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ payload: cmsContent.payload })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)
    const current = rows[0]
    if (!current) return
    const nextPayload = { ...(current.payload ?? {}), featured: current.payload?.featured !== true }
    await db
      .update(cmsContent)
      .set({ payload: nextPayload, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (error) {
    console.warn('[CMS] Featured toggle failed:', error)
    return
  }

  revalidateAllRoutes()
}

export async function updateHomepageSectionsOrder(
  order: string[],
  enabled: Record<string, boolean>
) {
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ payload: cmsContent.payload })
      .from(cmsContent)
      .where(
        and(
          eq(cmsContent.collection, 'Site Settings'),
          eq(cmsContent.title, 'Homepage Sections'),
          eq(cmsContent.userId, userId)
        )
      )
      .limit(1)
    if (!rows[0]) return
    const payload = { ...(rows[0].payload ?? {}), order, enabled }
    await db
      .update(cmsContent)
      .set({ payload, updatedAt: new Date() })
      .where(
        and(
          eq(cmsContent.collection, 'Site Settings'),
          eq(cmsContent.title, 'Homepage Sections'),
          eq(cmsContent.userId, userId)
        )
      )
  } catch (error) {
    console.warn('[CMS] Homepage sections update failed:', error)
    return
  }

  revalidateAllRoutes()
}

export async function updateHeroSettings(payload: Record<string, unknown>) {
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ payload: cmsContent.payload })
      .from(cmsContent)
      .where(
        and(
          eq(cmsContent.collection, 'Site Settings'),
          eq(cmsContent.title, 'Hero Section'),
          eq(cmsContent.userId, userId)
        )
      )
      .limit(1)
    if (!rows[0]) return
    await db
      .update(cmsContent)
      .set({ payload: { ...(rows[0].payload ?? {}), ...payload }, updatedAt: new Date() })
      .where(
        and(
          eq(cmsContent.collection, 'Site Settings'),
          eq(cmsContent.title, 'Hero Section'),
          eq(cmsContent.userId, userId)
        )
      )
  } catch (error) {
    console.warn('[CMS] Hero settings update failed:', error)
    return
  }

  revalidateAllRoutes()
}

export async function getHeroImage() {
  const hero = await getHeroSectionConfig()
  return typeof hero.imageUrl === 'string' ? hero.imageUrl : undefined
}

export async function saveCmsImage(url: string) {
  await updateHeroSettings({ imageUrl: url })
}

function revalidateAllRoutes() {
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/projects')
  revalidatePath('/media')
  revalidatePath('/contact')
  revalidatePath('/blogs')
  revalidatePath('/admin')
}
