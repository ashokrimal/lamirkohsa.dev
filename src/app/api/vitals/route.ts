import { NextRequest, NextResponse } from 'next/server'
import { createSlidingWindowLimiter } from '@/lib/rate-limit'
import {
  describeWebVital,
  exceedsBudget,
  parseWebVital,
} from '@/lib/web-vitals'

export const dynamic = 'force-dynamic'

/**
 * Where the browser's Web Vitals measurements land.
 *
 * Every page reports LCP, INP, CLS, FCP and TTFB once; the route logs each
 * measurement in one fixed format and raises a warning when it is over the budget
 * in `web-vitals.ts`. That is enough to notice a regression in the deployment log
 * without running an external analytics service.
 */

const limiter = createSlidingWindowLimiter({ limit: 60, windowMs: 5 * 60 * 1000 })

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || 'anonymous'
  if (!limiter.check(ip).allowed) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const report = parseWebVital(body)
  if (!report) return NextResponse.json({ ok: false }, { status: 202 })

  const line = describeWebVital(report.name, report.value, report.path)
  if (exceedsBudget(report)) {
    console.warn(line)
  } else {
    console.info(line)
  }

  return NextResponse.json({ ok: true }, { status: 202 })
}
