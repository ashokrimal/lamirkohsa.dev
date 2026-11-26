import { NextResponse } from 'next/server'
import { collectHealth } from '@/lib/health'

export const dynamic = 'force-dynamic'

/**
 * Deployment health check.
 *
 * Reports whether the pieces the site needs at runtime are present and working.
 * Only names and booleans are returned — never values, URLs or error internals.
 *
 * It also watches the scheduled backup: a cron can stop running without a
 * single request failing, so the newest snapshot's age is reported as
 * `scheduledBackups`. When it is missing or older than two days it is named in
 * `warnings`, which is the machine-readable signal a monitor should watch.
 * `ok` and the status code stay about serving requests — a stale backup is a
 * warning, not a reason to call the site down.
 */
export async function GET() {
  const report = await collectHealth()
  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
