import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminSessionCookie } from '@/lib/admin-session-cookie'

/** Ends both kinds of admin session and returns to the sign-in screen. */
export async function GET(request: NextRequest) {
  try {
    await auth.api.signOut({ headers: request.headers })
  } catch {
    // No better-auth session to clear; the admin cookie below still gets removed.
  }

  const response = NextResponse.redirect(new URL('/admin', request.url))
  response.cookies.set(
    adminSessionCookie('', {
      maxAgeSeconds: 0,
      secure: process.env.NODE_ENV === 'production',
    }),
  )
  return response
}
