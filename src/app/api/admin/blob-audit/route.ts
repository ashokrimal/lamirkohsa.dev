import { del, list } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminActorId } from '@/lib/admin-auth'
import { blobToken } from '@/lib/blob'
import {
  buildReferenceCorpus,
  findOrphanedBlobs,
  selectDeletableBlobs,
  type StoredBlob,
} from '@/lib/blob-audit'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Uploaded files that the content no longer mentions.
 *
 * GET reports them; POST { confirm: 'DELETE', pathnames } deletes the ones this
 * server has just re-confirmed are orphaned. Both require the owner, and the
 * delete path is same-origin only, because a cross-site form post must never be
 * able to empty the media store with the owner's cookie attached.
 *
 * Files uploaded in the last day are skipped: an image uploaded from the studio
 * exists in the store for a moment before the record that uses it is saved, and
 * deleting it in that window would break an edit in progress.
 */

const GRACE_MS = 24 * 60 * 60 * 1000
const MAX_DELETIONS = 100

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { 'cache-control': 'no-store' } })
}

async function readContentValues(): Promise<unknown[]> {
  const values: unknown[] = []

  const cms = await pool.query<{ payload: unknown }>(`select "payload" from "cmsContent"`).catch(() => null)
  if (cms) values.push(...cms.rows.map((row) => row.payload))

  const sections = await pool
    .query<{ content_json: unknown }>(`select "content_json" from "page_sections"`)
    .catch(() => null)
  if (sections) values.push(...sections.rows.map((row) => row.content_json))

  const projects = await pool
    .query(`select "cover_media_url","live_url","repo_url" from "projects"`)
    .catch(() => null)
  if (projects) values.push(...projects.rows)

  const settings = await pool
    .query<{ social_links: unknown }>(`select "social_links" from "site_settings" where "id" = 1`)
    .catch(() => null)
  if (settings) values.push(...settings.rows.map((row) => row.social_links))

  const pages = await pool.query(`select "title","meta_description" from "pages"`).catch(() => null)
  if (pages) values.push(...pages.rows)

  return values
}

async function listSiteBlobs(token: string): Promise<StoredBlob[]> {
  const blobs: StoredBlob[] = []
  let cursor: string | undefined

  do {
    const page = await list({ prefix: 'site/', token, limit: 1000, cursor })
    for (const blob of page.blobs) {
      blobs.push({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt.toISOString(),
      })
    }
    cursor = page.hasMore ? page.cursor : undefined
    if (page.hasMore && !page.cursor) break
  } while (cursor)

  return blobs
}

async function auditSiteBlobs() {
  const token = blobToken()
  if (!token) return { ok: false as const, message: 'Blob storage is not configured for this deployment.' }

  const [blobs, values] = await Promise.all([listSiteBlobs(token), readContentValues()])
  const cutoff = Date.now() - GRACE_MS
  const settled = blobs.filter((blob) => Date.parse(blob.uploadedAt) <= cutoff)
  const tooRecent = blobs.length - settled.length

  const audit = findOrphanedBlobs(settled, buildReferenceCorpus(values))
  return { ok: true as const, audit, tooRecent, token }
}

export async function GET() {
  const actorId = await getAdminActorId()
  if (!actorId) return jsonError('Sign in to the studio first.', 401)

  try {
    const result = await auditSiteBlobs()
    if (!result.ok) return jsonError(result.message, 503)
    return NextResponse.json(
      {
        orphaned: result.audit.orphaned,
        totals: {
          files: result.audit.referenced.length + result.audit.orphaned.length,
          referenced: result.audit.referenced.length,
          orphaned: result.audit.orphaned.length,
          totalBytes: result.audit.totalBytes,
          orphanedBytes: result.audit.orphanedBytes,
          skippedRecent: result.tooRecent,
        },
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    console.error('[blob-audit] Listing failed:', error)
    return jsonError('Could not read the upload store.', 502)
  }
}

export async function POST(request: Request) {
  const actorId = await getAdminActorId()
  if (!actorId) return jsonError('Sign in to the studio first.', 401)

  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin) {
    let originHost: string | null = null
    try {
      originHost = new URL(origin).host
    } catch {
      originHost = null
    }
    if (!originHost || !host || originHost !== host) {
      return jsonError('Cleanup must be started from the studio itself.', 403)
    }
  }

  let body: { confirm?: unknown; pathnames?: unknown }
  try {
    body = (await request.json()) as { confirm?: unknown; pathnames?: unknown }
  } catch {
    return jsonError('That request was not valid JSON.', 400)
  }

  if (body.confirm !== 'DELETE') {
    return jsonError('Send confirm: "DELETE" to remove files.', 400)
  }
  if (!Array.isArray(body.pathnames) || body.pathnames.length === 0) {
    return jsonError('Name the files to remove.', 400)
  }

  try {
    const result = await auditSiteBlobs()
    if (!result.ok) return jsonError(result.message, 503)

    // Delete only what this run still considers orphaned, whatever the request
    // said. A file that became referenced in the meantime is kept.
    const deletable = selectDeletableBlobs(
      body.pathnames.filter((value): value is string => typeof value === 'string'),
      result.audit.orphaned,
      MAX_DELETIONS,
    )
    if (!deletable.length) {
      return NextResponse.json(
        { deleted: 0, message: 'Nothing to remove: those files are in use.' },
        { headers: { 'cache-control': 'no-store' } },
      )
    }

    await del(
      deletable.map((blob) => blob.url),
      { token: result.token },
    )

    console.info(`[blob-audit] Removed ${deletable.length} orphaned file(s).`)
    return NextResponse.json(
      {
        deleted: deletable.length,
        pathnames: deletable.map((blob) => blob.pathname),
        message: `Removed ${deletable.length} unused file${deletable.length === 1 ? '' : 's'}.`,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    console.error('[blob-audit] Cleanup failed:', error)
    return jsonError('The cleanup could not be completed.', 502)
  }
}
