import { NextRequest, NextResponse } from 'next/server'
import { and, count, desc, gt, like } from 'drizzle-orm'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { inboxMessage } from '@/lib/db/schema'
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  verifyAdminBasicAuthHeader,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { planContactSubmission, type ContactSubmission } from '@/lib/contact-submission'
import { contactAcknowledgement } from '@/lib/email-templates'
import { noReplyAddress, readMailConfig, sendMail } from '@/lib/mailer'
import { createSlidingWindowLimiter } from '@/lib/rate-limit'
import { consumeDurableLimit } from '@/lib/rate-limit-db'
import { SITE_URL } from '@/lib/seo'

/**
 * Contact messages.
 *
 * Anonymous submissions are rate-limited, length-capped and honeypot-filtered
 * before any work happens. Accepted messages go to the `inboxMessage` table
 * (durable) and, when configured, to Resend so the owner is emailed.
 *
 * There is deliberately no file channel: on serverless runtimes a JSON file is
 * per-instance and lost on the next cold start, so it promised durability it
 * could not provide.
 */

type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

const MAX_BODY_BYTES = 32_000
const WINDOW_MS = 10 * 60 * 1000
const PER_IP_LIMIT = 5
const PER_SENDER_LIMIT = 3
const PER_SENDER_WINDOW_MS = 60 * 60 * 1000

const ipLimiter = createSlidingWindowLimiter({ limit: PER_IP_LIMIT, windowMs: WINDOW_MS })

function senderKey(request: NextRequest, submission: ContactSubmission): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()
  return ip ? `ip:${ip}` : `email:${submission.email.toLowerCase()}`
}

/** Escapes LIKE wildcards so a sender cannot widen the pattern with `%`/`_`. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`)
}

async function senderAlreadyBusy(submission: ContactSubmission): Promise<boolean> {
  try {
    const since = new Date(Date.now() - PER_SENDER_WINDOW_MS)
    const [row] = await db
      .select({ total: count() })
      .from(inboxMessage)
      .where(
        and(
          like(inboxMessage.fromEmail, `%<${escapeLike(submission.email)}>`),
          gt(inboxMessage.receivedAt, since),
        ),
      )
    return Number(row?.total ?? 0) >= PER_SENDER_LIMIT
  } catch (error) {
    // The inbox table is a belt-and-braces throttle; the in-memory limiter and
    // field caps still apply when it cannot be read.
    console.warn('[messages] Could not check recent sender activity:', (error as Error).message)
    return false
  }
}

function recipient() {
  return process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || ''
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function storeInDatabase(message: Message): Promise<boolean> {
  try {
    await db
      .insert(inboxMessage)
      .values({
        id: message.id,
        fromEmail: `${message.name} <${message.email}>`,
        toEmail: recipient() || message.email,
        subject: message.subject,
        textBody: message.message,
        htmlBody: [
          `<p><strong>${escapeHtml(message.name)}</strong> &lt;${escapeHtml(message.email)}&gt;</p>`,
          `<p><strong>${escapeHtml(message.subject)}</strong></p>`,
          `<p>${escapeHtml(message.message).replace(/\n/g, '<br />')}</p>`,
        ].join(''),
      })
      .onConflictDoNothing()
    return true
  } catch (error) {
    console.warn('[messages] Database insert failed:', (error as Error).message)
    return false
  }
}

async function deliverByEmail(message: Message): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = recipient()
  if (!apiKey || !to) return false

  const domain = process.env.RESEND_EMAIL_DOMAIN || 'ashokrimal.com.np'
  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: `Portfolio Contact <contact@${domain}>`,
      to,
      replyTo: message.email,
      subject: `New message: ${message.subject} (from ${message.name})`,
      text: `Name: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\n\n${message.message}`,
    })
    if (error) {
      console.error('[messages] Resend rejected the email:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('[messages] Resend request failed:', (error as Error).message)
    return false
  }
}

function parseFrom(fromEmail: string | null): { name: string; email: string } {
  if (!fromEmail) return { name: '', email: '' }
  const match = fromEmail.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1], email: match[2] }
  return { name: '', email: fromEmail }
}

async function readDatabaseMessages(): Promise<Message[]> {
  try {
    const rows = await db
      .select()
      .from(inboxMessage)
      .orderBy(desc(inboxMessage.receivedAt))
      .limit(200)

    return rows.map((row) => {
      const { name, email } = parseFrom(row.fromEmail)
      return {
        id: row.id,
        name: name || email,
        email,
        subject: row.subject,
        message: row.textBody ?? '',
        createdAt: new Date(row.receivedAt).toISOString(),
      }
    })
  } catch (error) {
    console.warn('[messages] Could not read the inbox table:', (error as Error).message)
    return []
  }
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'That message is too large.' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const decision = planContactSubmission(body)
  if (decision.kind === 'reject') {
    return NextResponse.json({ error: decision.error }, { status: decision.status })
  }
  if (decision.kind === 'drop') {
    // Same response as a delivered message: a bot learns nothing about the trap.
    return NextResponse.json({ success: true })
  }

  const submission = decision.submission

  const limit = ipLimiter.check(senderKey(request, submission))
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages were sent from this connection. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  // The in-memory window is per instance; this one is shared, so a burst spread
  // over several instances still meets the same allowance.
  const durable = await consumeDurableLimit({
    scope: 'contact',
    identifier: senderKey(request, submission),
    limit: PER_IP_LIMIT,
    windowMs: WINDOW_MS,
  })
  if (!durable.allowed) {
    return NextResponse.json(
      { error: 'Too many messages were sent from this connection. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(durable.retryAfterSeconds) } },
    )
  }

  if (await senderAlreadyBusy(submission)) {
    return NextResponse.json(
      { error: 'You have already sent several messages recently. Please wait before sending another.' },
      { status: 429, headers: { 'Retry-After': String(PER_SENDER_WINDOW_MS / 1000) } },
    )
  }

  const message: Message = {
    id: crypto.randomUUID(),
    ...submission,
    createdAt: new Date().toISOString(),
  }

  const [stored, delivered] = await Promise.all([
    storeInDatabase(message),
    deliverByEmail(message),
  ])

  if (!stored && !delivered) {
    return NextResponse.json(
      {
        error: 'The message could not be delivered. Email delivery and message storage are both unavailable.',
      },
      { status: 503 },
    )
  }

  // Acknowledge the sender from the domain address; their reply goes to the
  // owner because Reply-To is the contact inbox, not no-reply@.
  const config = readMailConfig()
  if (config) {
    const acknowledgement = contactAcknowledgement({
      name: message.name,
      subject: message.subject,
      message: message.message,
      siteUrl: SITE_URL,
    })
    const acknowledged = await sendMail({
      ...acknowledgement,
      to: message.email,
      from: noReplyAddress(config.domain),
      replyTo: config.ownerEmail || undefined,
    })
    if (!acknowledged.ok) {
      console.warn('[messages] Acknowledgement not delivered:', acknowledged.error)
    }
  }

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  // Either the signed admin session cookie or env-backed basic auth (for scripts).
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const authorized =
    (await verifyAdminSessionToken(sessionCookie)) ||
    (await verifyAdminBasicAuthHeader(request.headers.get('authorization')))

  if (!authorized) {
    return NextResponse.json(
      { error: (await isAdminAuthConfigured()) ? 'Unauthorized' : 'Admin sign-in is not configured.' },
      { status: (await isAdminAuthConfigured()) ? 401 : 503 },
    )
  }

  const messages = await readDatabaseMessages()

  return NextResponse.json(messages, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  })
}
