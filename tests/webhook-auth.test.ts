import assert from 'node:assert/strict'
import { test } from 'node:test'
import { secretsMatch, verifyWebhookSecret } from '../src/lib/webhook-auth'

test('secrets compare in constant time and reject length mismatches', () => {
  assert.equal(secretsMatch('abc', 'abc'), true)
  assert.equal(secretsMatch('abc', 'abd'), false)
  assert.equal(secretsMatch('ab', 'abc'), false)
  assert.equal(secretsMatch('', ''), true)
})

test('a missing secret is a configuration error, not an open door', () => {
  assert.equal(verifyWebhookSecret('anything', undefined), 'missing-config')
  assert.equal(verifyWebhookSecret('anything', ''), 'missing-config')
})

test('only the configured secret is accepted', () => {
  assert.equal(verifyWebhookSecret('s3cret', 's3cret'), 'ok')
  assert.equal(verifyWebhookSecret('other', 's3cret'), 'unauthorized')
  assert.equal(verifyWebhookSecret(null, 's3cret'), 'unauthorized')
})
