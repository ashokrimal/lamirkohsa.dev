import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 1500,
  idleTimeoutMillis: 3000,
  max: 10,
})

export const db = drizzle(pool, { schema })
