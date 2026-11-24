import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import {
  ADMIN_REMEMBERED_SESSION_MAX_AGE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionTokenValue,
  verifyAdminSessionTokenValue,
} from '../src/lib/admin-session-token'

const SECRET = 'test-session-secret'
const NOW = 1_800_000_000_000

test('a remembered session carries the flag and the seven-day window', () => {
  const token = createAdminSessionTokenValue({
    secret: SECRET,
    now: NOW,
    maxAgeSeconds: ADMIN_REMEMBERED_SESSION_MAX_AGE,
  })

  assert.equal(token.split('.')[1], '1')

  const session = verifyAdminSessionTokenValue({ secret: SECRET, token, now: NOW })
  assert.deepEqual(session, {
    expiresAt: NOW + ADMIN_REMEMBERED_SESSION_MAX_AGE * 1000,
    remembered: true,
  })
})

test('a short session carries no remembered flag', () => {
  const token = createAdminSessionTokenValue({
    secret: SECRET,
    now: NOW,
    maxAgeSeconds: ADMIN_SESSION_MAX_AGE,
  })

  assert.equal(token.split('.')[1], '0')

  const session = verifyAdminSessionTokenValue({ secret: SECRET, token, now: NOW })
  assert.equal(session?.remembered, false)
  assert.equal(session?.expiresAt, NOW + ADMIN_SESSION_MAX_AGE * 1000)
})

test('omitting the lifetime issues a short session, not a remembered one', () => {
  const token = createAdminSessionTokenValue({ secret: SECRET, now: NOW })
  const session = verifyAdminSessionTokenValue({ secret: SECRET, token, now: NOW })

  assert.equal(session?.remembered, false)
})

test('a legacy two-part token still verifies and reads as remembered', () => {
  const expiresAt = NOW + ADMIN_SESSION_MAX_AGE * 1000
  const signature = createHmac('sha256', SECRET).update(String(expiresAt)).digest('hex')
  const legacyToken = `${expiresAt}.${signature}`

  const session = verifyAdminSessionTokenValue({ secret: SECRET, token: legacyToken, now: NOW })
  assert.deepEqual(session, { expiresAt, remembered: true })
})

test('editing the remembered flag invalidates the token', () => {
  const token = createAdminSessionTokenValue({
    secret: SECRET,
    now: NOW,
    maxAgeSeconds: ADMIN_SESSION_MAX_AGE,
  })
  const [expiresAt, , signature] = token.split('.')
  // A short session rewritten to look remembered: signature no longer matches.
  const tampered = `${expiresAt}.1.${signature}`

  assert.equal(verifyAdminSessionTokenValue({ secret: SECRET, token: tampered, now: NOW }), null)
})

test('editing the remembered flag down also invalidates the token', () => {
  const token = createAdminSessionTokenValue({
    secret: SECRET,
    now: NOW,
    maxAgeSeconds: ADMIN_REMEMBERED_SESSION_MAX_AGE,
  })
  const [expiresAt, , signature] = token.split('.')
  const tampered = `${expiresAt}.0.${signature}`

  assert.equal(verifyAdminSessionTokenValue({ secret: SECRET, token: tampered, now: NOW }), null)
})

test('extending the expiry without re-signing invalidates the token', () => {
  const token = createAdminSessionTokenValue({ secret: SECRET, now: NOW })
  const [, remembered, signature] = token.split('.')
  const tampered = `${NOW + 90 * 24 * 60 * 60 * 1000}.${remembered}.${signature}`

  assert.equal(verifyAdminSessionTokenValue({ secret: SECRET, token: tampered, now: NOW }), null)
})

test('an expired token is rejected regardless of its signature', () => {
  const token = createAdminSessionTokenValue({
    secret: SECRET,
    now: NOW,
    maxAgeSeconds: ADMIN_REMEMBERED_SESSION_MAX_AGE,
  })

  assert.equal(
    verifyAdminSessionTokenValue({
      secret: SECRET,
      token,
      now: NOW + ADMIN_REMEMBERED_SESSION_MAX_AGE * 1000 + 1,
    }),
    null,
  )
})

test('a different session secret rejects the token', () => {
  const token = createAdminSessionTokenValue({ secret: SECRET, now: NOW })

  assert.equal(
    verifyAdminSessionTokenValue({ secret: 'another-secret', token, now: NOW }),
    null,
  )
})

test('malformed tokens are rejected rather than guessed at', () => {
  for (const token of ['', 'undefined', 'abc', 'abc.def', 'abc.def.ghi.jkl', '.', '..', '1.1']) {
    assert.equal(
      verifyAdminSessionTokenValue({ secret: SECRET, token, now: NOW }),
      null,
      `unexpectedly accepted ${JSON.stringify(token)}`,
    )
  }

  assert.equal(verifyAdminSessionTokenValue({ secret: SECRET, token: null, now: NOW }), null)
  assert.equal(verifyAdminSessionTokenValue({ secret: '', token: '1.1.x', now: NOW }), null)
})
