import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'

/** Ends both kinds of admin session and returns to the sign-in screen. */
export async function GET(request: NextRequest) {
  try {
    await auth.api.signOut({ headers: request.headers })
  } catch {
    // No better-auth session to clear; the admin cookie below still gets removed.
  }

  const response = NextResponse.redirect(new URL('/admin', request.url))
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
