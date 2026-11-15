import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import os from 'os'
import { promises as fs } from 'fs'
import { Resend } from 'resend'

type Subscriber = {
  id: string
  email: string
  subscribedAt: string
  source: string
}

const REPO_FILE = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')
const TMP_FILE = path.join(os.tmpdir(), 'portfolio-newsletter-subscribers.json')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function readSubscribers(pathname: string): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(pathname, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Subscriber[]) : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[newsletter] Could not read ${pathname}:`, (error as Error).message)
    }
    return []
  }
}

async function persistSubscriber(
  subscriber: Subscriber,
): Promise<{ ok: boolean; alreadySubscribed: boolean }> {
  for (const pathname of [REPO_FILE, TMP_FILE]) {
    try {
      await fs.mkdir(path.dirname(pathname), { recursive: true })
      const existing = await readSubscribers(pathname)
      const duplicate = existing.some((item) => item.email === subscriber.email)
      if (duplicate) {
        return { ok: true, alreadySubscribed: true }
      }
      await fs.writeFile(
        pathname,
        JSON.stringify([subscriber, ...existing].slice(0, 2000), null, 2),
        'utf8',
      )
      return { ok: true, alreadySubscribed: false }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? (error as Error).message
      console.warn(`[newsletter] ${pathname} is not writable: ${code}`)
    }
  }
  return { ok: false, alreadySubscribed: false }
}

function isDuplicateResendError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('already exists') ||
    normalized.includes('duplicate') ||
    normalized.includes('conflict')
  )
}

async function registerWithResend(email: string): Promise<{
  configured: boolean
  ok: boolean
  alreadySubscribed: boolean
  validationError?: string
}> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return { configured: false, ok: false, alreadySubscribed: false }
  }

  const resend = new Resend(apiKey)
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim()
  const domain = process.env.RESEND_EMAIL_DOMAIN?.trim() || 'ashokrimal.com.np'
  const ownerEmail = process.env.CONTACT_TO_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim()

  try {
    const contactResult = audienceId
      ? await resend.contacts.create({
          audienceId,
          email,
          unsubscribed: false,
        })
      : await resend.contacts.create({
          email,
          unsubscribed: false,
        })

    let alreadySubscribed = false

    if (contactResult.error) {
      const errMsg = contactResult.error.message || ''
      if (isDuplicateResendError(errMsg)) {
        alreadySubscribed = true
        // Ensure a previously unsubscribed contact is marked subscribed again.
        await resend.contacts
          .update(
            audienceId
              ? { audienceId, email, unsubscribed: false }
              : { email, unsubscribed: false },
          )
          .catch(() => undefined)
      } else {
        if (contactResult.error.name === 'validation_error') {
          return {
            configured: true,
            ok: false,
            alreadySubscribed: false,
            validationError: errMsg,
          }
        }
        console.error('[newsletter] Resend contact registration error:', errMsg)
        return { configured: true, ok: false, alreadySubscribed: false }
      }
    }

    // Best-effort owner notification when configured (never blocks subscription success).
    if (!alreadySubscribed && ownerEmail) {
      await resend.emails
        .send({
          from: `Journal Dispatch <journal@${domain}>`,
          to: ownerEmail,
          subject: `New journal subscriber: ${email}`,
          text: `A reader subscribed to your journal newsletter.\n\nEmail: ${email}\nSubscribed at: ${new Date().toISOString()}`,
          html: `<p>A reader subscribed to your journal newsletter.</p><p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        })
        .catch((err) => {
          console.warn('[newsletter] Owner notification skipped:', (err as Error).message)
        })
    }

    return { configured: true, ok: true, alreadySubscribed }
  } catch (error) {
    console.error('[newsletter] Resend request failed:', (error as Error).message)
    return { configured: true, ok: false, alreadySubscribed: false }
  }
}

export async function POST(request: NextRequest) {
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

  const subscriber: Subscriber = {
    id: crypto.randomUUID(),
    email: rawEmail,
    subscribedAt: new Date().toISOString(),
    source: 'journal',
  }

  const [resendResult, localResult] = await Promise.all([
    registerWithResend(rawEmail),
    persistSubscriber(subscriber),
  ])

  if (resendResult.validationError) {
    return NextResponse.json({ error: resendResult.validationError }, { status: 400 })
  }

  if (!resendResult.ok && !localResult.ok) {
    return NextResponse.json(
      {
        error: 'The subscription service is temporarily unavailable. Please try again later.',
      },
      { status: 503 },
    )
  }

  const alreadySubscribed = resendResult.alreadySubscribed || localResult.alreadySubscribed

  return NextResponse.json(
    {
      success: true,
      alreadySubscribed,
      message: alreadySubscribed
        ? "You're already subscribed—good to have you here."
        : "You're on the list. Thanks for reading along.",
    },
    { status: alreadySubscribed ? 200 : 201 },
  )
}
