import { createHash } from 'node:crypto'
import { hasDatabaseConfig, pool } from '@/lib/db'

/**
 * A rate limit that survives the instance.
 *
 * The in-memory sliding window in `rate-limit.ts` bounds bursts per serverless
 * instance. On a dozen instances that is a dozen windows, and a cold start
 * forgets the previous one, so an abusive caller can multiply the allowance.
 * This limiter keeps its hits in Postgres, where every instance sees the same
 * count and the window outlives a deploy.
 *
 * Identifiers are hashed before they are stored: the table never holds an IP
 * address, only a digest that can be compared and expired.
 *
 * When the database cannot be read the limit fails open. Blocking a real visitor
 * because the throttle store is down would be worse than carrying one extra
 * request; the in-memory limiter still applies in that case.
 */

export type DurableLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
  /** False when the count could not be kept (no database, or a database error). */
  durable: boolean
}

let tableReady = false

async function ensureRateLimitTable(): Promise<void> {
  if (tableReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "rateLimitHit" (
      "id" bigserial PRIMARY KEY,
      "key" text NOT NULL,
      "at" timestamptz NOT NULL DEFAULT now()
    )
  `)
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "rateLimitHit_key_at_idx" ON "rateLimitHit" ("key", "at")`,
  )
  tableReady = true
}

/** A stable, non-reversible key for one caller on one endpoint. */
export function rateLimitKey(scope: string, identifier: string): string {
  const digest = createHash('sha256').update(identifier).digest('hex').slice(0, 32)
  return `${scope}:${digest}`
}

/** Seconds until the oldest hit in the window falls out of it. */
export function retryAfterSeconds(oldestMs: number, windowMs: number, nowMs = Date.now()): number {
  if (!Number.isFinite(oldestMs)) return Math.ceil(windowMs / 1000)
  return Math.max(1, Math.ceil((oldestMs + windowMs - nowMs) / 1000))
}

export async function consumeDurableLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: {
  scope: string
  identifier: string
  limit: number
  windowMs: number
}): Promise<DurableLimitResult> {
  if (!identifier || !hasDatabaseConfig()) {
    return { allowed: true, retryAfterSeconds: 0, durable: false }
  }

  const key = rateLimitKey(scope, identifier)
  const seconds = Math.max(1, Math.ceil(windowMs / 1000))

  try {
    await ensureRateLimitTable()

    // One statement decides and records: the row is inserted only while the
    // window still has room, so a burst cannot pass on a stale count.
    const inserted = await pool.query(
      `INSERT INTO "rateLimitHit" ("key", "at")
       SELECT $1, now()
       WHERE (
         SELECT count(*) FROM "rateLimitHit"
          WHERE "key" = $1 AND "at" > now() - make_interval(secs => $2)
       ) < $3
       RETURNING "at"`,
      [key, seconds, limit],
    )

    if ((inserted.rowCount ?? 0) > 0) {
      return { allowed: true, retryAfterSeconds: 0, durable: true }
    }

    const oldest = await pool.query<{ oldest: Date | string | null }>(
      `SELECT min("at") AS "oldest" FROM "rateLimitHit"
        WHERE "key" = $1 AND "at" > now() - make_interval(secs => $2)`,
      [key, seconds],
    )
    const oldestValue = oldest.rows[0]?.oldest
    const oldestMs = oldestValue ? new Date(oldestValue).getTime() : NaN
    return {
      allowed: false,
      retryAfterSeconds: retryAfterSeconds(oldestMs, windowMs),
      durable: true,
    }
  } catch (error) {
    console.warn('[rate-limit] Durable limit unavailable:', (error as Error).message)
    return { allowed: true, retryAfterSeconds: 0, durable: false }
  }
}

/** Drops hits older than a day so the table cannot grow without bound. */
export async function pruneRateLimitHits(): Promise<void> {
  try {
    await ensureRateLimitTable()
    await pool.query(`DELETE FROM "rateLimitHit" WHERE "at" < now() - interval '1 day'`)
  } catch (error) {
    console.warn('[rate-limit] Could not prune old hits:', (error as Error).message)
  }
}
