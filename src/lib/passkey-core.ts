import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * The parts of passkey support that are pure enough to test.
 *
 * A passkey (WebAuthn credential) makes the studio's second factor something the
 * owner already has: the fingerprint, face or PIN sensor on their own device.
 * The protocol needs a random challenge that the browser signs, and that
 * challenge has to survive a round trip through the browser — so it is stored in
 * a short-lived, signed, HttpOnly cookie rather than in memory, which a
 * serverless instance would forget between the two requests.
 *
 * This module holds the challenge format, the relying-party derivation and small
 * input guards. Nothing here touches Next.js or the database.
 */

export type PasskeyPurpose = 'register' | 'login'

/** Cookie that carries the challenge between the options and verify calls. */
export const PASSKEY_CHALLENGE_COOKIE = 'admin_passkey_challenge'

/** Long enough for a slow fingerprint prompt, short enough to be single-use. */
export const PASSKEY_CHALLENGE_TTL_MS = 5 * 60 * 1000

export const PASSKEY_COOKIE_PATH = '/api/admin/passkey'

/**
 * The relying-party ID, which is the domain a credential is bound to.
 *
 * A credential created for `www.ashokrimal.com.np` cannot be used on
 * `cms.ashokrimal.com.np`, so the owner would need a separate passkey per host.
 * WebAuthn allows any subdomain of the RP ID, so the default is the registrable
 * domain — every host this site is served from shares one credential.
 */
export function registrableRpId(hostname: string): string {
  const host = hostname.trim().toLowerCase().replace(/:\d+$/, '')
  if (!host) return ''
  if (host === 'localhost' || host === '[::1]' || host === '::1') return 'localhost'
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host

  const labels = host.split('.')
  if (labels.length <= 2) return host
  // Handles both `ashokrimal.com.np` (3 labels) and `cms.ashokrimal.com.np`.
  if (labels.length >= 3 && labels[labels.length - 2] === 'com' && labels.at(-1)?.length === 2) {
    return labels.slice(-3).join('.')
  }
  if (labels.length >= 3 && ['co', 'org', 'net', 'gov', 'edu', 'ac'].includes(labels.at(-2) ?? '')) {
    return labels.slice(-3).join('.')
  }
  // Everything else, including `preview.vercel.app`, keeps its own host: a
  // wildcard parent would let any Vercel tenant share the scope.
  return labels.length === 3 && labels.at(-1) === 'app' && labels.at(-2) === 'vercel'
    ? host
    : labels.slice(-2).join('.')
}

/** A short, human label for the device that enrolled a credential. */
export function safeDeviceLabel(value: unknown, fallback = 'This device'): string {
  if (typeof value !== 'string') return fallback
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned ? cleaned.slice(0, 60) : fallback
}

function mac(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

/**
 * Produces `<purpose>.<expiresAt>.<challenge>.<signature>`.
 *
 * The purpose is inside the signed payload, so a challenge minted for a
 * registration can never be replayed against the sign-in endpoint.
 */
export function signPasskeyChallenge({
  challenge,
  purpose,
  secret,
  now = Date.now(),
  ttlMs = PASSKEY_CHALLENGE_TTL_MS,
}: {
  challenge: string
  purpose: PasskeyPurpose
  secret: string
  now?: number
  ttlMs?: number
}): string {
  if (!challenge || !secret) throw new Error('A challenge and a secret are required.')
  const expiresAt = now + ttlMs
  const payload = `${purpose}.${expiresAt}.${challenge}`
  return `${payload}.${mac(payload, secret)}`
}

/** The challenge inside a valid cookie value, or null when it is not usable. */
export function readPasskeyChallenge({
  token,
  purpose,
  secret,
  now = Date.now(),
}: {
  token: string | undefined
  purpose: PasskeyPurpose
  secret: string
  now?: number
}): string | null {
  if (!token || !secret) return null

  const parts = token.split('.')
  if (parts.length !== 4) return null
  const [tokenPurpose, expiresAt, challenge, signature] = parts
  if (tokenPurpose !== purpose || !challenge) return null

  const expiry = Number(expiresAt)
  if (!Number.isFinite(expiry) || expiry < now) return null

  const expected = mac(`${tokenPurpose}.${expiry}.${challenge}`, secret)
  const given = Buffer.from(signature)
  const wanted = Buffer.from(expected)
  if (given.length !== wanted.length) return null
  return timingSafeEqual(given, wanted) ? challenge : null
}

/** Options for the browser; the cookie flags are shared by both endpoints. */
export function passkeyChallengeCookie(value: string, maxAgeSeconds = PASSKEY_CHALLENGE_TTL_MS / 1000) {
  return {
    name: PASSKEY_CHALLENGE_COOKIE,
    value,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: PASSKEY_COOKIE_PATH,
    maxAge: maxAgeSeconds,
  }
}

export function clearedPasskeyChallengeCookie() {
  return passkeyChallengeCookie('', 0)
}
