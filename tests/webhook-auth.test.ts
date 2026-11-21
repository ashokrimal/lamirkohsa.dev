import assert from 'node:assert/strict'
import test from 'node:test'
import { secretsMatch, verifySvixSignature } from '../src/lib/webhook-auth'
import { SECRET, sign } from './svix-sign'

test('secrets compare in constant time and reject length mismatches', () => {
  assert.equal(secretsMatch('abc', 'abc'), true)
  assert.equal(secretsMatch('abc', 'abd'), false)
  assert.equal(secretsMatch('abc', 'abcd'), false)
})

test('a missing secret is a configuration error, not an open door', () => {
  const headers = sign('{}')
  assert.equal(verifySvixSignature({ headers, payload: '{}', secret: undefined }), 'missing-config')
})

test('missing signature headers are unauthorized', () => {
  assert.equal(
    verifySvixSignature({
      headers: { id: null, timestamp: null, signature: null },
      payload: '{}',
      secret: SECRET,
    }),
    'unauthorized',
  )
})

test('a correctly signed body is accepted', () => {
  const payload = JSON.stringify({ type: 'email.received' })
  const headers = sign(payload)
  assert.equal(verifySvixSignature({ headers, payload, secret: SECRET }), 'ok')
})

test('a tampered body or a different secret is unauthorized', () => {
  const headers = sign(JSON.stringify({ type: 'email.received' }))
  assert.equal(verifySvixSignature({ headers, payload: '{"type":"email.sent"}', secret: SECRET }), 'unauthorized')

  const otherSecretHeaders = sign('{}', { secret: `whsec_${Buffer.from('other-key').toString('base64')}` })
  assert.equal(verifySvixSignature({ headers: otherSecretHeaders, payload: '{}', secret: SECRET }), 'unauthorized')
})

test('stale deliveries are rejected outside the five minute window', () => {
  const payload = '{}'
  const old = Math.floor(Date.now() / 1000) - 6 * 60
  const headers = sign(payload, { timestamp: old })
  assert.equal(verifySvixSignature({ headers, payload, secret: SECRET }), 'unauthorized')
})

test('any matching v1 signature in the list is enough', () => {
  const payload = '{}'
  const headers = sign(payload)
  const combined = {
    ...headers,
    signature: `v1,${Buffer.from('wrong').toString('base64')} ${headers.signature}`,
  }
  assert.equal(verifySvixSignature({ headers: combined, payload, secret: SECRET }), 'ok')
})
