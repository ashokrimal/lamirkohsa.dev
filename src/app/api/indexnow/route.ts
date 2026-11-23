import { NextRequest, NextResponse } from 'next/server'
import { hasOwnerAccess } from '@/lib/admin-auth'
import { submitToIndexNow } from '@/lib/indexnow'
import sitemap from '@/app/sitemap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Pushes every sitemap URL to the IndexNow engines (Bing, Yandex, Seznam,
 * Naver — Bing's index also feeds DuckDuckGo and Yahoo).
 *
 * Publishing a page already pings its own URL; this endpoint is the catch-up for
 * a deployment that has been offline, a bulk import, or a deliberate resubmit
 * after a sitemap change. It is callable by Vercel Cron with CRON_SECRET, or by
 * the signed-in owner.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  const authorizedByCron = Boolean(secret) && authorization === `Bearer ${secret}`
  const authorizedByOwner = !authorizedByCron && (await hasOwnerAccess())

  if (!authorizedByCron && !authorizedByOwner) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const entries = await sitemap()
  const urls = entries.map((entry) => entry.url).filter(Boolean)
  const result = await submitToIndexNow(urls)

  return NextResponse.json(
    {
      submitted: result.submitted,
      ok: result.ok,
      status: result.status ?? null,
      urls: urls.length,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
