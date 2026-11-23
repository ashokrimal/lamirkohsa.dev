import { NextRequest, NextResponse } from 'next/server'
import { newsletterWelcome } from '@/lib/email-templates'
import { journalAddress, readMailConfig, sendMail } from '@/lib/mailer'
import { subscribeToNewsletter, unsubscribeUrlFor } from '@/lib/newsletter-store'
import { createSlidingWindowLimiter } from '@/lib/rate-limit'
import { consumeDurableLimit } from '@/lib/rate-limit-db'
import { SITE_URL } from '@/lib/seo'

/**
 * Journal newsletter subscriptions.
 *
 * Subscribers are stored in Postgres (`newsletterSubscriber`) so a later blog
 * publish can reach them; the previous JSON-file store lived in /tmp on
 * serverless and disappeared with the instance. A new subscriber gets one
 * welcome email from the journal address, with a personal unsubscribe link.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_BODY_BYTES = 4_000

const limiter = createSlidingWindowLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()
  return ip ? `ip:${ip}` : 'anonymous'
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 413 })
  }

  let body: { email?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
  }

  // Honeypot check: silently accept automated bot submissions without writing.
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json({
      success: true,
      alreadySubscribed: false,
      message: "You're on the list. Thanks for reading along.",
    })
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!rawEmail || rawEmail.length > 254 || !EMAIL_PATTERN.test(rawEmail)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  const limit = limiter.check(clientKey(request))
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  // Shared across instances, so rotating a cold start does not reset the count.
  const durable = await consumeDurableLimit({
    scope: 'newsletter',
    identifier: clientKey(request),
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (!durable.allowed) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(durable.retryAfterSeconds) } },
    )
  }

  const result = await subscribeToNewsletter(rawEmail, 'journal')
  if (!result.ok) {
    return NextResponse.json(
      { error: 'The subscription service is temporarily unavailable. Please try again later.' },
      { status: 503 },
    )
  }

  if (!result.alreadySubscribed) {
    const config = readMailConfig()
    if (config) {
      const welcome = newsletterWelcome({
        siteUrl: SITE_URL,
        unsubscribeUrl: unsubscribeUrlFor(result.token),
      })
      const sent = await sendMail({
        ...welcome,
        to: rawEmail,
        from: journalAddress(config.domain),
        replyTo: config.ownerEmail || undefined,
      })
      if (!sent.ok) {
        console.warn('[newsletter] Welcome email not delivered:', sent.error)
      }
    }
  }

  return NextResponse.json(
    {
      success: true,
      alreadySubscribed: result.alreadySubscribed,
      message: result.alreadySubscribed
        ? "You're already subscribed—good to have you here."
        : "You're on the list. Thanks for reading along.",
    },
    { status: result.alreadySubscribed ? 200 : 201 },
  )
}
