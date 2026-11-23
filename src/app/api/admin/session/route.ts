import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  isAdminAuthConfigured,
  isSecondFactorRequired,
  verifyAdminCredentials,
  verifyAdminSecondFactor,
} from '@/lib/admin-auth'
import { describeCaller, recordAdminEvent } from '@/lib/admin-audit'

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
  try {
    const body = (await request.json()) as { email?: string; password?: string; code?: string }
    email = String(body.email ?? '')
    password = String(body.password ?? '')
    code = String(body.code ?? '')
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

  const token = await createAdminSessionToken()
  if (!token) {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })

  await recordAdminEvent({ action: 'sign-in', detail: 'studio session started', caller })
  return response
}

/** Signs the admin out by clearing the session cookie. */
export async function DELETE(request: NextRequest) {
  await recordAdminEvent({ action: 'sign-out', caller: describeCaller(request.headers) })
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
