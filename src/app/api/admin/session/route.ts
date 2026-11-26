import { NextResponse } from 'next/server'
import { hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Whether the current visitor is the signed-in owner.
 *
 * Public pages stay statically cached, so the edit affordance cannot be decided
 * on the server without making every page dynamic. This tiny endpoint answers the
 * one question the client overlay needs; it never returns a name, an id or any
 * content, and it is not cacheable.
 */
export async function GET() {
  const owner = await hasOwnerAccess()
  return NextResponse.json(
    { owner },
    { headers: { 'Cache-Control': 'no-store, private' } },
  )
}
