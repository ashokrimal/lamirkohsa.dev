import { list } from '@vercel/blob'
import { blobToken } from '@/lib/blob'
import {
  CMS_BACKUP_PREFIX,
  cmsBackupAge,
  isCmsBackupPathname,
  type CmsBackupAgeState,
} from '@/lib/cms-backup'
import { hasDatabaseConfig, pool } from '@/lib/db'
import { isAdminAuthConfigured } from '@/lib/admin-auth'

/**
 * The deployment's own health, computed once and used by both `/api/health` and
 * the studio's status panel. Only names and booleans leave this module — never a
 * secret, a URL or an error internals.
 */

export type ScheduledBackupsStatus = CmsBackupAgeState | 'not-configured' | 'unavailable'

export interface ScheduledBackups {
  status: ScheduledBackupsStatus
  newest: string | null
  ageHours: number | null
}

export interface HealthReport {
  ok: boolean
  database: 'connected' | 'unavailable' | 'not-configured'
  env: Record<string, boolean>
  missing: string[]
  warnings: string[]
  scheduledBackups: ScheduledBackups
}

export async function checkScheduledBackups(): Promise<ScheduledBackups> {
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

export async function collectHealth(): Promise<HealthReport> {
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

  let database: HealthReport['database'] = 'not-configured'
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
  return { ok, database, env, missing, warnings, scheduledBackups }
}
