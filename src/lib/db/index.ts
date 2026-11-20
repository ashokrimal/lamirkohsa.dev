import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

/**
 * Postgres connection.
 *
 * Vercel integrations do not all expose DATABASE_URL: Neon and Vercel Postgres
 * also provide POSTGRES_URL, POSTGRES_PRISMA_URL and unpooled variants. Hosted
 * databases also need TLS, which `pg` does not enable on its own unless the URL
 * says so.
 */
function resolveConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    ''
  )
}

const connectionString = resolveConnectionString()

function needsSsl(url: string) {
  if (!url || /sslmode=/i.test(url)) return false // let pg honour the URL
  try {
    const { hostname } = new URL(url)
    return !['localhost', '127.0.0.1', '::1'].includes(hostname)
  } catch {
    return false
  }
}

export function hasDatabaseConfig() {
  return Boolean(resolveConnectionString())
}

const globalForDb = globalThis as unknown as {
  pool?: Pool
  poolErrorListenerAttached?: boolean
}

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: connectionString || undefined,
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    allowExitOnIdle: true,
    max: process.env.NODE_ENV === 'production' ? 6 : 10,
  })

if (!globalForDb.poolErrorListenerAttached) {
  pool.on('error', (err) => {
    console.warn('[DB] Idle pool client error:', err instanceof Error ? err.message : String(err))
  })
  globalForDb.poolErrorListenerAttached = true
}

globalForDb.pool = pool

export const db = drizzle(pool, { schema })

function isTransientDbError(error: unknown): boolean {
  const seen = new Set<unknown>()
  let cursor: unknown = error
  while (cursor && typeof cursor === 'object' && !seen.has(cursor)) {
    seen.add(cursor)
    const err = cursor as { code?: unknown; message?: unknown; cause?: unknown }
    const code = typeof err.code === 'string' ? err.code : ''
    const message = typeof err.message === 'string' ? err.message.toLowerCase() : ''
    if (
      ['ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ECONNREFUSED', '57P01', '08001', '08006'].includes(
        code,
      ) ||
      message.includes('timeout exceeded') ||
      message.includes('connection terminated') ||
      message.includes('client has encountered a connection error') ||
      message.includes('too many clients')
    ) {
      return true
    }
    cursor = err.cause
  }
  return false
}

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (attempt >= retries || !isTransientDbError(error)) {
        throw error
      }
      const delayMs = 250 * Math.pow(2, attempt) + Math.floor(Math.random() * 120)
      attempt += 1
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}
