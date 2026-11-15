/**
 * Resolves the Postgres connection string across local, Neon, and Vercel
 * environments and enables TLS for remote hosts unless sslmode is specified.
 */
export function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    ''
  )
}

export function needsDatabaseSsl(url) {
  if (!url || /sslmode=/i.test(url)) return false
  try {
    const { hostname } = new URL(url)
    return !['localhost', '127.0.0.1', '::1'].includes(hostname)
  } catch {
    return false
  }
}

export function createPgClientOptions(connectionString = resolveDatabaseUrl()) {
  return {
    connectionString,
    ...(needsDatabaseSsl(connectionString) ? { ssl: { rejectUnauthorized: false } } : {}),
  }
}
