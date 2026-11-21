import assert from 'node:assert/strict'
import test from 'node:test'
import { planResendWebhook } from '../src/lib/resend-webhook'
import { SECRET, sign } from './svix-sign'

function plan(rawBody: string, options: { secret?: string; signature?: string } = {}) {
  const headers = sign(rawBody)
  return planResendWebhook({
    headers: { ...headers, signature: options.signature ?? headers.signature },
    rawBody,
    secret: 'secret' in options ? options.secret : SECRET,
    payload: JSON.parse(rawBody),
  })
}

const received = JSON.stringify({
  type: 'email.received',
  data: {
    email: {
      id: 'em_123',
      from: 'reader@example.com',
      to: ['lamir@ashokrimal.com.np'],
      subject: 'Hello',
      text: 'Hi there',
      html: '<p>Hi there</p>',
    },
  },
})

test('an unconfigured secret rejects the event instead of trusting it', () => {
  const result = plan(received, { secret: undefined })
  assert.equal(result.status, 503)
  assert.equal(result.insert, undefined)
})

test('a bad signature is unauthorized', () => {
  const result = plan(received, { signature: 'v1,bm90LXRoZS1yaWdodC1zaWduYXR1cmU=' })
  assert.equal(result.status, 401)
})

test('a matching signature maps the event onto an inbox row', () => {
  const result = plan(received)
  assert.equal(result.status, 200)
  assert.deepEqual(result.insert, {
    id: 'em_123',
    fromEmail: 'reader@example.com',
    toEmail: 'lamir@ashokrimal.com.np',
    subject: 'Hello',
    textBody: 'Hi there',
    htmlBody: '<p>Hi there</p>',
  })
})

test('other authorized event types are acknowledged without an insert', () => {
  const result = plan(JSON.stringify({ type: 'email.delivered', data: { email_id: 'em_123' } }))
  assert.equal(result.status, 200)
  assert.equal(result.insert, undefined)
})

test('malformed or incomplete events are rejected', () => {
  assert.equal(plan('null').status, 400)
  assert.equal(plan(JSON.stringify({ type: 'email.received' })).status, 400)
  assert.equal(
    plan(JSON.stringify({ type: 'email.received', data: { email: { from: 'a@b.c', to: 'd@e.f' } } })).status,
    400,
  )
})

test('a missing subject still stores a readable row', () => {
  const result = plan(
    JSON.stringify({ type: 'email.received', data: { email: { id: 'em_2', from: 'a@b.c', to: 'd@e.f' } } }),
  )
  assert.equal(result.insert?.subject, '(no subject)')
})
