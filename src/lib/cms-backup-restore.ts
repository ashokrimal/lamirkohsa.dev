import { revalidatePath, revalidateTag } from 'next/cache'
import { parseCmsBackup, type CmsBackupRestoreMode } from '@/lib/cms-backup'
import {
  applyCmsBackup,
  type BackupQueryClient,
  type CmsRestoreSummary,
} from '@/lib/cms-backup-db'
import { revalidateCmsCache } from '@/lib/cms-revalidation'
import { pool } from '@/lib/db'

/**
 * Applies a backup that has already arrived as parsed JSON.
 *
 * Shared by the upload/restore route and the scheduled-snapshot route so both
 * paths validate, write and revalidate identically: one transaction, rolled
 * back on any failure, and public caches refreshed only after the commit.
 */

export type CmsRestoreResult =
  | { ok: true; summary: CmsRestoreSummary }
  | { ok: false; status: number; message: string }

function asQueryClient(client: unknown): BackupQueryClient {
  return client as BackupQueryClient
}

export async function restoreCmsBackup(
  raw: unknown,
  { actorId, mode }: { actorId: string; mode: CmsBackupRestoreMode },
): Promise<CmsRestoreResult> {
  const parsed = parseCmsBackup(raw)
  if (!parsed.ok) return { ok: false, status: 400, message: parsed.error }

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
    revalidatePath('/projects')
    revalidatePath('/admin')

    console.info(
      `[CMS] Restore (${mode}): ${summary.cmsContent.inserted} inserted, ` +
        `${summary.cmsContent.updated} updated, ${summary.cmsContent.removed} removed; ` +
        `${summary.pages.inserted + summary.pages.updated} pages, ` +
        `${summary.projects.inserted + summary.projects.updated} case studies.`,
    )

    return { ok: true, summary }
  } catch (error) {
    await client.query('rollback').catch(() => undefined)
    console.error('[CMS] Restore failed:', error)
    return {
      ok: false,
      status: 500,
      message: error instanceof Error ? `Restore failed: ${error.message}` : 'Restore failed.',
    }
  } finally {
    client.release()
  }
}
