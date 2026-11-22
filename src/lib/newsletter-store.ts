import { randomBytes } from 'node:crypto'
import { pool } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

/**
 * Newsletter subscribers live in Postgres, not in a JSON file: the site runs on
 * serverless functions, where a file written during one request is gone with the
 * instance. The table is created on first use because the project has no
 * committed migration runner (the same approach as `adminCredential`).
 */

export type NewsletterSubscriber = {
  email: string
  token: string
}

let tableReady = false

export async function ensureNewsletterTable(): Promise<void> {
  if (tableReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "newsletterSubscriber" (
      "id" serial PRIMARY KEY,
      "email" text NOT NULL UNIQUE,
      "token" text NOT NULL UNIQUE,
      "source" text NOT NULL DEFAULT 'journal',
      "status" text NOT NULL DEFAULT 'subscribed',
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "unsubscribedAt" timestamptz
    )
  `)
  tableReady = true
}

function newToken() {
  return randomBytes(24).toString('base64url')
}

export function unsubscribeUrlFor(token: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

export type SubscribeResult =
  | { ok: true; alreadySubscribed: false; token: string }
  | { ok: true; alreadySubscribed: true; token: string }
  | { ok: false; error: string }

/**
 * Inserts the subscriber, or revives a previously unsubscribed address. The
 * existing token is reused so old unsubscribe links keep working.
 */
export async function subscribeToNewsletter(
  email: string,
  source = 'journal',
): Promise<SubscribeResult> {
  try {
    await ensureNewsletterTable()
    const token = newToken()
    const inserted = await pool.query<{ token: string }>(
      `INSERT INTO "newsletterSubscriber" ("email", "token", "source", "status")
       VALUES ($1, $2, $3, 'subscribed')
       ON CONFLICT ("email") DO NOTHING
       RETURNING "token"`,
      [email, token, source],
    )

    if (inserted.rows[0]) {
      return { ok: true, alreadySubscribed: false, token: inserted.rows[0].token }
    }

    // Already known: keep the row (and its token), report whether it was active.
    const existing = await pool.query<{ token: string; status: string }>(
      `SELECT "token", "status" FROM "newsletterSubscriber" WHERE "email" = $1`,
      [email],
    )
    const row = existing.rows[0]
    if (!row) return { ok: false, error: 'subscriber could not be stored' }

    if (row.status !== 'subscribed') {
      await pool.query(
        `UPDATE "newsletterSubscriber"
         SET "status" = 'subscribed', "unsubscribedAt" = NULL
         WHERE "email" = $1`,
        [email],
      )
      return { ok: true, alreadySubscribed: false, token: row.token }
    }

    return { ok: true, alreadySubscribed: true, token: row.token }
  } catch (error) {
    console.warn('[newsletter] Could not store subscriber:', (error as Error).message)
    return { ok: false, error: (error as Error).message }
  }
}

export async function listActiveSubscribers(limit = 500): Promise<NewsletterSubscriber[]> {
  try {
    await ensureNewsletterTable()
    const result = await pool.query<NewsletterSubscriber>(
      `SELECT "email", "token" FROM "newsletterSubscriber"
       WHERE "status" = 'subscribed'
       ORDER BY "createdAt" ASC
       LIMIT $1`,
      [limit],
    )
    return result.rows
  } catch (error) {
    console.warn('[newsletter] Could not read subscribers:', (error as Error).message)
    return []
  }
}

export async function unsubscribeWithToken(token: string): Promise<boolean> {
  if (!token || token.length > 200) return false
  try {
    await ensureNewsletterTable()
    const result = await pool.query(
      `UPDATE "newsletterSubscriber"
       SET "status" = 'unsubscribed', "unsubscribedAt" = now()
       WHERE "token" = $1 AND "status" = 'subscribed'`,
      [token],
    )
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.warn('[newsletter] Could not unsubscribe:', (error as Error).message)
    return false
  }
}
