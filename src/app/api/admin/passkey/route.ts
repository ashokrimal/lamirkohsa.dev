import { NextRequest, NextResponse } from 'next/server'
import { describeCaller, recordAdminEvent } from '@/lib/admin-audit'
import { hasOwnerAccess } from '@/lib/admin-auth'
import {
  deleteAdminPasskey,
  isPasskeyAuthConfigured,
  listAdminPasskeySummaries,
} from '@/lib/admin-passkey'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** The owner's enrolled passkeys, without any key material. */
export async function GET() {
  if (!(await hasOwnerAccess())) {
    return NextResponse.json({ error: 'Sign in to view passkeys.' }, { status: 401 })
  }

  const passkeys = await listAdminPasskeySummaries()
  return NextResponse.json(
    { passkeys, configured: await isPasskeyAuthConfigured() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

/** Removes one passkey. The password sign-in is untouched by this. */
export async function DELETE(request: NextRequest) {
  if (!(await hasOwnerAccess())) {
    return NextResponse.json({ error: 'Sign in to remove a passkey.' }, { status: 401 })
  }

  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Unknown passkey.' }, { status: 400 })
  }

  if (!(await deleteAdminPasskey(id))) {
    return NextResponse.json({ error: 'That passkey is already gone.' }, { status: 404 })
  }

  await recordAdminEvent({
    action: 'passkey-removed',
    detail: `passkey #${id} deleted`,
    caller: describeCaller(request.headers),
  })

  return NextResponse.json({ success: true })
}
