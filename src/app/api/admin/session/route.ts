import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_REMEMBERED_SESSION_MAX_AGE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  isAdminAuthConfigured,
  isSecondFactorRequired,
  readAdminSession,
  verifyAdminCredentials,
  verifyAdminSecondFactor,
} from '@/lib/admin-auth'
import { describeCaller, recordAdminEvent } from '@/lib/admin-audit'
import { adminSessionCookie } from '@/lib/admin-session-cookie'

const secureCookie = process.env.NODE_ENV === 'production'

/**
 * Keeps a remembered session alive.
 *
 * The admin studio calls this when it loads. A remembered session gets a fresh
 * seven-day window, so ordinary use never hits a sign-in screen; a session the
 * owner chose not to remember keeps its short lifetime. No session, or an
 * expired one, answers 401 and the page guard sends them to sign-in.
 */
export async function GET() {
  const session = await readAdminSession()
  if (!session) return NextResponse.json({ error: 'No session.' }, { status: 401 })

  const maxAge = session.remembered ? ADMIN_REMEMBERED_SESSION_MAX_AGE : ADMIN_SESSION_MAX_AGE
  const token = await createAdminSessionToken(Date.now(), maxAge)
  if (!token) return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })

  const response = NextResponse.json({
    success: true,
    remembered: session.remembered,
    expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
  })
  response.cookies.set(
    adminSessionCookie(token, {
      maxAgeSeconds: session.remembered ? maxAge : undefined,
      secure: secureCookie,
    }),
  )
  return response
}

/** Signs the admin in. Credentials are compared here, never in the browser. */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthConfigured())) {
    return NextResponse.json(
      {
        error:
          'Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.',
      },
      { status: 503 },
    )
  }

  let email = ''
  let password = ''
  let code = ''
  let remember = true
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      code?: string
      remember?: boolean
    }
    email = String(body.email ?? '')
    password = String(body.password ?? '')
    code = String(body.code ?? '')
    // Remembering the device is the default; only an explicit opt-out trades it
    // for a browser-session cookie.
    remember = body.remember !== false
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const caller = describeCaller(request.headers)

  if (!(await verifyAdminCredentials(email, password))) {
    await recordAdminEvent({ action: 'sign-in-failed', detail: 'password rejected', caller })
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  // With ADMIN_TOTP_SECRET set, the password is only the first step.
  if (isSecondFactorRequired() && !verifyAdminSecondFactor(code)) {
    await recordAdminEvent({
      action: 'second-factor-failed',
      detail: 'authenticator code rejected',
      caller,
    })
    return NextResponse.json(
      { error: 'That authenticator code is not valid. Enter the current six digits.' },
      { status: 401 },
    )
  }

  const maxAge = remember ? ADMIN_REMEMBERED_SESSION_MAX_AGE : ADMIN_SESSION_MAX_AGE
  const token = await createAdminSessionToken(Date.now(), maxAge)
  if (!token) {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
  }

  const response = NextResponse.json({ success: true, remembered: remember })
  response.cookies.set(
    adminSessionCookie(token, { maxAgeSeconds: remember ? maxAge : undefined, secure: secureCookie }),
  )

  await recordAdminEvent({
    action: 'sign-in',
    detail: remember ? 'studio session started (remembered device)' : 'studio session started',
    caller,
  })
  return response
}

/** Signs the admin out by clearing the session cookie. */
export async function DELETE(request: NextRequest) {
  await recordAdminEvent({ action: 'sign-out', caller: describeCaller(request.headers) })
  const response = NextResponse.json({ success: true })
  response.cookies.set(adminSessionCookie('', { maxAgeSeconds: 0, secure: secureCookie }))
  return response
}
