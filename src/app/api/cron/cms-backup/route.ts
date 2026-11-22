import { timingSafeEqual } from 'node:crypto'
import { del, list, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminActorId } from '@/lib/admin-auth'
import { blobToken, cmsSnapshotAccess } from '@/lib/blob'
import {
  CMS_BACKUP_KEEP,
  CMS_BACKUP_MAX_BYTES,
  CMS_BACKUP_PLATFORM_LIMIT_BYTES,
  CMS_BACKUP_PREFIX,
  cmsBackupFileName,
  formatCmsBackupBytes,
} from '@/lib/cms-backup'
import { readCmsBackup, type BackupQueryClient } from '@/lib/cms-backup-db'
import { pool } from '@/lib/db'

/**
 * The scheduled CMS backup.
 *
 * Vercel Cron calls this once a day and Vercel sends `Authorization: Bearer
 * $CRON_SECRET` on that call. The snapshot is the same content export the studio
 * downloads — never credentials, sessions, the inbox or subscribers — and it is
 * stored in Vercel Blob so a copy exists even when nobody opens the studio.
 *
 * The owner can also call it while signed in, which is how to test the job
 * without waiting for the schedule. Every run prunes the store down to the
 * newest `CMS_BACKUP_KEEP` snapshots.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const BACKUP_PREFIX = CMS_BACKUP_PREFIX

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { 'cache-control': 'no-store' } })
}

function hasCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

async function pruneSnapshots(token: string) {
  const listing = await list({ prefix: `${BACKUP_PREFIX}cms-backup-`, token, limit: 1000 })
  const newestFirst = [...listing.blobs].sort(
    (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
  )
  const stale = newestFirst.slice(CMS_BACKUP_KEEP)
  if (stale.length) {
    await del(
      stale.map((blob) => blob.url),
      { token },
    )
  }
  return {
    kept: newestFirst.length - stale.length,
    removed: stale.length,
    // Only reachable with thousands of snapshots; reported rather than hidden.
    truncated: listing.hasMore,
  }
}

export async function GET(request: Request) {
  const ownerId = await getAdminActorId()
  const scheduled = hasCronSecret(request)

  if (!ownerId && !scheduled) {
    if (!process.env.CRON_SECRET) {
      return jsonError(
        'Scheduled backups are not configured. Add CRON_SECRET to the Vercel project' +
          ' (Settings → Environment Variables) and redeploy; Vercel then sends it on every' +
          ' cron call. Nothing was saved.',
        503,
      )
    }
    return jsonError('That cron secret did not match. Nothing was saved.', 401)
  }

  const token = blobToken()
  if (!token) {
    return jsonError(
      'Scheduled backups need Vercel Blob storage. Connect a Blob store to this project so' +
        ' BLOB_READ_WRITE_TOKEN is issued, then redeploy. Nothing was saved.',
      503,
    )
  }

  const client = await pool.connect()
  try {
    const backup = await readCmsBackup(
      client as unknown as BackupQueryClient,
      scheduled ? 'vercel-cron' : 'studio-manual',
    )
    const body = `${JSON.stringify(backup)}\n`
    const bytes = Buffer.byteLength(body, 'utf8')
    if (bytes > CMS_BACKUP_MAX_BYTES) {
      return jsonError(
        `This snapshot is ${formatCmsBackupBytes(bytes)}, but the studio's backup budget is ` +
          `${formatCmsBackupBytes(CMS_BACKUP_MAX_BYTES)} (Vercel caps a function response at ` +
          `${formatCmsBackupBytes(CMS_BACKUP_PLATFORM_LIMIT_BYTES)}). Nothing was saved — trim the ` +
          'largest records so scheduled backups fit again.',
        413,
      )
    }

    const access = cmsSnapshotAccess()
    const pathname = `${BACKUP_PREFIX}${cmsBackupFileName()}`
    const blob = await put(pathname, body, {
      access,
      // Public blob URLs are readable by anyone who has them, so a snapshot must
      // not sit at a guessable name; private stores need no such guard.
      addRandomSuffix: access === 'public',
      allowOverwrite: access === 'private',
      contentType: 'application/json',
      token,
    })
    const pruned = await pruneSnapshots(token)

    console.info(
      `[CMS] Scheduled backup ${blob.pathname}: ${formatCmsBackupBytes(bytes)}, ` +
        `${backup.counts.total} records, ${pruned.kept} kept, ${pruned.removed} removed.`,
    )

    return NextResponse.json(
      {
        ok: true,
        file: blob.pathname,
        access,
        bytes,
        counts: backup.counts,
        kept: pruned.kept,
        removed: pruned.removed,
        truncated: pruned.truncated,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    console.error('[CMS] Scheduled backup failed:', error)
    return jsonError(
      error instanceof Error
        ? `Scheduled backup failed: ${error.message}`
        : 'Scheduled backup failed.',
      500,
    )
  } finally {
    client.release()
  }
}
