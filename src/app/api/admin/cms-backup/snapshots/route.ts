import { get, list } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminActorId } from '@/lib/admin-auth'
import { blobToken, cmsSnapshotAccess } from '@/lib/blob'
import {
  CMS_BACKUP_MAX_BYTES,
  CMS_BACKUP_PREFIX,
  cmsBackupFileName,
  diffCmsBackups,
  formatCmsBackupBytes,
  isCmsBackupPathname,
  parseCmsBackup,
  verifyCmsBackupIntegrity,
  type CmsBackupRestoreMode,
} from '@/lib/cms-backup'
import { restoreCmsBackup } from '@/lib/cms-backup-restore'
import { readCmsBackup, type BackupQueryClient } from '@/lib/cms-backup-db'
import { pool } from '@/lib/db'

/**
 * The scheduled snapshots, as the studio sees them.
 *
 * GET                       lists them, newest first.
 * GET  ?pathname=…          downloads one file.
 * GET  ?verify=newest       proves the newest stored snapshot still parses and
 *                           agrees with its own counts (`verify=<pathname>`
 *                           checks a specific file). Age alone only says a file
 *                           exists; this says it could actually be restored.
 * POST { pathname, mode }   restores one, through the same transactional path
 *                           the upload restore uses.
 *
 * Every call requires the signed-in owner, and only the exact file names the
 * scheduled job writes can be addressed, so this cannot read other blobs.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

interface SnapshotEntry {
  pathname: string
  size: number
  uploadedAt: string
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { 'cache-control': 'no-store' } })
}

function missingStorageMessage() {
  return (
    'Scheduled snapshots need Vercel Blob storage. Connect a Blob store to this project so' +
    ' BLOB_READ_WRITE_TOKEN is issued, then redeploy.'
  )
}

/**
 * Reads every page of the backup prefix; the list is small but never guessed.
 * Only the names the download and restore routes accept are listed, so every row
 * the studio offers can actually be opened.
 */
async function listSnapshots(token: string): Promise<SnapshotEntry[]> {
  const entries: SnapshotEntry[] = []
  let cursor: string | undefined

  do {
    const page = await list({
      prefix: `${CMS_BACKUP_PREFIX}cms-backup-`,
      token,
      limit: 200,
      cursor,
    })
    for (const blob of page.blobs) {
      if (!isCmsBackupPathname(blob.pathname)) continue
      entries.push({
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt.toISOString(),
      })
    }
    cursor = page.hasMore ? page.cursor : undefined
    if (page.hasMore && !page.cursor) break
  } while (cursor)

  return entries.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}

/** The stored text of one snapshot, or a readable reason it is not there. */
async function readSnapshot(
  pathname: string,
  token: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; message: string }> {
  try {
    const result = await get(pathname, { access: cmsSnapshotAccess(), token })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return { ok: false, status: 404, message: 'That snapshot is no longer in storage.' }
    }
    const text = await new Response(result.stream).text()
    const bytes = Buffer.byteLength(text, 'utf8')
    if (bytes > CMS_BACKUP_MAX_BYTES) {
      return {
        ok: false,
        status: 413,
        message: `That snapshot is ${formatCmsBackupBytes(bytes)}, larger than the ${formatCmsBackupBytes(
          CMS_BACKUP_MAX_BYTES,
        )} the studio restores at once.`,
      }
    }
    return { ok: true, text }
  } catch (error) {
    console.error('[CMS] Snapshot read failed:', error)
    return { ok: false, status: 404, message: 'That snapshot could not be read from storage.' }
  }
}

export async function GET(request: Request) {
  const actorId = await getAdminActorId()
  if (!actorId) return jsonError('Sign in to the studio first.', 401)

  const token = blobToken()
  if (!token) return jsonError(missingStorageMessage(), 503)

  const params = new URL(request.url).searchParams
  const pathname = params.get('pathname')
  const verify = params.get('verify')
  const diff = params.get('diff')

  // What a restore of this snapshot would change relative to the live CMS.
  // Read-only: nothing is written, and the response is a summary, not content.
  if (diff) {
    if (!isCmsBackupPathname(diff)) {
      return jsonError('That is not a scheduled CMS snapshot.', 400)
    }
    const snapshot = await readSnapshot(diff, token)
    if (!snapshot.ok) return jsonError(snapshot.message, snapshot.status)

    let raw: unknown
    try {
      raw = JSON.parse(snapshot.text)
    } catch {
      return jsonError('That snapshot is not valid JSON.', 400)
    }
    const parsed = parseCmsBackup(raw)
    if (!parsed.ok) return jsonError(parsed.error, 400)

    const client = await pool.connect()
    try {
      const current = await readCmsBackup(client as unknown as BackupQueryClient, 'snapshot-diff')
      return NextResponse.json(
        { file: diff, diff: diffCmsBackups(current, parsed.backup) },
        { headers: { 'cache-control': 'no-store' } },
      )
    } finally {
      client.release()
    }
  }

  if (verify) {
    let target = verify
    if (verify === 'newest' || verify === '1') {
      const snapshots = await listSnapshots(token).catch(() => [])
      const newest = snapshots[0]
      if (!newest) {
        return NextResponse.json(
          { ok: false, file: null, problems: ['No scheduled snapshot is stored yet.'] },
          { headers: { 'cache-control': 'no-store' } },
        )
      }
      target = newest.pathname
    }
    if (!isCmsBackupPathname(target)) {
      return jsonError('That is not a scheduled CMS snapshot.', 400)
    }

    const snapshot = await readSnapshot(target, token)
    if (!snapshot.ok) {
      return NextResponse.json(
        { ok: false, file: target, problems: [snapshot.message] },
        { status: snapshot.status, headers: { 'cache-control': 'no-store' } },
      )
    }

    let raw: unknown
    try {
      raw = JSON.parse(snapshot.text)
    } catch {
      return NextResponse.json(
        { ok: false, file: target, problems: ['The stored snapshot is not valid JSON.'] },
        { headers: { 'cache-control': 'no-store' } },
      )
    }

    const parsed = parseCmsBackup(raw)
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, file: target, problems: [parsed.error] },
        { headers: { 'cache-control': 'no-store' } },
      )
    }
    const integrity = verifyCmsBackupIntegrity(parsed.backup)
    return NextResponse.json(
      {
        ok: integrity.ok,
        file: target,
        problems: integrity.problems,
        counts: parsed.backup.counts,
        createdAt: parsed.backup.createdAt,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  }

  if (pathname) {
    if (!isCmsBackupPathname(pathname)) {
      return jsonError('That is not a scheduled CMS snapshot.', 400)
    }
    const snapshot = await readSnapshot(pathname, token)
    if (!snapshot.ok) return jsonError(snapshot.message, snapshot.status)

    // A download keeps working even when the file no longer validates — the
    // owner may want to inspect it — but the response says which it is.
    let integrityHeader = 'unknown'
    try {
      const parsed = parseCmsBackup(JSON.parse(snapshot.text))
      integrityHeader = parsed.ok
        ? verifyCmsBackupIntegrity(parsed.backup).ok
          ? 'ok'
          : 'invalid'
        : 'invalid'
    } catch {
      integrityHeader = 'invalid'
    }

    const name = pathname.slice(pathname.lastIndexOf('/') + 1) || cmsBackupFileName()
    return new NextResponse(snapshot.text, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="${name}"`,
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'x-backup-integrity': integrityHeader,
      },
    })
  }

  try {
    const snapshots = await listSnapshots(token)
    return NextResponse.json(
      { snapshots },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    console.error('[CMS] Snapshot list failed:', error)
    return jsonError('Could not list the scheduled snapshots.', 502)
  }
}

export async function POST(request: Request) {
  const actorId = await getAdminActorId()
  if (!actorId) return jsonError('Sign in to the studio first.', 401)

  // Same-origin only, exactly like the upload restore: a cross-site form post
  // must never be able to restore with the owner's cookie attached.
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
      return jsonError('Restore requests must come from the studio itself.', 403)
    }
  }

  const token = blobToken()
  if (!token) return jsonError(missingStorageMessage(), 503)

  let body: { pathname?: unknown; mode?: unknown }
  try {
    body = (await request.json()) as { pathname?: unknown; mode?: unknown }
  } catch {
    return jsonError('That request was not valid JSON.', 400)
  }

  const pathname = body.pathname
  if (!isCmsBackupPathname(pathname)) {
    return jsonError('That is not a scheduled CMS snapshot.', 400)
  }
  const mode: CmsBackupRestoreMode =
    String(body.mode ?? 'replace').toLowerCase() === 'merge' ? 'merge' : 'replace'

  const snapshot = await readSnapshot(pathname, token)
  if (!snapshot.ok) return jsonError(snapshot.message, snapshot.status)

  let raw: unknown
  try {
    raw = JSON.parse(snapshot.text)
  } catch {
    return jsonError('That snapshot is not valid JSON.', 400)
  }

  const result = await restoreCmsBackup(raw, { actorId, mode })
  if (!result.ok) return jsonError(result.message, result.status)

  return NextResponse.json(
    { message: 'Snapshot restored.', summary: result.summary, pathname },
    { headers: { 'cache-control': 'no-store' } },
  )
}
