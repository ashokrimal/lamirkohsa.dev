import { and, asc, desc, sql } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db, hasDatabaseConfig, withDbRetry } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { CMS_CACHE_TAG, CMS_REVALIDATE_SECONDS, cmsCollectionTag } from '@/lib/cms-cache'
import {
  CMS_COLLECTIONS,
  CMS_KEYS,
  indexCmsRecordsByKey,
  type CmsResult,
} from '@/lib/cms-schema'

/**
 * Read-only access to the published CMS records.
 *
 * The admin studio lives in its own deployment (`lamirkohsa.cms`) but writes to
 * the same Postgres database, so the public site only ever reads: there are no
 * mutations, no owner checks and no uploads in this repository. Reads are cached
 * and tagged, and the studio pings `/api/revalidate` after a save so a change
 * appears without waiting for the cache window.
 */

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

function normalizeCmsProjectPayload(
  collection: string,
  payload: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const safe = payload ?? {}
  if (collection.trim().toLowerCase() !== 'projects') return safe
  if (typeof safe.status === 'string' && /^production\s+prototype$/i.test(safe.status.trim())) {
    return { ...safe, status: 'Prototype' }
  }
  return safe
}

let missingDatabaseNoticeShown = false

function warnMissingDatabase() {
  if (missingDatabaseNoticeShown) return
  missingDatabaseNoticeShown = true
  console.warn(
    '[CMS] Database is not configured; CMS-backed content will render empty. Set DATABASE_URL in the deployment environment.',
  )
}

function errorCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string') return ` (${code})`
  }
  return ''
}

declare global {
  var __cmsLastKnownPublished: Map<string, CmsRecord[]> | undefined
}

function getLastKnownPublishedMap(): Map<string, CmsRecord[]> {
  if (!globalThis.__cmsLastKnownPublished) {
    globalThis.__cmsLastKnownPublished = new Map()
  }
  return globalThis.__cmsLastKnownPublished
}

async function fetchPublishedCollection(collection: string): Promise<CmsRecord[]> {
  const normalizedCollection = collection.trim().toLowerCase()
  try {
    const rows = await withDbRetry(() =>
      db
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
            sql`lower(trim(${cmsContent.collection})) = ${normalizedCollection}`,
            sql`lower(trim(${cmsContent.status})) = 'published'`,
          ),
        )
        .orderBy(asc(cmsContent.sortOrder), desc(cmsContent.createdAt)),
    )

    // Deduplicate by locked key or slug. Titles are editable in the CMS and are
    // never used as identity.
    const seen = new Set<string>()
    const normalized = (rows as CmsRecord[])
      .filter((r) => {
        const payloadKey =
          typeof r.payload?.key === 'string' ? r.payload.key.trim().toLowerCase() : ''
        const key = payloadKey
          ? `${r.collection}::key:${payloadKey}`
          : `${r.collection}::slug:${r.slug || r.id}`.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((r) => ({
        ...r,
        payload: normalizeCmsProjectPayload(r.collection, r.payload),
      }))

    getLastKnownPublishedMap().set(normalizedCollection, normalized)
    return normalized
  } catch (error) {
    const stale = getLastKnownPublishedMap().get(normalizedCollection)
    if (stale !== undefined) {
      console.warn(
        `[CMS] Preserving cached "${collection}" snapshot after transient DB error${errorCode(error)}.`,
      )
      return stale
    }
    throw error
  }
}

const cachedCollectionReaders = new Map<string, (collection: string) => Promise<CmsRecord[]>>()

function getCachedCollectionReader(collection: string): () => Promise<CmsRecord[]> {
  let reader = cachedCollectionReaders.get(collection)
  if (!reader) {
    reader = unstable_cache(fetchPublishedCollection, ['cms-published', collection], {
      tags: [CMS_CACHE_TAG, cmsCollectionTag(collection)],
      revalidate: CMS_REVALIDATE_SECONDS,
    })
    cachedCollectionReaders.set(collection, reader)
  }
  return () => reader!(collection)
}

/** Retrieve all published records for a collection. */
export async function getPublishedCmsContentResult(
  collection: string,
): Promise<CmsResult<CmsRecord[]>> {
  if (!hasDatabaseConfig()) {
    warnMissingDatabase()
    return { status: 'empty' }
  }

  try {
    const rows = await getCachedCollectionReader(collection)()
    if (rows.length > 0) return { status: 'ok', data: rows }
    return { status: 'empty' }
  } catch (error) {
    console.error(`[CMS] Could not read published "${collection}"${errorCode(error)}.`)
    if (process.env.NODE_ENV !== 'production') console.error(error)
    return {
      status: 'error',
      message: `${collection} content is temporarily unavailable.`,
    }
  }
}

/**
 * Bypass Next.js Data Cache to read freshly published records directly from
 * Postgres (used by previews right after the studio saves).
 */
export async function getFreshPublishedCmsContentResult(
  collection: string,
): Promise<CmsResult<CmsRecord[]>> {
  if (!hasDatabaseConfig()) {
    warnMissingDatabase()
    return { status: 'empty' }
  }

  try {
    const rows = await fetchPublishedCollection(collection)
    if (rows.length > 0) return { status: 'ok', data: rows }
    return { status: 'empty' }
  } catch (error) {
    console.error(`[CMS] Could not read fresh published "${collection}"${errorCode(error)}.`)
    if (process.env.NODE_ENV !== 'production') console.error(error)
    return {
      status: 'error',
      message: `${collection} content is temporarily unavailable.`,
    }
  }
}

/** Compatibility getter for callers that do not need the explicit result. */
export async function getPublishedCmsContent(collection: string): Promise<CmsRecord[]> {
  const result = await getPublishedCmsContentResult(collection)
  if (result.status === 'ok') return result.data
  if (result.status === 'error') {
    return getLastKnownPublishedMap().get(collection.trim().toLowerCase()) ?? []
  }
  return []
}

export interface HeroSectionConfig {
  heading?: string
  subtitle?: string
  location?: string
  initials?: string
  imageUrl?: string
  imageAlt?: string
  stats?: Array<{ label: string; value: string }>
  metaLeft?: string
  metaRight?: string
  [key: string]: unknown
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
  [key: string]: unknown
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
    return sectionsRecord.payload as unknown as HomepageSectionsConfig
  }
  return { order: [], enabled: {}, sectionMeta: {} }
}

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

export async function getFeaturedProjects(limit = 3): Promise<CmsRecord[]> {
  const projects = await getPublishedCmsContent(CMS_COLLECTIONS.projects)
  const featured = projects.filter((project) => project.payload?.featured === true)
  return (featured.length ? featured : projects).slice(0, limit)
}

export async function getGalleryItems(limit = 4): Promise<CmsRecord[]> {
  const gallery = await getPublishedCmsContent(CMS_COLLECTIONS.gallery)
  return gallery.slice(0, limit)
}

export async function getExperienceItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.experience)
}

export async function getEducationItems(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.education)
}

export async function getSkillsContent(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.skills)
}

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

export async function getSocialLinks(): Promise<CmsRecord[]> {
  return getPublishedCmsContent(CMS_COLLECTIONS.socialLinks)
}
