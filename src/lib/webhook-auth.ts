import { createHmac, timingSafeEqual } from 'node:crypto'

export type WebhookAuthResult = 'ok' | 'missing-config' | 'unauthorized'

/** Constant-time compare that tolerates different lengths. */
export function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Resend delivers webhooks through Svix, which rejects anything older than this. */
export const SVIX_TOLERANCE_SECONDS = 5 * 60

export interface SvixHeaders {
  id: string | null | undefined
  timestamp: string | null | undefined
  signature: string | null | undefined
}

/**
 * Verify a Resend webhook signature the way Svix defines it: HMAC-SHA256 over
 * `${svix-id}.${svix-timestamp}.${raw body}`, keyed with the base64 body of the
 * `whsec_` signing secret, compared against any `v1,` value in the
 * space-delimited `svix-signature` header. The raw body must be passed through
 * untouched — parsing and re-serialising it breaks the signature.
 *
 * Fails closed: no configured secret means the endpoint cannot tell a real
 * event from anyone else's POST, so it reports a configuration error instead of
 * accepting the write.
 */
export function verifySvixSignature({
  headers,
  payload,
  secret,
  now = Date.now(),
}: {
  headers: SvixHeaders
  payload: string
  secret: string | undefined
  now?: number
}): WebhookAuthResult {
  if (!secret) return 'missing-config'

  const id = headers.id
  const timestamp = headers.timestamp
  const signature = headers.signature
  if (!id || !timestamp || !signature) return 'unauthorized'

  const sentAt = Number(timestamp)
  if (!Number.isFinite(sentAt)) return 'unauthorized'
  if (Math.abs(now / 1000 - sentAt) > SVIX_TOLERANCE_SECONDS) return 'unauthorized'

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${payload}`).digest('base64')

  for (const entry of signature.split(' ')) {
    const [version, value] = entry.split(',')
    if (version !== 'v1' || !value) continue
    if (secretsMatch(value, expected)) return 'ok'
  }
  return 'unauthorized'
}
