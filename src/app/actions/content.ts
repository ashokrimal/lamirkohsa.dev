'use server'

import { db } from '@/lib/db'
import { cmsContent, inboxMessage } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getAdminActorId } from '@/lib/admin-auth'
import { escapeHtml, replySubject } from '@/lib/email-templates'
import { noReplyAddress, readMailConfig, sendMail } from '@/lib/mailer'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

async function requireUser(): Promise<string> {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized: sign in to the admin studio first.')
  return actorId
}

export async function getAdminContent() {
  const userId = await requireUser()
  try {
    const [cms, messages] = await Promise.all([
      db
        .select({
          id: cmsContent.id,
          collection: cmsContent.collection,
          title: cmsContent.title,
          payload: cmsContent.payload,
          status: cmsContent.status,
          createdAt: cmsContent.createdAt,
        })
        .from(cmsContent)
        .where(eq(cmsContent.userId, userId))
        .orderBy(cmsContent.sortOrder, desc(cmsContent.createdAt)),
      db
        .select({
          id: inboxMessage.id,
          fromEmail: inboxMessage.fromEmail,
          subject: inboxMessage.subject,
          textBody: inboxMessage.textBody,
          receivedAt: inboxMessage.receivedAt,
          readAt: inboxMessage.readAt,
        })
        .from(inboxMessage)
        .orderBy(desc(inboxMessage.receivedAt))
        .limit(100),
    ])

    const normalizedCms = cms.map((row) => {
      const payload = (row.payload ?? {}) as Record<string, unknown>
      if (
        row.collection.trim().toLowerCase() === 'projects' &&
        typeof payload.status === 'string' &&
        /^production\s+prototype$/i.test(payload.status.trim())
      ) {
        return { ...row, payload: { ...payload, status: 'Prototype' } }
      }
      return row
    })

    return { cms: normalizedCms, messages }
  } catch (error) {
    console.warn('[Admin Content] Database unavailable:', error)
  }

  // Nothing is invented when the database is unreachable: the studio simply
  // shows an empty state until records exist.
  return { cms: [], messages: [] }
}

export type InboxReplyResult = { ok: true } | { ok: false; error: string }

const MAX_REPLY_LENGTH = 5000

/** Pulls the address out of a `Name <email@example.com>` inbox value. */
function senderAddress(fromEmail: string): string | null {
  const match = fromEmail.match(/<([^>]+)>/)
  const candidate = (match?.[1] ?? fromEmail).trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : null
}

/**
 * Replies to a contact-form message from the studio inbox.
 *
 * Mail leaves from `no-reply@` on the verified domain with the sender's own
 * subject threaded as `Re: …`; Reply-To is the owner's inbox so a follow-up
 * reaches a person. The message is marked read once the reply is accepted.
 */
export async function replyToInboxMessage(input: {
  id: string
  body: string
}): Promise<InboxReplyResult> {
  await requireUser()

  const id = typeof input?.id === 'string' ? input.id.trim() : ''
  const body = typeof input?.body === 'string' ? input.body.trim() : ''
  if (!id) return { ok: false, error: 'Which message should be answered?' }
  if (!body) return { ok: false, error: 'Write a reply before sending.' }
  if (body.length > MAX_REPLY_LENGTH) {
    return { ok: false, error: `Replies are limited to ${MAX_REPLY_LENGTH} characters.` }
  }

  const config = readMailConfig()
  if (!config) {
    return { ok: false, error: 'Email is not configured (RESEND_API_KEY is missing).' }
  }

  const [row] = await db
    .select({
      fromEmail: inboxMessage.fromEmail,
      subject: inboxMessage.subject,
      readAt: inboxMessage.readAt,
    })
    .from(inboxMessage)
    .where(eq(inboxMessage.id, id))
    .limit(1)

  if (!row) return { ok: false, error: 'That message no longer exists.' }

  const to = senderAddress(row.fromEmail)
  if (!to) return { ok: false, error: 'The sender has no usable email address.' }

  const text = `${body}\n\n— ${SITE_NAME}\n${SITE_URL}`
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:560px">${escapeHtml(
    body,
  ).replace(/\n/g, '<br />')}</div>`

  const sent = await sendMail({
    to,
    from: noReplyAddress(config.domain),
    replyTo: config.ownerEmail || undefined,
    subject: replySubject(row.subject),
    text,
    html,
  })

  if (!sent.ok) return { ok: false, error: `Resend rejected the reply: ${sent.error}` }

  if (!row.readAt) {
    await db.update(inboxMessage).set({ readAt: new Date() }).where(eq(inboxMessage.id, id))
  }

  return { ok: true }
}
