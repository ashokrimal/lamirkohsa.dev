import { NextResponse } from 'next/server'
import { hasDatabaseConfig, pool } from '@/lib/db'
import { isAdminAuthConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Deployment health check.
 *
 * Reports whether the pieces the site needs at runtime are present and working.
 * Only names and booleans are returned — never values, URLs or error internals.
 */
export async function GET() {
  const env = {
    database: hasDatabaseConfig(),
    betterAuthSecret: Boolean(process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_API_KEY),
    betterAuthUrl: Boolean(
      process.env.BETTER_AUTH_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL,
    ),
    adminSignIn: await isAdminAuthConfigured(),
    email: Boolean(process.env.RESEND_API_KEY),
    contactRecipient: Boolean(process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL),
    blobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  }

  let database: 'connected' | 'unavailable' | 'not-configured' = 'not-configured'
  if (env.database) {
    try {
      await pool.query('select 1')
      database = 'connected'
    } catch (error) {
      console.error('[health] Database check failed:', (error as Error).message)
      database = 'unavailable'
    }
  }

  const missing = Object.entries(env)
    .filter(([, present]) => !present)
    .map(([name]) => name)

  const ok = database === 'connected' && env.betterAuthSecret
  return NextResponse.json(
    { ok, database, env, missing },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
