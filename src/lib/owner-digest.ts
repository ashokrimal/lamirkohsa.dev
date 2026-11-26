import { pool } from '@/lib/db'
import { countSubscribersSince, newsletterCounts } from '@/lib/newsletter-store'
import { checkScheduledBackups, type ScheduledBackups } from '@/lib/health'
import { SITE_URL } from '@/lib/seo'

/**
 * The weekly owner email.
 *
 * It reports only what the site already knows: inbox arrivals, new subscribers,
 * drafts that have not moved, and whether the scheduled backup is still running.
 * Building and rendering are pure apart from the reads, so the wording can be
 * tested without a database.
 */

export interface DigestMessage {
  from: string
  subject: string
  receivedAt: string
}

export interface DigestStaleDraft {
  title: string
  collection: string
  updatedAt: string | null
}

export interface OwnerDigest {
  generatedAt: string
  newMessages: DigestMessage[]
  totalUnread: number
  newSubscribers: number
  subscribers: { subscribed: number; unsubscribed: number } | null
  staleDrafts: DigestStaleDraft[]
  drafts: number
  backup: ScheduledBackups
  failures: string[]
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const STALE_MS = 30 * 24 * 60 * 60 * 1000

export async function buildOwnerDigest(now = new Date()): Promise<OwnerDigest> {
  const weekAgo = new Date(now.getTime() - WEEK_MS)
  const staleBefore = new Date(now.getTime() - STALE_MS)
  const failures: string[] = []

  let newMessages: DigestMessage[] = []
  let totalUnread = 0
  try {
    const [recent, unread] = await Promise.all([
      pool.query<{ fromEmail: string; subject: string; receivedAt: Date | string }>(
        `SELECT "fromEmail", "subject", "receivedAt"
           FROM "inboxMessage"
          WHERE "receivedAt" >= $1
          ORDER BY "receivedAt" DESC
          LIMIT 20`,
        [weekAgo],
      ),
      pool.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM "inboxMessage" WHERE "readAt" IS NULL`,
      ),
    ])
    newMessages = recent.rows.map((row) => ({
      from: row.fromEmail,
      subject: row.subject,
      receivedAt: new Date(row.receivedAt).toISOString(),
    }))
    totalUnread = Number(unread.rows[0]?.count ?? 0) || 0
  } catch (error) {
    failures.push(`inbox: ${(error as Error).message}`)
  }

  let newSubscribers = 0
  let subscribers: OwnerDigest['subscribers'] = null
  try {
    const [count, counts] = await Promise.all([
      countSubscribersSince(weekAgo),
      newsletterCounts(),
    ])
    newSubscribers = count
    subscribers = counts
  } catch (error) {
    failures.push(`newsletter: ${(error as Error).message}`)
  }

  let staleDrafts: DigestStaleDraft[] = []
  let drafts = 0
  try {
    const [countResult, result] = await Promise.all([
      pool.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM "cmsContent" WHERE lower(trim("status")) <> 'published'`,
      ),
      pool.query<{ title: string; collection: string; updatedAt: Date | string | null }>(
        `SELECT "title", "collection", "updatedAt"
           FROM "cmsContent"
          WHERE lower(trim("status")) <> 'published'
          ORDER BY "updatedAt" ASC NULLS FIRST
          LIMIT 200`,
      ),
    ])
    drafts = Number(countResult.rows[0]?.count ?? 0) || 0
    staleDrafts = result.rows
      .filter((row) => {
        if (!row.updatedAt) return true
        const updated = new Date(row.updatedAt).getTime()
        return Number.isFinite(updated) && updated < staleBefore.getTime()
      })
      .slice(0, 8)
      .map((row) => ({
        title: row.title,
        collection: row.collection,
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      }))
  } catch (error) {
    failures.push(`cms: ${(error as Error).message}`)
  }

  const backup = await checkScheduledBackups()

  return {
    generatedAt: now.toISOString(),
    newMessages,
    totalUnread,
    newSubscribers,
    subscribers,
    staleDrafts,
    drafts,
    backup,
    failures,
  }
}

export function renderOwnerDigest(digest: OwnerDigest): { subject: string; text: string; html: string } {
  const date = new Date(digest.generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const subject = `Studio week of ${date}: ${digest.newMessages.length} messages, ${digest.newSubscribers} subscribers`

  const lines: string[] = [`Studio digest — ${date}`, '']

  lines.push(
    digest.newMessages.length
      ? `New messages (${digest.newMessages.length}; ${digest.totalUnread} unread in total):`
      : 'No new contact messages this week.',
  )
  for (const message of digest.newMessages.slice(0, 5)) {
    lines.push(`  · ${message.subject} — ${message.from}`)
  }
  lines.push('')

  lines.push(
    `Journal list: ${digest.newSubscribers} new subscriber${digest.newSubscribers === 1 ? '' : 's'} this week` +
      (digest.subscribers
        ? ` (${digest.subscribers.subscribed} subscribed, ${digest.subscribers.unsubscribed} unsubscribed).`
        : '.'),
  )
  lines.push('')

  lines.push(
    digest.staleDrafts.length
      ? `Drafts untouched for 30 days or more (${digest.staleDrafts.length} of ${digest.drafts} drafts):`
      : `Drafts: ${digest.drafts} open, none older than 30 days.`,
  )
  for (const draft of digest.staleDrafts) {
    lines.push(`  · ${draft.title} (${draft.collection})`)
  }
  lines.push('')

  lines.push(
    `Scheduled backup: ${digest.backup.status}` +
      (digest.backup.ageHours === null ? '.' : `, newest ${digest.backup.ageHours}h old.`),
  )
  if (digest.failures.length) {
    lines.push('', `Some readings failed: ${digest.failures.join('; ')}`)
  }
  lines.push('', `Studio: ${SITE_URL}/admin`)

  const text = lines.join('\n')
  const esc = (value: string) =>
    value.replace(/[&<>"]/g, (character) =>
      character === '&' ? '&amp;' : character === '<' ? '&lt;' : character === '>' ? '&gt;' : '&quot;',
    )

  const html = [
    '<div style="font-family:-apple-system,Segoe UI,sans-serif;line-height:1.6;color:#1d1d1f">',
    `<h1 style="font-size:20px">Studio digest — ${esc(date)}</h1>`,
    `<h2 style="font-size:14px;margin-top:20px">Inbox</h2>`,
    digest.newMessages.length
      ? `<p>${digest.newMessages.length} new message${digest.newMessages.length === 1 ? '' : 's'} · ${digest.totalUnread} unread in total.</p><ul>${digest.newMessages
          .slice(0, 5)
          .map((message) => `<li>${esc(message.subject)} — ${esc(message.from)}</li>`)
          .join('')}</ul>`
      : '<p>No new contact messages this week.</p>',
    `<h2 style="font-size:14px;margin-top:20px">Journal</h2>`,
    `<p>${digest.newSubscribers} new subscriber${digest.newSubscribers === 1 ? '' : 's'} this week${
      digest.subscribers
        ? ` · ${digest.subscribers.subscribed} subscribed, ${digest.subscribers.unsubscribed} unsubscribed`
        : ''
    }.</p>`,
    `<h2 style="font-size:14px;margin-top:20px">Drafts</h2>`,
    digest.staleDrafts.length
      ? `<p>${digest.staleDrafts.length} of ${digest.drafts} drafts untouched for 30 days or more:</p><ul>${digest.staleDrafts
          .map((draft) => `<li>${esc(draft.title)} (${esc(draft.collection)})</li>`)
          .join('')}</ul>`
      : `<p>${digest.drafts} open drafts, none older than 30 days.</p>`,
    `<h2 style="font-size:14px;margin-top:20px">Backup</h2>`,
    `<p>Scheduled backup: ${esc(digest.backup.status)}${
      digest.backup.ageHours === null ? '.' : `, newest ${digest.backup.ageHours}h old.`
    }</p>`,
    digest.failures.length
      ? `<p style="color:#a16207">Some readings failed: ${esc(digest.failures.join('; '))}</p>`
      : '',
    `<p style="margin-top:24px"><a href="${SITE_URL}/admin/status">Open the status panel</a></p>`,
    '</div>',
  ].join('')

  return { subject, text, html }
}
