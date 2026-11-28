import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CMS_CACHE_TAG } from '@/lib/cms-cache'

/**
 * Called by the admin deployment after it writes to the shared database.
 *
 * Both repositories read the same Postgres instance, but each has its own Next
 * cache, so the studio cannot invalidate this deployment's tags directly. The
 * shared secret is the only thing that both projects need to configure:
 * `REVALIDATE_SECRET` here and on the CMS. Without it the site still refreshes on
 * its normal cache window; the webhook just makes a save show up immediately.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'Revalidation is not configured on this deployment.' },
      { status: 503 },
    )
  }

  const provided =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    request.headers.get('x-revalidate-secret')?.trim()
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { collection?: unknown }
  const collection = typeof body.collection === 'string' ? body.collection : undefined

  revalidateTag(CMS_CACHE_TAG, { expire: 0 })
  revalidateTag('projects', { expire: 0 })
  revalidateTag('site-settings', { expire: 0 })
  revalidatePath('/', 'layout')

  return NextResponse.json({
    ok: true,
    collection: collection ?? null,
    revalidatedAt: new Date().toISOString(),
  })
}
