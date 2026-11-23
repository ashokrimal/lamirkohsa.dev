import test from 'node:test'
import assert from 'node:assert/strict'
import {
  counterFor,
  decodeBase32,
  generateTotp,
  hotp,
  totpUri,
  verifyTotp,
} from '../src/lib/totp'

/** RFC 6238 test secret: the ASCII string "12345678901234567890". */
const RFC_SECRET_BASE32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'

test('base32 decoding matches the RFC 6238 test secret', () => {
  assert.equal(decodeBase32(RFC_SECRET_BASE32).toString('utf8'), '12345678901234567890')
  assert.equal(decodeBase32('gezd gnbv gy3t qojq').toString('utf8').slice(0, 5), '12345')
  assert.equal(decodeBase32('').length, 0)
  assert.throws(() => decodeBase32('not-base32!'))
})

test('the published RFC 6238 vectors are reproduced', () => {
  // Times from the RFC's appendix B, with the 6-digit truncation this build uses.
  const vectors: Array<[number, string]> = [
    [59, '287082'],
    [1111111109, '081804'],
    [1111111111, '050471'],
    [1234567890, '005924'],
    [2000000000, '279037'],
  ]

  for (const [seconds, expected] of vectors) {
    assert.equal(generateTotp(RFC_SECRET_BASE32, { now: seconds * 1000 }), expected)
  }
})

test('HOTP counts steps, not seconds', () => {
  assert.equal(counterFor(59_000), 1)
  assert.equal(counterFor(60_000), 2)
  const key = decodeBase32(RFC_SECRET_BASE32)
  assert.equal(hotp(key, 0), '755224')
  assert.equal(hotp(key, 1), '287082')
})

test('a code is accepted for one step either side of now', () => {
  const now = 1_700_000_000_000
  const current = generateTotp(RFC_SECRET_BASE32, { now })
  const previous = generateTotp(RFC_SECRET_BASE32, { now: now - 30_000 })
  const next = generateTotp(RFC_SECRET_BASE32, { now: now + 30_000 })
  const tooOld = generateTotp(RFC_SECRET_BASE32, { now: now - 120_000 })

  assert.equal(verifyTotp(RFC_SECRET_BASE32, current, { now }), true)
  assert.equal(verifyTotp(RFC_SECRET_BASE32, previous, { now }), true)
  assert.equal(verifyTotp(RFC_SECRET_BASE32, next, { now }), true)
  assert.equal(verifyTotp(RFC_SECRET_BASE32, tooOld, { now }), false)
})

test('malformed codes and secrets are rejected, never thrown', () => {
  const now = 1_700_000_000_000
  assert.equal(verifyTotp(RFC_SECRET_BASE32, '', { now }), false)
  assert.equal(verifyTotp(RFC_SECRET_BASE32, '12345', { now }), false)
  assert.equal(verifyTotp(RFC_SECRET_BASE32, 'abcdef', { now }), false)
  assert.equal(verifyTotp('not-base32!', '123456', { now }), false)
  // A secret shorter than 80 bits cannot produce a trustworthy code.
  assert.equal(verifyTotp('MFRGGZDF', '123456', { now }), false)
})

test('the enrolment URI carries the secret and issuer', () => {
  const uri = totpUri(RFC_SECRET_BASE32, 'owner@example.com')
  assert.match(uri, /^otpauth:\/\/totp\//)
  assert.match(uri, /secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ/)
  assert.match(uri, /issuer=Ashok\+Rimal\+Studio/)
  assert.match(uri, /digits=6/)
  assert.match(uri, /period=30/)
})
