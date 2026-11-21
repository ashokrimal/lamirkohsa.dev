/**
 * Small in-memory sliding-window limiter for anonymous endpoints.
 *
 * Serverless instances are isolated, so this bounds bursts per instance rather
 * than globally. It is paired with a durable per-sender check in the contact
 * route; treat this as the cheap first gate, not the only one.
 */

export type RateLimitDecision = {
  allowed: boolean
  /** Seconds until the caller may retry; 0 when allowed. */
  retryAfterSeconds: number
}

export type SlidingWindowLimiter = {
  check(key: string, now?: number): RateLimitDecision
  reset(): void
  size(): number
}

type LimiterOptions = {
  /** Requests allowed per key inside the window. */
  limit: number
  windowMs: number
  /** Keys retained before the oldest are evicted. */
  maxKeys?: number
}

export function createSlidingWindowLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: LimiterOptions): SlidingWindowLimiter {
  const hits = new Map<string, number[]>()

  function evictOldest() {
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next()
      if (oldest.done) return
      hits.delete(oldest.value)
    }
  }

  return {
    check(key, now = Date.now()) {
      const cutoff = now - windowMs
      const recent = (hits.get(key) ?? []).filter((at) => at > cutoff)

      if (recent.length >= limit) {
        hits.set(key, recent)
        const waitMs = recent[0] + windowMs - now
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)) }
      }

      recent.push(now)
      hits.set(key, recent)
      evictOldest()
      return { allowed: true, retryAfterSeconds: 0 }
    },
    reset() {
      hits.clear()
    },
    size() {
      return hits.size
    },
  }
}
