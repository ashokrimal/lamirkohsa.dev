import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Server-side admin credential check.
 *
 * Credentials live in the environment (ADMIN_EMAIL, ADMIN_PASSWORD) and are only
 * ever compared on the server. A successful sign-in issues a signed, expiring
 * cookie; the browser never sees the password or learns which half was wrong.
 *
 * Required environment:
 *   ADMIN_EMAIL           the only address allowed to sign in
 *   ADMIN_PASSWORD        its password
 *   ADMIN_SESSION_SECRET  random string used to sign the session cookie
 */
export const ADMIN_SESSION_COOKIE = 'admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8

function constantTimeEquals(a: string, b: string) {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET,
  )
}

export function verifyAdminCredentials(email: string, password: string) {
  if (!isAdminAuthConfigured()) return false
  const expectedEmail = (process.env.ADMIN_EMAIL as string).trim().toLowerCase()
  const expectedPassword = process.env.ADMIN_PASSWORD as string
  const emailMatches = constantTimeEquals(email.trim().toLowerCase(), expectedEmail)
  const passwordMatches = constantTimeEquals(password, expectedPassword)
  return emailMatches && passwordMatches
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/** Returns a `<expiry>.<signature>` token, or null when no secret is configured. */
export function createAdminSessionToken(now = Date.now()) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return null
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000
  return `${expiresAt}.${sign(String(expiresAt), secret)}`
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || !token) return false

  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature) return false

  const expiry = Number(expiresAt)
  if (!Number.isFinite(expiry) || expiry < now) return false

  return constantTimeEquals(signature, sign(expiresAt, secret))
}

/** Basic auth stays available for scripts; it is still checked against the environment. */
export function verifyAdminBasicAuthHeader(header: string | null) {
  if (!header?.startsWith('Basic ')) return false
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    const separator = decoded.indexOf(':')
    if (separator < 0) return false
    return verifyAdminCredentials(decoded.slice(0, separator), decoded.slice(separator + 1))
  } catch {
    return false
  }
}
