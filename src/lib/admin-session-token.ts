import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * The signed admin session token, with no database or request access.
 *
 * A token is `<expiry>.<remembered>.<signature>`:
 *   - `expiry`     epoch milliseconds the session ends at
 *   - `remembered` `1` for a persistent device session, `0` for a short one
 *   - `signature`  HMAC-SHA256 of `"<expiry>.<remembered>"` with the owner's
 *                  session secret
 *
 * Both fields are inside the signed payload, so neither the expiry nor the
 * remembered flag can be edited in a cookie. Tokens issued before the flag
 * existed have two parts (`<expiry>.<signature>`) and are still accepted for
 * their remaining lifetime, treated as remembered so the next visit upgrades
 * them to the current format.
 */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8
export const ADMIN_REMEMBERED_SESSION_MAX_AGE = 60 * 60 * 24 * 7

export interface AdminSessionToken {
  /** Epoch milliseconds. */
  expiresAt: number
  remembered: boolean
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function constantTimeEquals(a: string, b: string) {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

export function createAdminSessionTokenValue(input: {
  secret: string
  now?: number
  maxAgeSeconds?: number
}): string {
  const now = input.now ?? Date.now()
  const maxAge = input.maxAgeSeconds ?? ADMIN_SESSION_MAX_AGE
  const expiresAt = now + maxAge * 1000
  // A window of at least the remembered lifetime is what makes the cookie
  // survive a browser restart, so the flag is derived rather than passed in.
  const remembered = maxAge >= ADMIN_REMEMBERED_SESSION_MAX_AGE ? '1' : '0'
  const payload = `${expiresAt}.${remembered}`
  return `${payload}.${sign(payload, input.secret)}`
}

export function verifyAdminSessionTokenValue(input: {
  secret: string
  token?: string | null
  now?: number
}): AdminSessionToken | null {
  const now = input.now ?? Date.now()
  const { secret, token } = input
  if (!secret || !token) return null

  const parts = token.split('.')
  if (parts.length !== 2 && parts.length !== 3) return null

  const legacy = parts.length === 2
  const [expiresAt, rememberedOrSignature, signature] = legacy
    ? [parts[0], '1', parts[1]]
    : parts
  if (!expiresAt || !signature) return null

  const expiry = Number(expiresAt)
  if (!Number.isFinite(expiry) || expiry < now) return null

  const payload = legacy ? expiresAt : `${expiresAt}.${rememberedOrSignature}`
  if (!constantTimeEquals(signature, sign(payload, secret))) return null

  return { expiresAt: expiry, remembered: rememberedOrSignature === '1' }
}
