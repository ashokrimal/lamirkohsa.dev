import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { buildOwnerDigest, renderOwnerDigest } from '@/lib/owner-digest'
import { journalAddress, readMailConfig, sendMail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

function hasCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/**
 * The weekly owner digest.
 *
 * Scheduled by vercel.json, guarded by the same CRON_SECRET as the backup job.
 * A missing secret answers 503 so the URL can never be triggered anonymously;
 * a missing mail configuration answers 503 with the reason instead of pretending
 * to have sent anything.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { message: 'The digest is not configured: add CRON_SECRET to the deployment.' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }
  if (!hasCronSecret(request)) {
    return NextResponse.json(
      { message: 'Unauthorized.' },
      { status: 401, headers: { 'cache-control': 'no-store' } },
    )
  }

  const config = readMailConfig()
  if (!config) {
    return NextResponse.json(
      { message: 'Email is not configured (RESEND_API_KEY is missing).' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }
  if (!config.ownerEmail) {
    return NextResponse.json(
      { message: 'No owner address is configured (CONTACT_TO_EMAIL or ADMIN_EMAIL).' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }

  const digest = await buildOwnerDigest()
  const rendered = renderOwnerDigest(digest)
  const sent = await sendMail({
    to: config.ownerEmail,
    from: journalAddress(config.domain),
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  })

  return NextResponse.json(
    {
      sent: sent.ok,
      ...(sent.ok ? {} : { error: sent.error }),
      counts: {
        newMessages: digest.newMessages.length,
        newSubscribers: digest.newSubscribers,
        staleDrafts: digest.staleDrafts.length,
        drafts: digest.drafts,
      },
      backup: digest.backup.status,
      failures: digest.failures,
    },
    { status: sent.ok ? 200 : 502, headers: { 'cache-control': 'no-store' } },
  )
}
