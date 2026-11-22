import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getAdminActorId } from '@/lib/admin-auth'
import { pool } from '@/lib/db'
import {
  CMS_BACKUP_MAX_BYTES,
  cmsBackupFileName,
  parseCmsBackup,
  type CmsBackupRestoreMode,
} from '@/lib/cms-backup'
import {
  applyCmsBackup,
  readCmsBackup,
  type BackupQueryClient,
} from '@/lib/cms-backup-db'
import { revalidateCmsCache } from '@/lib/cms-revalidation'

/**
 * CMS backup endpoints for the studio.
 *
 * GET  downloads one JSON snapshot of the authored content.
 * POST restores a snapshot, in one transaction, and refreshes the public caches.
 *
 * Both require the signed-in owner. The restore path never touches credentials,
 * sessions, the inbox or newsletter subscribers, so a backup file cannot be used
 * to take over the account.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { message },
    { status, headers: { 'cache-control': 'no-store' } },
  )
}

function asQueryClient(client: unknown): BackupQueryClient {
  return client as BackupQueryClient
}

export async function GET() {
  const actorId = await getAdminActorId()
  if (!actorId) return jsonError('Sign in to the studio first.', 401)

  const client = await pool.connect()
  try {
    const backup = await readCmsBackup(asQueryClient(client), 'admin-download')
    const body = `${JSON.stringify(backup, null, 2)}\n`
    return new NextResponse(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="${cmsBackupFileName()}"`,
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[CMS] Backup download failed:', error)
    return jsonError(
      error instanceof Error
        ? `Could not build the backup: ${error.message}`
        : 'Could not build the backup.',
      500,
    )
  } finally {
    client.release()
  }
}

export async function POST(request: Request) {
  const actorId = await getAdminActorId()
  if (!actorId) return jsonError('Sign in to the studio first.', 401)

  // Same-origin only: the studio sends this from its own page, so a cross-site
  // form post can never trigger a restore with the owner's cookie attached.
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

  const rawMode = (request.headers.get('x-backup-mode') ?? 'merge').trim().toLowerCase()
  const mode: CmsBackupRestoreMode = rawMode === 'replace' ? 'replace' : 'merge'

  const text = await request.text()
  if (!text.trim()) return jsonError('Choose a backup file first.', 400)
  if (text.length > CMS_BACKUP_MAX_BYTES) {
    return jsonError('That file is larger than the 25 MB restore limit.', 413)
  }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return jsonError('That file is not valid JSON.', 400)
  }

  const parsed = parseCmsBackup(raw)
  if (!parsed.ok) return jsonError(parsed.error, 400)

  const client = await pool.connect()
  try {
    await client.query('begin')
    const summary = await applyCmsBackup(asQueryClient(client), parsed.backup, { actorId, mode })
    await client.query('commit')

    revalidateCmsCache()
    revalidateTag('projects', { expire: 0 })
    revalidateTag('site-settings', { expire: 0 })
    for (const page of parsed.backup.studio.pages) {
      revalidateTag(`page-${page.slug}`, { expire: 0 })
      revalidatePath(page.slug === '/' ? '/' : page.slug)
    }
    revalidatePath('/work')
    revalidatePath('/admin')

    console.info(
      `[CMS] Restore (${mode}): ${summary.cmsContent.inserted} inserted, ` +
        `${summary.cmsContent.updated} updated, ${summary.cmsContent.removed} removed; ` +
        `${summary.pages.inserted + summary.pages.updated} pages, ${summary.projects.inserted + summary.projects.updated} case studies.`,
    )

    return NextResponse.json(
      { message: 'Backup restored.', summary },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (error) {
    await client.query('rollback').catch(() => undefined)
    console.error('[CMS] Restore failed:', error)
    return jsonError(
      error instanceof Error ? `Restore failed: ${error.message}` : 'Restore failed.',
      500,
    )
  } finally {
    client.release()
  }
}
