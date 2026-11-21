import { timingSafeEqual } from 'node:crypto'

export type WebhookAuthResult = 'ok' | 'missing-config' | 'unauthorized'

/** Constant-time compare that tolerates different lengths. */
export function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Webhook secrets fail closed: with no secret configured the endpoint cannot
 * tell a real event from anyone else's POST, so it rejects instead of accepting
 * unauthenticated writes into the inbox.
 */
export function verifyWebhookSecret(
  provided: string | null | undefined,
  secret: string | undefined,
): WebhookAuthResult {
  if (!secret) return 'missing-config'
  if (!provided) return 'unauthorized'
  return secretsMatch(provided, secret) ? 'ok' : 'unauthorized'
}
