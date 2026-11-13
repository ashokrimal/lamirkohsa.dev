'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { and, asc, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { getAdminActorId } from '@/lib/admin-auth'
import { CMS_CACHE_TAG, CMS_REVALIDATE_SECONDS, cmsCollectionTag } from '@/lib/cms-cache'
import {
  CMS_COLLECTIONS,
  CMS_KEYS,
  CMS_SCHEMA,
  indexCmsRecordsByKey,
  type CmsResult,
} from '@/lib/cms-schema'
import { toSlug } from '@/lib/slug'

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

/**
 * Resolves the owner id for admin mutations. Requires a signed-in owner: either a
 * better-auth session or a valid admin session cookie. Anything else is rejected.
 */
async function requireUser(): Promise<string> {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized: sign in to the admin studio first.')
  return actorId
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
    const filtered = collection
      ? list.filter((r) => r.collection.toLowerCase() === collection.toLowerCase())
      : list
    const seen = new Set<string>()
    return filtered
      .filter((r) => {
        const payloadKey = typeof r.payload?.key === 'string' ? r.payload.key.trim().toLowerCase() : ''
        // Keyed records are unique by their locked key. Everything else is unique
        // by slug, so renaming a record's title never changes its identity.
        const key = payloadKey
          ? `${r.collection.toLowerCase()}::key:${payloadKey}`
          : `${r.collection}::slug:${r.slug || r.id}`.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  public getPublished(collection: string): CmsRecord[] {
    return this.getAll(collection).filter((r) => r.status === 'published')
  }

  public getById(id: number): CmsRecord | undefined {
    return this.records.get(id)
  }

  public getByKey(collection: string, key: string): CmsRecord | undefined {
    return this.getAll(collection).find(
      (r) => String(r.payload?.key ?? '').trim().toLowerCase() === key.trim().toLowerCase()
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

async function fetchPublishedCollection(collection: string): Promise<CmsRecord[]> {
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
      and(eq(cmsContent.collection, collection), eq(cmsContent.status, 'published'))
    )
    .orderBy(asc(cmsContent.sortOrder), desc(cmsContent.createdAt))

  // Deduplicate by locked key or slug. Titles are editable in the CMS and are
  // never used as identity.
  const seen = new Set<string>()
  return (rows as CmsRecord[]).filter((r) => {
    const payloadKey = typeof r.payload?.key === 'string' ? r.payload.key.trim().toLowerCase() : ''
    const key = payloadKey
      ? `${r.collection}::key:${payloadKey}`
      : `${r.collection}::slug:${r.slug || r.id}`.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Retrieve all published records for a collection.
 *
 * Reads are cached and tagged, so pages can be statically rendered or
 * revalidated on demand instead of querying the database on every request.
 * Admin mutations call `revalidateTag(CMS_CACHE_TAG)`, and the cache also
 * refreshes on its own after `CMS_REVALIDATE_SECONDS`.
 */
export async function getPublishedCmsContentResult(
  collection: string,
): Promise<CmsResult<CmsRecord[]>> {
  try {
    const rows = await unstable_cache(
      () => fetchPublishedCollection(collection),
      ['cms-published', collection],
      {
        tags: [CMS_CACHE_TAG, cmsCollectionTag(collection)],
        revalidate: CMS_REVALIDATE_SECONDS,
      }
    )()

    if (rows.length > 0) {
      // Keep the in-memory copy available to admin previews during this process.
      rows.forEach((r) => getMemoryRepo().update(r.id, r))
      return { status: 'ok', data: rows }
    }

    return { status: 'empty' }
  } catch (error) {
    console.error(`[CMS] Could not read published "${collection}"`, error)
    return {
      status: 'error',
      message: `${collection} content is temporarily unavailable.`,
    }
  }
}

/**
 * Compatibility getter for callers that do not yet need the explicit result.
 * Public pages use getPublishedCmsContentResult so an outage is not mistaken for
 * an empty collection.
 */
export async function getPublishedCmsContent(collection: string): Promise<CmsRecord[]> {
  const result = await getPublishedCmsContentResult(collection)
  if (result.status === 'ok') return result.data
  if (result.status === 'error') return getMemoryRepo().getPublished(collection)
  return []
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
  /** How many cards the preview collection shows before the View all card. */
  previewCount?: number
}

export interface HomepageSectionsConfig {
  order: string[]
  enabled: Record<string, boolean>
  sectionMeta: Record<string, HomepageSectionMeta>
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

export async function getHeroSectionConfigResult(): Promise<CmsResult<HeroSectionConfig>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.siteSettings)
  if (result.status !== 'ok') return result
  const heroRecord = indexCmsRecordsByKey(result.data)[CMS_KEYS.hero]
  return {
    status: 'ok',
    data: heroRecord?.payload ? (heroRecord.payload as HeroSectionConfig) : {},
  }
}

export async function getHomepageSectionsConfigResult(): Promise<
  CmsResult<HomepageSectionsConfig>
> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.siteSettings)
  if (result.status !== 'ok') return result
  const sectionsRecord = indexCmsRecordsByKey(result.data)[CMS_KEYS.homepageSections]
  return {
    status: 'ok',
    data: sectionsRecord?.payload
      ? (sectionsRecord.payload as unknown as HomepageSectionsConfig)
      : { order: [], enabled: {}, sectionMeta: {} },
  }
}

export async function getHeroSectionConfig(): Promise<HeroSectionConfig> {
  const records = await getPublishedCmsContent(CMS_COLLECTIONS.siteSettings)
  const heroRecord = indexCmsRecordsByKey(records)[CMS_KEYS.hero]
  return heroRecord?.payload ? (heroRecord.payload as HeroSectionConfig) : {}
}

export async function getHomepageSectionsConfig(): Promise<HomepageSectionsConfig> {
  const records = await getPublishedCmsContent(CMS_COLLECTIONS.siteSettings)
  const sectionsRecord = indexCmsRecordsByKey(records)[CMS_KEYS.homepageSections]
  if (sectionsRecord?.payload) {
    return sectionsRecord.payload as any
  }

  // No homepage configuration in the CMS means no sections to show.
  return { order: [], enabled: {}, sectionMeta: {} }
}

/**
 * Retrieve Profile biography from CMS
 */
export async function getProfileContentResult(): Promise<CmsResult<ProfileContent>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.profile)
  if (result.status !== 'ok') return result
  if (!result.data[0]) return { status: 'empty' }
  return {
    status: 'ok',
    data: {
      title: result.data[0].title,
      ...result.data[0].payload,
    } as ProfileContent,
  }
}

export async function getProfileContent(): Promise<ProfileContent> {
  const records = await getPublishedCmsContent(CMS_COLLECTIONS.profile)
  if (records[0]) {
    return {
      title: records[0].title,
      ...records[0].payload,
    } as ProfileContent
  }
  return {}
}

/**
 * Retrieve featured projects from CMS
 */
export async function getFeaturedProjects(limit = 3): Promise<CmsRecord[]> {
  const projects = await getPublishedCmsContent(CMS_COLLECTIONS.projects)
  const featured = projects.filter((p) => p.payload?.featured === true)
  return (featured.length ? featured : projects).slice(0, limit)
}

/**
 * Retrieve gallery items from CMS
 */
export async function getGalleryItems(limit = 4): Promise<CmsRecord[]> {
  const gallery = await getPublishedCmsContent(CMS_COLLECTIONS.gallery)
  return gallery.slice(0, limit)
}

/**
 * Retrieve experience milestones from CMS
 */
export async function getExperienceItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.experience)
}

/**
 * Retrieve education history from CMS
 */
export async function getEducationItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.education)
}

/**
 * Retrieve categorized skills from CMS
 */
export async function getSkillsContent(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.skills)
}

/**
 * Retrieve media items from CMS (Music, Anime, Manga)
 */
export async function getMediaPreviews(): Promise<{
  music: CmsRecord[]
  movies: CmsRecord[]
  anime: CmsRecord[]
  manga: CmsRecord[]
}> {
  const [music, movies, anime, manga] = await Promise.all([
    getPublishedCmsContent(CMS_COLLECTIONS.music),
    getPublishedCmsContent(CMS_COLLECTIONS.movies),
    getPublishedCmsContent(CMS_COLLECTIONS.anime),
    getPublishedCmsContent(CMS_COLLECTIONS.manga),
  ])
  return { music, movies, anime, manga }
}

/**
 * Retrieve social links from CMS
 */
export async function getSocialLinks(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.socialLinks)
}

// --- CMS MUTATION FUNCTIONS ---

export async function createCmsContent(formData: FormData) {
  const collection = String(formData.get('collection') || CMS_COLLECTIONS.profile).trim()
  const title = String(formData.get('title') || '').trim()
  if (!title) throw new Error('A title is required')

  const collectionSchema = Object.values(CMS_SCHEMA.collections).find(
    (entry) => entry.name === collection,
  )
  if (!collectionSchema) throw new Error(`Unknown CMS collection: ${collection}`)

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

  // Keyed collections are found by their locked key, never by title or slug.
  // Site Settings can derive a key from the title because the admin form does
  // not ask for one; Page Copy and Media Collections must supply it explicitly.
  const key = String(formData.get('key') || '').trim().toLowerCase()
  if (collectionSchema.keyed) {
    const resolvedKey =
      key || (collection === CMS_COLLECTIONS.siteSettings ? toSlug(title) : '')
    if (!resolvedKey) throw new Error(`A key is required for ${collection}`)
    payload.key = resolvedKey
  } else if (key) {
    payload.key = key
  }

  // Also extract explicit common fields from form if present
  const imageUrl = formData.get('imageUrl')
  if (imageUrl) payload.imageUrl = String(imageUrl).trim()
  const category = formData.get('category')
  if (category) payload.category = String(category).trim()
  for (const field of [
    'live',
    'github',
    'summary',
    'altText',
    'period',
    'completionDate',
    'duration',
    'model',
    'cost',
    'challenge',
    'solution',
    'caseStudyPlan',
    'documentation',
    'srsDoc',
    'architectureDoc',
    'apiDoc',
    'readmeDoc',
    'testPlanDoc',
    'runbookDoc',
    'userManualDoc',
    'status',
  ]) {
    const value = formData.get(field)
    if (typeof value === 'string' && value.trim()) payload[field] = value.trim()
  }
  const techStack = formData.get('techStack')
  if (typeof techStack === 'string' && techStack.trim()) {
    payload.techStack = techStack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
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

  revalidateCms(collection)
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

  const previous = getMemoryRepo().getById(id)
  let payloadUpdates: Record<string, unknown> =
    replacement ?? ((previous?.payload as Record<string, unknown>) ?? {})
  const previousKey =
    typeof previous?.payload?.key === 'string' ? previous.payload.key : undefined
  if (previousKey && !payloadUpdates.key) payloadUpdates = { ...payloadUpdates, key: previousKey }
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
      .select({ payload: cmsContent.payload, collection: cmsContent.collection })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)

    let storedPayload: Record<string, unknown> =
      replacement ?? ((current?.payload as Record<string, unknown>) ?? {})
    const storedKey =
      typeof current?.payload?.key === 'string' ? current.payload.key : undefined
    if (storedKey && !storedPayload.key) storedPayload = { ...storedPayload, key: storedKey }
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

    revalidateCms(collection || current?.collection || previous?.collection)
  } catch (err) {
    console.warn('[CMS] Database update fallback to memory repo:', err)
    revalidateCms(collection || previous?.collection)
  }
}

export async function deleteCmsContent(id: number) {
  const repo = getMemoryRepo()
  const previous = repo.getById(id)
  repo.delete(id)

  let collection = previous?.collection
  try {
    const userId = await requireUser()
    const [current] = await db
      .select({ collection: cmsContent.collection })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)
    collection = collection || current?.collection
    await db
      .delete(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (err) {
    console.warn('[CMS] Database delete fallback to memory repo:', err)
  }

  revalidateCms(collection)
}

export async function toggleCmsStatus(id: number) {
  let collection: string | undefined
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ status: cmsContent.status, collection: cmsContent.collection })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)
    const current = rows[0]
    if (!current) return
    collection = current.collection
    const nextStatus = current.status === 'published' ? 'draft' : 'published'
    await db
      .update(cmsContent)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (error) {
    console.warn('[CMS] Status toggle failed:', error)
    return
  }

  revalidateCms(collection)
}

export async function toggleCmsFeatured(id: number) {
  let collection: string | undefined
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ payload: cmsContent.payload, collection: cmsContent.collection })
      .from(cmsContent)
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
      .limit(1)
    const current = rows[0]
    if (!current) return
    collection = current.collection
    const nextPayload = { ...(current.payload ?? {}), featured: current.payload?.featured !== true }
    await db
      .update(cmsContent)
      .set({ payload: nextPayload, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, id), eq(cmsContent.userId, userId)))
  } catch (error) {
    console.warn('[CMS] Featured toggle failed:', error)
    return
  }

  revalidateCms(collection)
}

async function updateKeyedSetting(key: string, merge: Record<string, unknown>) {
  try {
    const userId = await requireUser()
    const rows = await db
      .select({ id: cmsContent.id, payload: cmsContent.payload })
      .from(cmsContent)
      .where(
        and(
          eq(cmsContent.collection, CMS_COLLECTIONS.siteSettings),
          eq(cmsContent.userId, userId),
        ),
      )
    const current = rows.find(
      (row) => String(row.payload?.key ?? '').trim().toLowerCase() === key,
    )
    if (!current) return
    await db
      .update(cmsContent)
      .set({ payload: { ...(current.payload ?? {}), ...merge }, updatedAt: new Date() })
      .where(and(eq(cmsContent.id, current.id), eq(cmsContent.userId, userId)))
  } catch (error) {
    console.warn(`[CMS] ${key} update failed:`, error)
    return
  }

  revalidateCms(CMS_COLLECTIONS.siteSettings)
}

export async function updateHomepageSectionsOrder(
  order: string[],
  enabled: Record<string, boolean>
) {
  await updateKeyedSetting(CMS_KEYS.homepageSections, { order, enabled })
}

export async function updateHeroSettings(payload: Record<string, unknown>) {
  await updateKeyedSetting(CMS_KEYS.hero, payload)
}

export async function getHeroImage() {
  const hero = await getHeroSectionConfig()
  return typeof hero.imageUrl === 'string' ? hero.imageUrl : undefined
}

export async function saveCmsImage(url: string) {
  await updateHeroSettings({ imageUrl: url })
}

function revalidateCms(collection?: string) {
  revalidateTag(CMS_CACHE_TAG)
  if (collection) revalidateTag(cmsCollectionTag(collection))
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/projects')
  revalidatePath('/projects/[slug]', 'page')
  revalidatePath('/media')
  revalidatePath('/contact')
  revalidatePath('/blogs')
  revalidatePath('/admin')
}
