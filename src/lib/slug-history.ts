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
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "hits" integer NOT NULL DEFAULT 0,
      "lastHitAt" timestamptz
    )
  `)
  // Older deployments created the table without the counters; adding them is
  // idempotent, so the first request after an upgrade fills them in.
  await pool.query(`ALTER TABLE "slugRedirect" ADD COLUMN IF NOT EXISTS "hits" integer NOT NULL DEFAULT 0`)
  await pool.query(`ALTER TABLE "slugRedirect" ADD COLUMN IF NOT EXISTS "lastHitAt" timestamptz`)
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

/**
 * The whole rename table, cached for a few seconds.
 *
 * The proxy resolves a renamed path before the page renders, because a redirect
 * thrown during the streamed render is downgraded to a 200 with a meta refresh
 * instead of a real 3xx. Querying per request is wasteful for a table this
 * small, so it is read once and reused briefly; a rename made in the studio is
 * live within `REDIRECT_CACHE_MS`.
 */
const REDIRECT_CACHE_MS = 15_000
let redirectCache: { at: number; rows: Map<string, string> } | null = null

async function cachedSlugRedirects(): Promise<Map<string, string>> {
  if (redirectCache && Date.now() - redirectCache.at < REDIRECT_CACHE_MS) {
    return redirectCache.rows
  }
  try {
    await ensureSlugRedirectTable()
    const result = await pool.query<{ from: string; to: string }>(
      `SELECT "from", "to" FROM "slugRedirect" LIMIT 1000`,
    )
    redirectCache = {
      at: Date.now(),
      rows: new Map(result.rows.map((row) => [row.from, row.to])),
    }
    return redirectCache.rows
  } catch (error) {
    // Not cached: the next request retries, and the page-level lookup still runs.
    console.warn('[slug-history] Could not cache the rename table:', (error as Error).message)
    return new Map()
  }
}

/** The live path for a request path, resolved from the cached table. */
export async function resolveRenamedPath(path: string): Promise<string | null> {
  const rows = await cachedSlugRedirects()
  return followSlugRedirect(path, async (from) => rows.get(from) ?? null)
}

export interface SlugRedirectRow {
  from: string
  to: string
  collection: string
  createdAt: string
  hits: number
  lastHitAt: string | null
}

/** Every recorded rename, most recently hit first. */
export async function listSlugRedirects(): Promise<SlugRedirectRow[]> {
  try {
    await ensureSlugRedirectTable()
    const result = await pool.query<{
      from: string
      to: string
      collection: string
      createdAt: Date | string
      hits: number | string
      lastHitAt: Date | string | null
    }>(
      `SELECT "from", "to", "collection", "createdAt", "hits", "lastHitAt"
         FROM "slugRedirect"
        ORDER BY COALESCE("lastHitAt", "createdAt") DESC
        LIMIT 500`,
    )
    return result.rows.map((row) => ({
      from: row.from,
      to: row.to,
      collection: row.collection,
      createdAt: new Date(row.createdAt).toISOString(),
      hits: Number(row.hits) || 0,
      lastHitAt: row.lastHitAt ? new Date(row.lastHitAt).toISOString() : null,
    }))
  } catch (error) {
    console.warn('[slug-history] Could not list the rename table:', (error as Error).message)
    return []
  }
}

/**
 * Counts one served redirect. Best-effort: a counter failure must never break
 * the redirect a visitor is waiting on.
 */
export async function bumpSlugRedirectHit(from: string): Promise<void> {
  try {
    await ensureSlugRedirectTable()
    await pool.query(
      `UPDATE "slugRedirect" SET "hits" = "hits" + 1, "lastHitAt" = now() WHERE "from" = $1`,
      [from],
    )
  } catch (error) {
    console.warn('[slug-history] Could not count a hit:', (error as Error).message)
  }
}

export type SlugRedirectIssueKind = 'loop' | 'chain' | 'missing-target'

export interface SlugRedirectIssue {
  kind: SlugRedirectIssueKind
  message: string
}

/**
 * Read-only diagnosis of the redirect table against the paths the site serves.
 * It catches the three ways a rename stops helping: a loop, a destination that is
 * itself a redirect, and a destination no page renders any more.
 */
export function analyzeSlugRedirects(
  rows: SlugRedirectRow[],
  knownPaths: string[] | Set<string>,
): Map<string, SlugRedirectIssue[]> {
  const byFrom = new Map(rows.map((row) => [row.from, row]))
  const known = knownPaths instanceof Set ? knownPaths : new Set(knownPaths)
  const issues = new Map<string, SlugRedirectIssue[]>()

  const add = (from: string, issue: SlugRedirectIssue) => {
    const list = issues.get(from) ?? []
    list.push(issue)
    issues.set(from, list)
  }

  for (const row of rows) {
    const visited = new Set<string>([row.from])
    let current = row.to
    let hop = 0

    while (byFrom.has(current) && hop < 5) {
      if (visited.has(current)) {
        add(row.from, { kind: 'loop', message: `Loops back to ${current}.` })
        break
      }
      visited.add(current)
      current = byFrom.get(current)!.to
      hop += 1
    }

    if (issues.get(row.from)?.some((issue) => issue.kind === 'loop')) continue

    if (byFrom.has(row.to)) {
      add(row.from, {
        kind: 'chain',
        message: `Points at another redirect (${row.to}); update it to the final URL.`,
      })
    }

    if (known.size > 0 && !known.has(row.to) && !byFrom.has(row.to)) {
      add(row.from, {
        kind: 'missing-target',
        message: `Destination ${row.to} is not a published page.`,
      })
    }
  }

  return issues
}
