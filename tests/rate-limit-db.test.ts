import test from 'node:test'
import assert from 'node:assert/strict'
import { rateLimitKey, retryAfterSeconds } from '../src/lib/rate-limit-db'

test('a rate-limit key is a stable digest, never the identifier itself', () => {
  const key = rateLimitKey('contact', '203.0.113.9')
  assert.equal(key.startsWith('contact:'), true)
  assert.equal(key.includes('203.0.113.9'), false)
  assert.equal(key, rateLimitKey('contact', '203.0.113.9'))
  assert.notEqual(key, rateLimitKey('newsletter', '203.0.113.9'))
  assert.notEqual(key, rateLimitKey('contact', '203.0.113.10'))
  assert.match(key, /^contact:[a-f0-9]{32}$/)
})

test('retry-after counts down to the end of the window', () => {
  const windowMs = 10 * 60 * 1000
  const now = 1_000_000_000_000

  assert.equal(retryAfterSeconds(now - 60_000, windowMs, now), 540)
  assert.equal(retryAfterSeconds(now, windowMs, now), 600)
  // A clock skew that would produce a negative wait still yields at least 1s.
  assert.equal(retryAfterSeconds(now - windowMs - 5_000, windowMs, now), 1)
  assert.equal(retryAfterSeconds(NaN, windowMs, now), 600)
})
