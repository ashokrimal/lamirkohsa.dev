import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { adminCredential } from '@/lib/db/schema'
import { db, pool } from '@/lib/db'

/**
 * Server-side owner authentication for the admin studio.
 *
 * The owner account normally lives in the database (`adminCredential`) so it can
 * be created on first run and the password can be changed from the studio. The
 * environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET) are
 * still honoured as a bootstrap: if no database account exists they sign the
 * owner in, and the first password change promotes them into the database.
 *
 * A successful sign-in issues a signed, expiring cookie. The browser never sees
 * a password, the session secret or which half of the credentials was wrong.
 */
export const ADMIN_SESSION_COOKIE = 'admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8

/**
 * Owner id used for records created through the cookie-based admin session. It is
 * the id this portfolio's content already belongs to.
 */
export const ADMIN_OWNER_ID = 'admin-ashok-rimal'

export const ADMIN_PASSWORD_MIN_LENGTH = 10

export type AdminIdentity = {
  email: string
  /** scrypt hash for database accounts; absent for environment bootstrap. */
  passwordHash?: string
  /** plain environment password, only present for the bootstrap identity. */
  environmentPassword?: string
  sessionSecret: string
  source: 'database' | 'environment'
}

let cachedIdentity: { value: AdminIdentity | null; expiresAt: number } | null = null
const IDENTITY_CACHE_MS = 3_000

function invalidateIdentityCache() {
  cachedIdentity = null
}

function constantTimeEquals(a: string, b: string) {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${derived}`
}

function verifyPasswordHash(password: string, stored: string) {
  const [scheme, salt, expected] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !expected) return false
  const actual = scryptSync(password, salt, 64).toString('hex')
  return constantTimeEquals(actual, expected)
}

/**
 * Creates the credential table on demand. The project has no committed
 * migration runner, so the first setup call provisions its own table; once it
 * exists this is a no-op guarded by a module flag.
 */
let tableReady = false
async function ensureAdminCredentialTable() {
  if (tableReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "adminCredential" (
      "id" serial PRIMARY KEY,
      "email" text NOT NULL UNIQUE,
      "passwordHash" text NOT NULL,
      "sessionSecret" text NOT NULL,
      "updatedAt" timestamp NOT NULL DEFAULT now()
    )
  `)
  tableReady = true
}

function environmentIdentity(): AdminIdentity | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  if (!email || !password || !sessionSecret) return null
  return { email, passwordHash: undefined, environmentPassword: password, sessionSecret, source: 'environment' }
}

/**
 * The active owner identity: the database account wins, then the environment.
 * Returns null when neither exists (a fresh deployment waiting for setup).
 */
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (cachedIdentity && cachedIdentity.expiresAt > Date.now()) return cachedIdentity.value

  let identity: AdminIdentity | null = null
  try {
    const [row] = await db.select().from(adminCredential).limit(1)
    if (row) {
      identity = {
        email: row.email,
        passwordHash: row.passwordHash,
        sessionSecret: row.sessionSecret,
        source: 'database',
      }
    }
  } catch {
    // Database not reachable (or table not created yet); fall back to env.
  }

  identity ??= environmentIdentity()
  cachedIdentity = { value: identity, expiresAt: Date.now() + IDENTITY_CACHE_MS }
  return identity
}

/** True when an owner account exists and can issue sessions. */
export async function isAdminAuthConfigured() {
  const identity = await getAdminIdentity()
  return Boolean(identity?.sessionSecret)
}

/** True when there is no owner yet, so the one-time setup form may run. */
export async function canSetupAdmin() {
  return (await getAdminIdentity()) === null
}

export async function verifyAdminCredentials(email: string, password: string) {
  const identity = await getAdminIdentity()
  if (!identity) return false

  const emailMatches = constantTimeEquals(email.trim().toLowerCase(), identity.email)
  const passwordMatches = identity.passwordHash
    ? verifyPasswordHash(password, identity.passwordHash)
    : constantTimeEquals(password, identity.environmentPassword ?? '')

  return emailMatches && passwordMatches
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/** Returns a `<expiry>.<signature>` token, or null when no owner is configured. */
export async function createAdminSessionToken(now = Date.now()) {
  const identity = await getAdminIdentity()
  if (!identity?.sessionSecret) return null
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000
  return `${expiresAt}.${sign(String(expiresAt), identity.sessionSecret)}`
}

export async function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  const identity = await getAdminIdentity()
  if (!identity?.sessionSecret || !token) return false

  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature) return false

  const expiry = Number(expiresAt)
  if (!Number.isFinite(expiry) || expiry < now) return false

  return constantTimeEquals(signature, sign(expiresAt, identity.sessionSecret))
}

/** True when the current request carries a valid, unexpired admin session cookie. */
export async function hasAdminSession() {
  try {
    const store = await cookies()
    return await verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value)
  } catch {
    return false
  }
}

/**
 * Creates the single owner account. Refused once any identity exists, so it can
 * never overwrite a live account or resurrect a deleted demo login.
 */
export async function setupAdminAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Enter a valid email address.')
  }
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
    throw new Error(`Choose a password with at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`)
  }
  if (await getAdminIdentity()) {
    throw new Error('An owner account already exists. Sign in instead.')
  }

  try {
    await ensureAdminCredentialTable()
  } catch (error) {
    console.error('[admin-auth] Could not create the credential table:', (error as Error).message)
    throw new Error('The database is unavailable, so the owner account cannot be created yet.')
  }

  const sessionSecret = randomBytes(32).toString('hex')
  await db.insert(adminCredential).values({
    email: normalizedEmail,
    passwordHash: hashAdminPassword(password),
    sessionSecret,
  })
  invalidateIdentityCache()
  return { email: normalizedEmail }
}

/**
 * Changes the signed-in owner's password. Bootstrap (environment) owners are
 * promoted into the database on their first change, keeping their session.
 */
export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const identity = await getAdminIdentity()
  if (!identity) throw new Error('No owner account is configured.')

  const currentMatches = identity.passwordHash
    ? verifyPasswordHash(currentPassword, identity.passwordHash)
    : constantTimeEquals(currentPassword, identity.environmentPassword ?? '')
  if (!currentMatches) throw new Error('The current password is incorrect.')

  if (newPassword.length < ADMIN_PASSWORD_MIN_LENGTH) {
    throw new Error(`Choose a password with at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`)
  }
  if (constantTimeEquals(newPassword, currentPassword)) {
    throw new Error('Choose a password different from the current one.')
  }

  await ensureAdminCredentialTable()
  const passwordHash = hashAdminPassword(newPassword)

  if (identity.source === 'database') {
    await db
      .update(adminCredential)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(adminCredential.email, identity.email))
  } else {
    await db.insert(adminCredential).values({
      email: identity.email,
      passwordHash,
      sessionSecret: identity.sessionSecret,
    })
  }

  invalidateIdentityCache()
}

/** Basic auth stays available for scripts; it is still checked against the owner. */
export async function verifyAdminBasicAuthHeader(header: string | null) {
  if (!header?.startsWith('Basic ')) return false
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    const separator = decoded.indexOf(':')
    if (separator < 0) return false
    return await verifyAdminCredentials(decoded.slice(0, separator), decoded.slice(separator + 1))
  } catch {
    return false
  }
}

/**
 * The owner id for writes, or null when the request is not the owner. A
 * better-auth session only counts when its address matches the configured
 * owner; every other account is treated as signed out.
 */
export async function getAdminActorId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const identity = await getAdminIdentity()
    if (
      session?.user?.email &&
      identity &&
      session.user.email.toLowerCase() === identity.email.toLowerCase()
    ) {
      return session.user.id
    }
  } catch {
    // Fall through to the signed admin cookie.
  }
  if (await hasAdminSession()) return ADMIN_OWNER_ID
  return null
}

/**
 * True when the request belongs to the configured owner, either through the
 * signed admin cookie or a better-auth session with the owner's address.
 */
export async function hasOwnerAccess() {
  if (await hasAdminSession()) return true
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const identity = await getAdminIdentity()
    return Boolean(
      session?.user?.email &&
        identity &&
        session.user.email.toLowerCase() === identity.email.toLowerCase(),
    )
  } catch {
    return false
  }
}
