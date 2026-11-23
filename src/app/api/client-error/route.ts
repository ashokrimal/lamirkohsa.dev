import { NextRequest, NextResponse } from 'next/server'
import {
  exceedsClientErrorBudget,
  parseClientError,
  summarizeClientError,
} from '@/lib/client-error-report'
import { createSlidingWindowLimiter } from '@/lib/rate-limit'
import { consumeDurableLimit } from '@/lib/rate-limit-db'

export const dynamic = 'force-dynamic'

/**
 * Browser errors the site actually raised.
 *
 * React error boundaries log to the browser console, which nobody reads after a
 * visitor closes the tab. This route gives the server a copy: the boundary, the
 * global `error` listener and unhandled promise rejections all post here.
 *
 * The endpoint is public and anonymous, so it is capped, deduplicated by the
 * client and rate-limited per caller. A report never carries the page's HTML or
 * its query string. When `ROLLBAR_SERVER_TOKEN` is configured the report is also
 * forwarded to that project's items API; otherwise the server log is the sink.
 */

const limiter = createSlidingWindowLimiter({ limit: 20, windowMs: 5 * 60 * 1000 })

function callerKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()
  return ip || 'anonymous'
}

async function forwardToRollbar(report: ReturnType<typeof parseClientError>) {
  const token = process.env.ROLLBAR_SERVER_TOKEN
  if (!token || !report.ok) return

  try {
    await fetch('https://api.rollbar.com/api/1/item/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        data: {
          environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
          level: 'error',
          platform: 'browser',
          language: 'javascript',
          body: { message: { body: report.report.message } },
          custom: {
            stack: report.report.stack,
            source: report.report.source,
            url: report.report.url,
            kind: report.report.kind,
          },
        },
      }),
      signal: AbortSignal.timeout(3_000),
    })
  } catch (error) {
    console.warn('[client-error] Rollbar forward failed:', (error as Error).message)
  }
}

export async function POST(request: NextRequest) {
  if (exceedsClientErrorBudget(Number(request.headers.get('content-length') ?? 0))) {
    return NextResponse.json({ ok: false }, { status: 413 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const parsed = parseClientError(body)
  if (!parsed.ok) {
    // A malformed or extension report is not worth an error response; the
    // client is a tab that may already be closing.
    return NextResponse.json({ ok: false, ignored: true }, { status: 202 })
  }

  const key = callerKey(request)
  if (!limiter.check(key).allowed) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }
  const durable = await consumeDurableLimit({
    scope: 'client-error',
    identifier: key,
    limit: 20,
    windowMs: 5 * 60 * 1000,
  })
  if (!durable.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  console.error(summarizeClientError(parsed.report), parsed.report.stack ?? '')
  await forwardToRollbar(parsed)

  return NextResponse.json({ ok: true }, { status: 202 })
}
