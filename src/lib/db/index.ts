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

const globalForDb = globalThis as unknown as { pool?: Pool }

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: connectionString || undefined,
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
  })

globalForDb.pool = pool

export const db = drizzle(pool, { schema })
