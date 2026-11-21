import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inboxMessage } from '@/lib/db/schema'
import { planResendWebhook } from '@/lib/resend-webhook'

/**
 * Resend inbound email. Resend signs deliveries through Svix, so the raw body
 * is verified against `svix-id`/`svix-timestamp`/`svix-signature`.
 *
 * Fails closed when `RESEND_WEBHOOK_SECRET` is missing: without it there is no
 * way to tell a real event from anyone else's POST.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = planResendWebhook({
    headers: {
      id: request.headers.get('svix-id'),
      timestamp: request.headers.get('svix-timestamp'),
      signature: request.headers.get('svix-signature'),
    },
    rawBody,
    secret: process.env.RESEND_WEBHOOK_SECRET,
    payload,
  })

  if (result.status === 503) {
    console.error('[webhooks/resend] RESEND_WEBHOOK_SECRET is not configured; rejecting the event.')
  }

  if (result.insert) {
    await db.insert(inboxMessage).values(result.insert).onConflictDoNothing()
  }

  return NextResponse.json(result.body, { status: result.status })
}
