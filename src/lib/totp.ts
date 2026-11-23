import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * RFC 6238 time-based one-time passwords.
 *
 * The owner can protect the studio sign-in with any authenticator app: set
 * `ADMIN_TOTP_SECRET` to the app's base32 secret and the password alone stops
 * being enough. The implementation is deliberately small — HMAC-SHA1, a 30
 * second step, six digits, one step of clock drift — and depends only on
 * `node:crypto`, so there is no extra dependency to keep current.
 *
 * Nothing here reads the environment; the caller passes the secret in, which is
 * what makes the numbers testable against the RFC's published vectors.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export const TOTP_STEP_SECONDS = 30
export const TOTP_DIGITS = 6
/** One step either side tolerates a phone and a server whose clocks differ. */
export const TOTP_WINDOW = 1

/** Decodes a base32 secret, ignoring spaces, padding and case. */
export function decodeBase32(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '')
  if (!clean) return Buffer.alloc(0)

  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (const character of clean) {
    const index = BASE32_ALPHABET.indexOf(character)
    if (index === -1) throw new Error('That secret is not valid base32.')
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

/** RFC 4226 HOTP for a counter, as a zero-padded digit string. */
export function hotp(secret: Buffer, counter: number, digits = TOTP_DIGITS): string {
  const buffer = Buffer.alloc(8)
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0)
  buffer.writeUInt32BE(counter >>> 0, 4)

  const digest = createHmac('sha1', secret).update(buffer).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)

  return String(binary % 10 ** digits).padStart(digits, '0')
}

export function counterFor(timeMs: number, stepSeconds = TOTP_STEP_SECONDS): number {
  return Math.floor(timeMs / 1000 / stepSeconds)
}

export function generateTotp(
  secret: string | Buffer,
  { now = Date.now(), step = TOTP_STEP_SECONDS, digits = TOTP_DIGITS } = {},
): string {
  const key = typeof secret === 'string' ? decodeBase32(secret) : secret
  return hotp(key, counterFor(now, step), digits)
}

/**
 * True when `code` is the current code, the one before it or the one after.
 * The comparison is constant-time and the code must be exactly `digits` long.
 */
export function verifyTotp(
  secret: string,
  code: string,
  {
    now = Date.now(),
    step = TOTP_STEP_SECONDS,
    digits = TOTP_DIGITS,
    window = TOTP_WINDOW,
  } = {},
): boolean {
  const submitted = code.replace(/\s+/g, '')
  if (!new RegExp(`^\\d{${digits}}$`).test(submitted)) return false

  let key: Buffer
  try {
    key = decodeBase32(secret)
  } catch {
    return false
  }
  if (key.length < 10) return false

  const counter = counterFor(now, step)
  const given = Buffer.from(submitted)
  let matched = false
  for (let drift = -window; drift <= window; drift += 1) {
    const candidate = hotp(key, counter + drift, digits)
    // Every candidate is compared, so a match does not short-circuit the loop.
    if (timingSafeEqual(Buffer.from(candidate), given)) matched = true
  }
  return matched
}

/** An `otpauth://` URI for the authenticator app's manual entry. */
export function totpUri(secret: string, account: string, issuer = 'Ashok Rimal Studio'): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({
    secret: secret.replace(/[\s=-]/g, '').toUpperCase(),
    issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
