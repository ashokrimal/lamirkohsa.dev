import { pool } from '@/lib/db'

/**
 * A record of who did what with the owner account.
 *
 * Sign-ins, failed sign-ins, sign-outs and password changes are written here so
 * the studio can answer "was I the one who signed in last night?" without
 * reading server logs that may have aged out. Content changes are already
 * timestamped on their rows; this log is about access.
 *
 * Writing is best-effort and never throws: an audit failure must not break the
 * sign-in it is recording. The inbox, sessions and passwords are never copied in.
 */

export type AdminAuditAction =
  | 'sign-in'
  | 'sign-in-failed'
  | 'second-factor-failed'
  | 'sign-out'
  | 'password-change'
  | 'passkey-sign-in'
  | 'passkey-added'
  | 'passkey-removed'

export type AdminAuditEvent = {
  id: number
  action: string
  detail: string
  createdAt: string
}

const MAX_EVENTS = 200

let tableReady = false

async function ensureAuditTable(): Promise<void> {
  if (tableReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "adminAuditLog" (
      "id" bigserial PRIMARY KEY,
      "action" text NOT NULL,
      "detail" text NOT NULL DEFAULT '',
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )
  `)
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "adminAuditLog_createdAt_idx" ON "adminAuditLog" ("createdAt")`,
  )
  tableReady = true
}

/** Coarse, non-identifying caller context for one audit row. */
export function describeCaller(headers: Headers | null): string {
  if (!headers) return ''
  const userAgent = (headers.get('user-agent') ?? '').slice(0, 120)
  const browser = /(Chrome|Firefox|Safari|Edge|curl|node)/i.exec(userAgent)?.[1] ?? 'unknown client'
  return browser
}

export async function recordAdminEvent({
  action,
  detail = '',
  caller = '',
}: {
  action: AdminAuditAction
  detail?: string
  caller?: string
}): Promise<void> {
  try {
    await ensureAuditTable()
    await pool.query(
      `INSERT INTO "adminAuditLog" ("action", "detail") VALUES ($1, $2)`,
      [action, [detail, caller].filter(Boolean).join(' · ').slice(0, 300)],
    )
  } catch (error) {
    console.warn('[audit] Could not record the event:', (error as Error).message)
  }
}

export async function listAdminEvents(limit = 40): Promise<AdminAuditEvent[]> {
  const size = Math.max(1, Math.min(limit, MAX_EVENTS))
  try {
    await ensureAuditTable()
    const result = await pool.query<{
      id: string | number
      action: string
      detail: string
      createdAt: Date | string
    }>(
      `SELECT "id", "action", "detail", "createdAt"
         FROM "adminAuditLog"
        ORDER BY "createdAt" DESC, "id" DESC
        LIMIT $1`,
      [size],
    )
    return result.rows.map((row) => ({
      id: Number(row.id),
      action: row.action,
      detail: row.detail,
      createdAt: new Date(row.createdAt).toISOString(),
    }))
  } catch (error) {
    console.warn('[audit] Could not read the log:', (error as Error).message)
    return []
  }
}
