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

/** A subscriber as the studio lists them; the token stays server-side. */
export type NewsletterSubscriberRow = {
  email: string
  source: string
  status: 'subscribed' | 'unsubscribed' | string
  createdAt: string
  unsubscribedAt: string | null
}

/**
 * One announcement email is one round of outbound mail, so the list is capped
 * rather than silently sending an unbounded batch. The cap is reported by the
 * studio when it is reached instead of truncating without saying so.
 */
export const NEWSLETTER_MAX_RECIPIENTS = 5_000
const SUBSCRIBER_PAGE_SIZE = 500

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
  // Publishing the same post twice (a save after an edit, a retry after a
  // timeout) must not email everyone again. The claim is a row in Postgres so it
  // survives a new serverless instance.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "newsletterAnnouncement" (
      "postKey" text PRIMARY KEY,
      "title" text NOT NULL DEFAULT '',
      "announcedAt" timestamptz NOT NULL DEFAULT now()
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

/**
 * Every active subscriber, up to `max` (never more than the recipient cap).
 * Reads in pages so the cap is a real ceiling and not just the first page of a
 * single query, and stops early when the list is shorter than asked for.
 */
export async function listActiveSubscribers(
  max = NEWSLETTER_MAX_RECIPIENTS,
): Promise<NewsletterSubscriber[]> {
  const ceiling = Math.max(0, Math.min(max, NEWSLETTER_MAX_RECIPIENTS))
  if (ceiling === 0) return []

  try {
    await ensureNewsletterTable()
    const subscribers: NewsletterSubscriber[] = []
    let offset = 0
    while (subscribers.length < ceiling) {
      const size = Math.min(SUBSCRIBER_PAGE_SIZE, ceiling - subscribers.length)
      const page = await pool.query<NewsletterSubscriber>(
        `SELECT "email", "token" FROM "newsletterSubscriber"
         WHERE "status" = 'subscribed'
         ORDER BY "createdAt" ASC, "id" ASC
         LIMIT $1 OFFSET $2`,
        [size, offset],
      )
      subscribers.push(...page.rows)
      if (page.rows.length < size) break
      offset += size
    }
    return subscribers
  } catch (error) {
    console.warn('[newsletter] Could not read subscribers:', (error as Error).message)
    return []
  }
}

const MAX_LISTED_SUBSCRIBERS = 1_000

/** Subscribers for the studio, newest first, with status and signup date. */
export async function listSubscribers(limit = MAX_LISTED_SUBSCRIBERS): Promise<NewsletterSubscriberRow[]> {
  const size = Math.max(1, Math.min(limit, MAX_LISTED_SUBSCRIBERS))
  try {
    await ensureNewsletterTable()
    const result = await pool.query<{
      email: string
      source: string
      status: string
      createdAt: Date | string
      unsubscribedAt: Date | string | null
    }>(
      `SELECT "email", "source", "status", "createdAt", "unsubscribedAt"
         FROM "newsletterSubscriber"
        ORDER BY "createdAt" DESC, "id" DESC
        LIMIT $1`,
      [size],
    )
    return result.rows.map((row) => ({
      email: row.email,
      source: row.source,
      status: row.status,
      createdAt: new Date(row.createdAt).toISOString(),
      unsubscribedAt: row.unsubscribedAt ? new Date(row.unsubscribedAt).toISOString() : null,
    }))
  } catch (error) {
    console.warn('[newsletter] Could not list subscribers:', (error as Error).message)
    return []
  }
}

/** How many subscribers are on each side of the list. */
export async function newsletterCounts(): Promise<{ subscribed: number; unsubscribed: number }> {
  try {
    await ensureNewsletterTable()
    const result = await pool.query<{ status: string; total: string }>(
      `SELECT "status", count(*) AS "total" FROM "newsletterSubscriber" GROUP BY "status"`,
    )
    const counts = { subscribed: 0, unsubscribed: 0 }
    for (const row of result.rows) {
      if (row.status === 'subscribed') counts.subscribed = Number(row.total)
      else counts.unsubscribed += Number(row.total)
    }
    return counts
  } catch (error) {
    console.warn('[newsletter] Could not count subscribers:', (error as Error).message)
    return { subscribed: 0, unsubscribed: 0 }
  }
}

/**
 * Claims the right to announce one post. Returns true only for the first caller,
 * so a duplicate publish, a retried request or two instances racing still send
 * one email per subscriber.
 */
export async function claimAnnouncement(postKey: string, title: string): Promise<boolean> {
  try {
    await ensureNewsletterTable()
    const result = await pool.query(
      `INSERT INTO "newsletterAnnouncement" ("postKey", "title")
       VALUES ($1, $2)
       ON CONFLICT ("postKey") DO NOTHING
       RETURNING "postKey"`,
      [postKey, title],
    )
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    // If the claim cannot be recorded, sending would risk a duplicate; skipping
    // is the quieter failure and the studio reports it.
    console.warn('[newsletter] Could not claim the announcement:', (error as Error).message)
    return false
  }
}

/** Releases a claim whose send delivered nothing, so a retry can try again. */
export async function releaseAnnouncement(postKey: string): Promise<void> {
  try {
    await ensureNewsletterTable()
    await pool.query(`DELETE FROM "newsletterAnnouncement" WHERE "postKey" = $1`, [postKey])
  } catch (error) {
    console.warn('[newsletter] Could not release the announcement:', (error as Error).message)
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

export type NewsletterAnnouncementRow = {
  postKey: string
  title: string
  announcedAt: string
}

/** Recent announcements, newest first, so the studio can see what was sent once. */
export async function listRecentAnnouncements(limit = 20): Promise<NewsletterAnnouncementRow[]> {
  const size = Math.max(1, Math.min(limit, 100))
  try {
    await ensureNewsletterTable()
    const result = await pool.query<{ postKey: string; title: string; announcedAt: Date | string }>(
      `SELECT "postKey", "title", "announcedAt"
         FROM "newsletterAnnouncement"
        ORDER BY "announcedAt" DESC
        LIMIT $1`,
      [size],
    )
    return result.rows.map((row) => ({
      postKey: row.postKey,
      title: row.title,
      announcedAt: new Date(row.announcedAt).toISOString(),
    }))
  } catch (error) {
    console.warn('[newsletter] Could not list announcements:', (error as Error).message)
    return []
  }
}
