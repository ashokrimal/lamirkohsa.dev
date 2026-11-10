import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Deployment health check.
 *
 * Reports whether the pieces the site needs at runtime are present and working.
 * Only names and booleans are returned — never values, URLs or error internals.
 */
export async function GET() {
  const env = {
    database: Boolean(
      process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_URL_UNPOOLED,
    ),
    betterAuthSecret: Boolean(process.env.BETTER_AUTH_SECRET),
    betterAuthUrl: Boolean(process.env.BETTER_AUTH_URL),
    adminSignIn: Boolean(
      process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET,
    ),
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
