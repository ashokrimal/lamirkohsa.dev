import { pool } from '@/lib/db'

/**
 * Where a renamed page used to live.
 *
 * Renaming a slug in the studio used to break every link and search result that
 * pointed at the old URL. A change is now recorded once in `slugRedirect`, and
 * the detail routes send the old path to the new one with a permanent redirect.
 * Old links therefore keep working, and the new URL is the only one indexed.
 *
 * Paths are stored with their leading slash (`/blogs/old-name`), so a redirect is
 * exactly the request path and never depends on how a route is built.
 */

const MAX_HOPS = 4
const MAX_SLUG_LENGTH = 120

let tableReady = false

async function ensureSlugRedirectTable(): Promise<void> {
  if (tableReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "slugRedirect" (
      "from" text PRIMARY KEY,
      "to" text NOT NULL,
      "collection" text NOT NULL DEFAULT '',
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )
  `)
  tableReady = true
}

/** The slug half of a path, safe to put back into a URL. */
export function isSafeSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= MAX_SLUG_LENGTH &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
}

/** `/Blogs/Old_Name/` → `old-name`; empty when the value has no usable slug. */
export function normalizeSlugInput(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .pop()!
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
}

export function blogPath(slug: string): string {
  return `/blogs/${slug}`
}

export function projectPath(slug: string): string {
  return `/projects/${slug}`
}

/**
 * Follows a stored redirect chain to its final destination. A rename of a
 * rename (A → B → C) still lands on C; a loop stops instead of spinning.
 */
export async function followSlugRedirect(
  path: string,
  lookup: (from: string) => Promise<string | null>,
): Promise<string | null> {
  let current = path
  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const next = await lookup(current)
    if (!next) return hop === 0 ? null : current
    if (next === path || next === current) return hop === 0 ? null : current
    current = next
  }
  return current === path ? null : current
}

export async function recordSlugRedirect({
  from,
  to,
  collection = '',
}: {
  from: string
  to: string
  collection?: string
}): Promise<boolean> {
  if (!from || !to || from === to || !from.startsWith('/') || !to.startsWith('/')) return false
  try {
    await ensureSlugRedirectTable()
    await pool.query(
      `INSERT INTO "slugRedirect" ("from", "to", "collection")
       VALUES ($1, $2, $3)
       ON CONFLICT ("from") DO UPDATE SET "to" = excluded."to", "collection" = excluded."collection"`,
      [from, to, collection],
    )
    // A path that is now a live page must not also be a redirect source.
    await pool.query(`DELETE FROM "slugRedirect" WHERE "from" = $1`, [to])
    return true
  } catch (error) {
    console.warn('[slug-history] Could not record the rename:', (error as Error).message)
    return false
  }
}

async function lookupRedirect(from: string): Promise<string | null> {
  try {
    await ensureSlugRedirectTable()
    const result = await pool.query<{ to: string }>(
      `SELECT "to" FROM "slugRedirect" WHERE "from" = $1 LIMIT 1`,
      [from],
    )
    return result.rows[0]?.to ?? null
  } catch (error) {
    console.warn('[slug-history] Could not read the rename table:', (error as Error).message)
    return null
  }
}

/** The live path for a request path, or null when nothing was renamed. */
export async function resolveSlugRedirect(path: string, lookup = lookupRedirect) {
  return followSlugRedirect(path, lookup)
}
