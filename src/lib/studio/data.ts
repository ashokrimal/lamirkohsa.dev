import { pool } from '@/lib/db'
import { sitePage, sitePageSection, siteSetting, studioProject } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import {
  DEFAULT_PAGE_SECTIONS,
  DEFAULT_PAGES,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/studio/fixtures'
import { parseSectionContent, parseSocialLinks, type SectionKey, type SocialLink } from '@/lib/studio/sections'
import { resolveProjectLifecycleStatus, type ProjectLifecycleStatus } from '@/lib/project-status'

/**
 * The studio data layer.
 *
 * Reads are cached with Next's data cache under `page-${slug}`, `projects` and
 * `site-settings`; mutations call `revalidateTag` with the same tags. Every
 * read degrades to the fixtures when the database or the new tables are not
 * available yet, so publishing this code before running the seed cannot blank
 * a page.
 */

export interface StudioPage {
  id: number | null
  slug: string
  title: string
  metaDescription: string
  isPublished: boolean
  /** ISO timestamp of the last studio write, used for real sitemap dates. */
  updatedAt?: string
}

export interface StudioPageSection {
  id: number | null
  pageId: number | null
  sectionKey: string
  sortOrder: number
  isEnabled: boolean
  content: Record<string, unknown>
}

export interface StudioPageWithSections {
  page: StudioPage
  sections: StudioPageSection[]
  /** `default` means the fallback fixtures were used, not a database read. */
  source: 'database' | 'default'
}

export interface StudioProject {
  id: number
  slug: string
  title: string
  category?: string
  summary?: string
  problem?: string
  solution?: string
  techStack: string[]
  coverMediaUrl?: string
  liveUrl?: string
  repoUrl?: string
  featuredOrder?: number
  status: ProjectLifecycleStatus
  isPublished: boolean
  /** ISO timestamp of the last studio write, used for real sitemap dates. */
  updatedAt?: string
}

export interface StudioSiteSettings {
  contactEmail: string
  availabilityStatus: string
  socialLinks: SocialLink[]
  source: 'database' | 'default'
}

/** Drizzle returns `Date` for these columns; keep the ISO form in the view model. */
function rowTimestamp(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function normalizePageSlug(slug: string) {
  if (!slug || slug === '/') return '/'
  const withLeading = slug.startsWith('/') ? slug : `/${slug}`
  return withLeading.replace(/\/+$/, '') || '/'
}

let tablesReady = false
let tablesReadyPromise: Promise<void> | null = null

/**
 * The project has no committed migration runner; each studio read ensures its
 * own tables once per process. This mirrors how `adminCredential` is created.
 */
export async function ensureStudioTables() {
  if (tablesReady) return
  if (tablesReadyPromise) return tablesReadyPromise
  tablesReadyPromise = pool
    .query(`
      CREATE TABLE IF NOT EXISTS "pages" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL UNIQUE,
        "title" text NOT NULL,
        "meta_description" text,
        "is_published" boolean NOT NULL DEFAULT true,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "page_sections" (
        "id" serial PRIMARY KEY,
        "page_id" integer NOT NULL,
        "section_key" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "content_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "page_sections_page_id_fk" FOREIGN KEY ("page_id")
          REFERENCES "pages" ("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "page_sections_page_idx" ON "page_sections" ("page_id", "sort_order");
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL UNIQUE,
        "title" text NOT NULL,
        "category" text,
        "summary" text,
        "problem" text,
        "solution" text,
        "tech_stack" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "cover_media_url" text,
        "live_url" text,
        "repo_url" text,
        "featured_order" integer,
        "status" text NOT NULL DEFAULT 'Active',
        "is_published" boolean NOT NULL DEFAULT true,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'Active';
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" integer PRIMARY KEY DEFAULT 1,
        "contact_email" text,
        "availability_status" text,
        "social_links" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `)
    .then(() => {
      tablesReady = true
    })
    .catch((err) => {
      tablesReadyPromise = null
      throw err
    })
  return tablesReadyPromise
}

function defaultPage(slug: string): StudioPage {
  const normalized = normalizePageSlug(slug)
  const fixture =
    DEFAULT_PAGES.find((page) => page.slug === normalized) ??
    DEFAULT_PAGES.find((page) => page.slug === '/')!
  return {
    id: null,
    slug: normalized,
    title: fixture.title,
    metaDescription: fixture.metaDescription,
    isPublished: fixture.isPublished,
  }
}

function defaultSections(slug: string): StudioPageSection[] {
  const seeds = DEFAULT_PAGE_SECTIONS[normalizePageSlug(slug)] ?? []
  return seeds
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((seed) => ({
      id: null,
      pageId: null,
      sectionKey: seed.sectionKey,
      sortOrder: seed.sortOrder,
      isEnabled: seed.isEnabled,
      content: parseSectionContent(seed.sectionKey, seed.content) as Record<string, unknown>,
    }))
}

async function readPage(slug: string): Promise<StudioPageWithSections> {
  const normalized = normalizePageSlug(slug)
  try {
    await ensureStudioTables()
    const [pageRow] = await db
      .select()
      .from(sitePage)
      .where(eq(sitePage.slug, normalized))
      .limit(1)

    if (!pageRow) {
      return { page: defaultPage(normalized), sections: defaultSections(normalized), source: 'default' }
    }

    const sectionRows = await db
      .select()
      .from(sitePageSection)
      .where(eq(sitePageSection.pageId, pageRow.id))
      .orderBy(asc(sitePageSection.sortOrder), asc(sitePageSection.id))

    return {
      page: {
        id: pageRow.id,
        slug: pageRow.slug,
        title: pageRow.title,
        metaDescription: pageRow.metaDescription ?? '',
        isPublished: pageRow.isPublished,
        updatedAt: rowTimestamp(pageRow.updatedAt),
      },
      sections: sectionRows.map((row) => ({
        id: row.id,
        pageId: row.pageId,
        sectionKey: row.sectionKey,
        sortOrder: row.sortOrder,
        isEnabled: row.isEnabled,
        content: parseSectionContent(row.sectionKey, row.content) as Record<string, unknown>,
      })),
      source: 'database',
    }
  } catch (error) {
    console.warn('[studio] page read failed:', (error as Error).message)
    return { page: defaultPage(normalized), sections: defaultSections(normalized), source: 'default' }
  }
}

const pageReaders = new Map<string, (slug: string) => Promise<StudioPageWithSections>>()

function pageReader(slug: string) {
  const cached = pageReaders.get(slug)
  if (cached) return cached
  const reader = unstable_cache(readPage, ['studio-page', slug], {
    tags: [`page-${slug}`],
    revalidate: 300,
  })
  pageReaders.set(slug, reader)
  return reader
}

export async function getPageWithSections(slug: string): Promise<StudioPageWithSections> {
  const normalized = normalizePageSlug(slug)
  return pageReader(normalized)(normalized)
}

/** Page metadata for `generateMetadata`; disabled pages are not exposed. */
export async function getPageMetadata(slug: string) {
  const result = await getPageWithSections(slug)
  if (!result.page.isPublished) return null
  return {
    title: result.page.title,
    description: result.page.metaDescription,
  }
}

async function readPublishedProjects(): Promise<StudioProject[]> {
  try {
    await ensureStudioTables()
    const rows = await db
      .select()
      .from(studioProject)
      .where(eq(studioProject.isPublished, true))
      .orderBy(asc(studioProject.featuredOrder), asc(studioProject.title))

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category ?? undefined,
      summary: row.summary ?? undefined,
      problem: row.problem ?? undefined,
      solution: row.solution ?? undefined,
      techStack: Array.isArray(row.techStack) ? row.techStack : [],
      coverMediaUrl: row.coverMediaUrl ?? undefined,
      liveUrl: row.liveUrl ?? undefined,
      repoUrl: row.repoUrl ?? undefined,
      featuredOrder: row.featuredOrder ?? undefined,
      status: resolveProjectLifecycleStatus(row.status),
      isPublished: row.isPublished,
      updatedAt: rowTimestamp(row.updatedAt),
    }))
  } catch (error) {
    console.warn('[studio] projects read failed:', (error as Error).message)
    return []
  }
}

export const getPublishedProjects = unstable_cache(readPublishedProjects, ['studio-projects'], {
  tags: ['projects'],
  revalidate: 300,
})

async function readProjectBySlug(slug: string): Promise<StudioProject | null> {
  try {
    await ensureStudioTables()
    const [row] = await db
      .select()
      .from(studioProject)
      .where(and(eq(studioProject.slug, slug), eq(studioProject.isPublished, true)))
      .limit(1)
    if (!row) return null
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category ?? undefined,
      summary: row.summary ?? undefined,
      problem: row.problem ?? undefined,
      solution: row.solution ?? undefined,
      techStack: Array.isArray(row.techStack) ? row.techStack : [],
      coverMediaUrl: row.coverMediaUrl ?? undefined,
      liveUrl: row.liveUrl ?? undefined,
      repoUrl: row.repoUrl ?? undefined,
      featuredOrder: row.featuredOrder ?? undefined,
      status: resolveProjectLifecycleStatus(row.status),
      isPublished: row.isPublished,
      updatedAt: rowTimestamp(row.updatedAt),
    }
  } catch (error) {
    console.warn('[studio] project read failed:', (error as Error).message)
    return null
  }
}

const projectReaders = new Map<string, () => Promise<StudioProject | null>>()

export async function getProjectBySlug(slug: string): Promise<StudioProject | null> {
  const cached = projectReaders.get(slug)
  if (cached) return cached()
  const reader = unstable_cache(readProjectBySlug.bind(null, slug), ['studio-project', slug], {
    tags: ['projects', `project-${slug}`],
    revalidate: 300,
  })
  projectReaders.set(slug, reader)
  return reader()
}

async function readSiteSettings(): Promise<StudioSiteSettings> {
  try {
    await ensureStudioTables()
    const [row] = await db.select().from(siteSetting).where(eq(siteSetting.id, 1)).limit(1)
    if (!row) {
      return {
        ...DEFAULT_SITE_SETTINGS,
        socialLinks: parseSocialLinks(DEFAULT_SITE_SETTINGS.socialLinks),
        source: 'default',
      }
    }
    return {
      contactEmail: row.contactEmail ?? DEFAULT_SITE_SETTINGS.contactEmail,
      availabilityStatus: row.availabilityStatus ?? DEFAULT_SITE_SETTINGS.availabilityStatus,
      socialLinks: parseSocialLinks(row.socialLinks),
      source: 'database',
    }
  } catch (error) {
    console.warn('[studio] site settings read failed:', (error as Error).message)
    return {
      ...DEFAULT_SITE_SETTINGS,
      socialLinks: parseSocialLinks(DEFAULT_SITE_SETTINGS.socialLinks),
      source: 'default',
    }
  }
}

export const getSiteSettings = unstable_cache(readSiteSettings, ['studio-site-settings'], {
  tags: ['site-settings'],
  revalidate: 300,
})

/* ------------------------------------------------------------------ */
/* Admin reads (uncached)                                              */
/* ------------------------------------------------------------------ */

export async function getAllPagesForAdmin(): Promise<StudioPageWithSections[]> {
  await ensureStudioTables()
  const rows = await db.select().from(sitePage).orderBy(asc(sitePage.slug))
  const results: StudioPageWithSections[] = []
  for (const row of rows) {
    const sections = await db
      .select()
      .from(sitePageSection)
      .where(eq(sitePageSection.pageId, row.id))
      .orderBy(asc(sitePageSection.sortOrder), asc(sitePageSection.id))
    results.push({
      page: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        metaDescription: row.metaDescription ?? '',
        isPublished: row.isPublished,
      },
      sections: sections.map((section) => ({
        id: section.id,
        pageId: section.pageId,
        sectionKey: section.sectionKey,
        sortOrder: section.sortOrder,
        isEnabled: section.isEnabled,
        content: parseSectionContent(section.sectionKey, section.content) as Record<string, unknown>,
      })),
      source: 'database',
    })
  }
  return results
}

export async function getAllProjectsForAdmin(): Promise<StudioProject[]> {
  await ensureStudioTables()
  const rows = await db
    .select()
    .from(studioProject)
    .orderBy(asc(studioProject.featuredOrder), asc(studioProject.title))
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category ?? undefined,
    summary: row.summary ?? undefined,
    problem: row.problem ?? undefined,
    solution: row.solution ?? undefined,
    techStack: Array.isArray(row.techStack) ? row.techStack : [],
    coverMediaUrl: row.coverMediaUrl ?? undefined,
    liveUrl: row.liveUrl ?? undefined,
    repoUrl: row.repoUrl ?? undefined,
    featuredOrder: row.featuredOrder ?? undefined,
    status: resolveProjectLifecycleStatus(row.status),
    isPublished: row.isPublished,
  }))
}

/**
 * Published studio pages for the sitemap, with their real write timestamps.
 * Read uncached: the sitemap route is itself revalidated hourly, and a page
 * created in the studio should be discoverable before that tag expires.
 */
export async function getPublishedPagesForSitemap(): Promise<StudioPage[]> {
  try {
    await ensureStudioTables()
    const rows = await db.select().from(sitePage).where(eq(sitePage.isPublished, true))
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      metaDescription: row.metaDescription ?? '',
      isPublished: row.isPublished,
      updatedAt: rowTimestamp(row.updatedAt),
    }))
  } catch (error) {
    console.warn('[studio] sitemap page read failed:', (error as Error).message)
    return []
  }
}

export async function getSiteSettingsForAdmin(): Promise<StudioSiteSettings> {
  await ensureStudioTables()
  const [row] = await db.select().from(siteSetting).where(eq(siteSetting.id, 1)).limit(1)
  if (!row) {
    return {
      ...DEFAULT_SITE_SETTINGS,
      socialLinks: parseSocialLinks(DEFAULT_SITE_SETTINGS.socialLinks),
      source: 'default',
    }
  }
  return {
    contactEmail: row.contactEmail ?? '',
    availabilityStatus: row.availabilityStatus ?? '',
    socialLinks: parseSocialLinks(row.socialLinks),
    source: 'database',
  }
}

export type { SectionKey }
