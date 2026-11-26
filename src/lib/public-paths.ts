import { pool } from '@/lib/db'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'

/**
 * Which paths the site actually publishes.
 *
 * The proxy answers before a route renders, which is the only place a real 404
 * can still be sent: once a dynamic page awaits its data the response has
 * started streaming with a 200, so `notFound()` can only swap the body. This
 * module therefore knows two things — the routes that are compiled into the app
 * (`STATIC_PATHS`) and the records the database publishes right now.
 *
 * `tests/public-paths.test.ts` fails when a top-level route directory is added
 * without appearing in `STATIC_PATHS`, so a new page cannot be mistaken for a
 * missing one.
 */

/** Top-level paths served by the app's own route files, never by a CMS record. */
export const STATIC_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/about',
  '/about/gallery',
  '/about/github',
  '/admin',
  '/api',
  '/blogs',
  '/certificates',
  '/classic',
  '/contact',
  '/education',
  '/experience',
  '/feed.xml',
  '/forgot-password',
  '/media',
  '/media/anime',
  '/media/manga',
  '/media/movies',
  '/media/music',
  '/not-found-view',
  '/offline',
  '/og',
  '/projects',
  '/reset-password',
  '/resume',
  '/robots.txt',
  '/search',
  '/sign-in',
  '/skills',
  '/sitemap.xml',
  '/manifest.webmanifest',
])

const CACHE_MS = 15_000
let cache: { at: number; paths: Set<string> } | null = null

/** `/about/` and `about` both become `/about`; an empty slug becomes `/`. */
function normalisePath(slug: string): string {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}` : '/'
}

/**
 * Every published page path, or null when the database cannot answer.
 *
 * Null means "unknown", and the proxy then lets the request through rather than
 * turning a database hiccup into a 404. Reads are cached briefly so a burst of
 * requests costs one query, and a publish is visible within `CACHE_MS`.
 */
export async function publishedPaths(): Promise<Set<string> | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.paths

  try {
    const [blogs, legacyProjects, studioProjects, pages] = await Promise.all([
      pool.query<{ slug: string }>(
        `SELECT "slug" FROM "cmsContent"
          WHERE lower("collection") = lower($1) AND lower(trim("status")) = 'published'`,
        [CMS_COLLECTIONS.blogs],
      ),
      pool.query<{ slug: string }>(
        `SELECT "slug" FROM "cmsContent"
          WHERE lower("collection") = lower($1) AND lower(trim("status")) = 'published'`,
        [CMS_COLLECTIONS.projects],
      ),
      pool.query<{ slug: string }>(`SELECT "slug" FROM "projects" WHERE "is_published" = true`),
      pool.query<{ slug: string }>(`SELECT "slug" FROM "pages" WHERE "is_published" = true`),
    ])

    const paths = new Set<string>()
    for (const row of blogs.rows) paths.add(`/blogs/${row.slug}`)
    for (const row of [...legacyProjects.rows, ...studioProjects.rows]) {
      paths.add(`/projects/${row.slug}`)
    }
    for (const row of pages.rows) {
      const path = normalisePath(row.slug)
      if (path !== '/') paths.add(path)
    }

    cache = { at: Date.now(), paths }
    return paths
  } catch (error) {
    console.warn('[public-paths] Could not read the published paths:', (error as Error).message)
    return null
  }
}
