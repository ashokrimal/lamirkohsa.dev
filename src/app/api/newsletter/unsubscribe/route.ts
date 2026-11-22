import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeWithToken } from '@/lib/newsletter-store'
import { SITE_URL } from '@/lib/seo'

/**
 * One-click unsubscribe for journal emails. The token is the subscriber's own
 * random value, so the link works without a session and reveals nothing else.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const removed = await unsubscribeWithToken(token)
  const destination = new URL(
    removed ? '/blogs?newsletter=unsubscribed' : '/blogs?newsletter=invalid',
    SITE_URL,
  )
  return NextResponse.redirect(destination, 303)
}
