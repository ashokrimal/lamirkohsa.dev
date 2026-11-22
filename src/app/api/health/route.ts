import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { blobToken } from '@/lib/blob'
import {
  CMS_BACKUP_PREFIX,
  cmsBackupAge,
  isCmsBackupPathname,
  type CmsBackupAgeState,
} from '@/lib/cms-backup'
import { hasDatabaseConfig, pool } from '@/lib/db'
import { isAdminAuthConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Deployment health check.
 *
 * Reports whether the pieces the site needs at runtime are present and working.
 * Only names and booleans are returned — never values, URLs or error internals.
 *
 * It also watches the scheduled backup: a cron can stop running without a
 * single request failing, so the newest snapshot's age is reported as
 * `scheduledBackups`. When it is missing or older than two days it is named in
 * `warnings`, which is the machine-readable signal a monitor should watch.
 * `ok` and the status code stay about serving requests — a stale backup is a
 * warning, not a reason to call the site down.
 */

type ScheduledBackupsStatus = CmsBackupAgeState | 'not-configured' | 'unavailable'

interface ScheduledBackups {
  status: ScheduledBackupsStatus
  /** ISO timestamp of the newest accepted snapshot, or null when there is none. */
  newest: string | null
  /** Whole hours since that snapshot, null when there is none. */
  ageHours: number | null
}

async function checkScheduledBackups(): Promise<ScheduledBackups> {
  const token = blobToken()
  if (!token) return { status: 'not-configured', newest: null, ageHours: null }

  try {
    // The job keeps 14 snapshots; one page of up to 1000 covers all of them.
    const page = await list({ prefix: CMS_BACKUP_PREFIX, token, limit: 1000 })
    const age = cmsBackupAge(
      page.blobs
        .filter((blob) => isCmsBackupPathname(blob.pathname))
        .map((blob) => blob.uploadedAt),
    )
    return {
      status: age.state,
      newest: age.newest,
      ageHours: age.ageMs === null ? null : Math.round(age.ageMs / (60 * 60 * 1000)),
    }
  } catch (error) {
    console.error('[health] Scheduled backup check failed:', (error as Error).message)
    return { status: 'unavailable', newest: null, ageHours: null }
  }
}

export async function GET() {
  const env = {
    database: hasDatabaseConfig(),
    betterAuthSecret: Boolean(process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_API_KEY),
    betterAuthUrl: Boolean(
      process.env.BETTER_AUTH_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL,
    ),
    adminSignIn: await isAdminAuthConfigured(),
    email: Boolean(process.env.RESEND_API_KEY),
    contactRecipient: Boolean(process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL),
    blobStorage: Boolean(blobToken()),
  }

  let database: 'connected' | 'unavailable' | 'not-configured' = 'not-configured'
  if (env.database) {
    try {
      await pool.query('select 1')
      database = 'connected'
    } catch (error) {
      console.error('[health] Database check failed:', (error as Error).message)
      database = 'unavailable'
    }
  }

  const scheduledBackups = await checkScheduledBackups()

  const missing = Object.entries(env)
    .filter(([, present]) => !present)
    .map(([name]) => name)

  const warnings: string[] = []
  if (scheduledBackups.status === 'stale') warnings.push('scheduledBackupsStale')
  if (scheduledBackups.status === 'missing') warnings.push('scheduledBackupsMissing')
  if (scheduledBackups.status === 'unavailable') warnings.push('scheduledBackupsUnavailable')

  const ok = database === 'connected' && env.betterAuthSecret
  return NextResponse.json(
    { ok, database, env, missing, warnings, scheduledBackups },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
