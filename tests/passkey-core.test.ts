import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearedPasskeyChallengeCookie,
  passkeyChallengeCookie,
  readPasskeyChallenge,
  registrableRpId,
  safeDeviceLabel,
  signPasskeyChallenge,
} from '../src/lib/passkey-core'

const SECRET = 'test-secret-not-a-real-one'

test('a signed challenge round-trips for its own purpose', () => {
  const token = signPasskeyChallenge({ challenge: 'abc123', purpose: 'login', secret: SECRET })
  assert.equal(readPasskeyChallenge({ token, purpose: 'login', secret: SECRET }), 'abc123')
})

test('a challenge cannot be reused for the other purpose', () => {
  const registerToken = signPasskeyChallenge({
    challenge: 'abc123',
    purpose: 'register',
    secret: SECRET,
  })
  assert.equal(readPasskeyChallenge({ token: registerToken, purpose: 'login', secret: SECRET }), null)
})

test('a tampered challenge or signature is rejected', () => {
  const token = signPasskeyChallenge({ challenge: 'abc123', purpose: 'login', secret: SECRET })
  const [purpose, expiresAt, , signature] = token.split('.')

  const swapped = [purpose, expiresAt, 'different', signature].join('.')
  assert.equal(readPasskeyChallenge({ token: swapped, purpose: 'login', secret: SECRET }), null)

  const forged = [purpose, expiresAt, 'abc123', 'x'.repeat(signature.length)].join('.')
  assert.equal(readPasskeyChallenge({ token: forged, purpose: 'login', secret: SECRET }), null)

  const extended = [purpose, String(Number(expiresAt) + 60_000), 'abc123', signature].join('.')
  assert.equal(readPasskeyChallenge({ token: extended, purpose: 'login', secret: SECRET }), null)
})

test('a challenge signed with another secret is rejected', () => {
  const token = signPasskeyChallenge({ challenge: 'abc123', purpose: 'login', secret: 'other' })
  assert.equal(readPasskeyChallenge({ token, purpose: 'login', secret: SECRET }), null)
})

test('an expired challenge is rejected', () => {
  const issuedAt = 1_700_000_000_000
  const token = signPasskeyChallenge({
    challenge: 'abc123',
    purpose: 'login',
    secret: SECRET,
    now: issuedAt,
    ttlMs: 60_000,
  })

  assert.equal(
    readPasskeyChallenge({ token, purpose: 'login', secret: SECRET, now: issuedAt + 30_000 }),
    'abc123',
  )
  assert.equal(
    readPasskeyChallenge({ token, purpose: 'login', secret: SECRET, now: issuedAt + 61_000 }),
    null,
  )
})

test('malformed tokens and missing secrets never throw', () => {
  assert.equal(readPasskeyChallenge({ token: undefined, purpose: 'login', secret: SECRET }), null)
  assert.equal(readPasskeyChallenge({ token: '', purpose: 'login', secret: SECRET }), null)
  assert.equal(readPasskeyChallenge({ token: 'a.b.c', purpose: 'login', secret: SECRET }), null)
  assert.equal(
    readPasskeyChallenge({ token: 'a.b.c.d.e', purpose: 'login', secret: SECRET }),
    null,
  )
  assert.equal(readPasskeyChallenge({ token: 'login.abc.def.ghi', purpose: 'login', secret: SECRET }), null)
})

test('the relying party is the registrable domain, so one passkey covers every host', () => {
  assert.equal(registrableRpId('www.ashokrimal.com.np'), 'ashokrimal.com.np')
  assert.equal(registrableRpId('ashokrimal.com.np'), 'ashokrimal.com.np')
  assert.equal(registrableRpId('cms.ashokrimal.com.np'), 'ashokrimal.com.np')
  assert.equal(registrableRpId('WWW.ASHOKRIMAL.COM.NP:443'), 'ashokrimal.com.np')
  assert.equal(registrableRpId('localhost:3000'), 'localhost')
  assert.equal(registrableRpId('127.0.0.1'), '127.0.0.1')
  assert.equal(registrableRpId('example.com'), 'example.com')
  assert.equal(registrableRpId('shop.example.co.uk'), 'example.co.uk')
})

test('a preview host keeps its own scope instead of a shared parent', () => {
  assert.equal(registrableRpId('lamirkohsa-preview.vercel.app'), 'lamirkohsa-preview.vercel.app')
  assert.equal(registrableRpId('a.b.example.org'), 'example.org')
})

test('device labels are trimmed, capped and defaulted', () => {
  assert.equal(safeDeviceLabel('  iPhone 15  '), 'iPhone 15')
  assert.equal(safeDeviceLabel('x'.repeat(200)).length, 60)
  assert.equal(safeDeviceLabel(''), 'This device')
  assert.equal(safeDeviceLabel(42), 'This device')
  assert.equal(safeDeviceLabel('bad\u0000label'), 'bad label')
  assert.equal(safeDeviceLabel(undefined, 'MacBook'), 'MacBook')
})

test('the cookie is HttpOnly, scoped to the passkey API and can be cleared', () => {
  const cookie = passkeyChallengeCookie('token')
  assert.equal(cookie.name, 'admin_passkey_challenge')
  assert.equal(cookie.httpOnly, true)
  assert.equal(cookie.sameSite, 'lax')
  assert.equal(cookie.path, '/api/admin/passkey')
  assert.equal(cookie.maxAge, 300)

  const cleared = clearedPasskeyChallengeCookie()
  assert.equal(cleared.value, '')
  assert.equal(cleared.maxAge, 0)
})
