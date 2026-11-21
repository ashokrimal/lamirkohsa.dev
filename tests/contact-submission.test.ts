import assert from 'node:assert/strict'
import test from 'node:test'
import { CONTACT_FIELD_LIMITS, planContactSubmission } from '../src/lib/contact-submission'
import { createSlidingWindowLimiter } from '../src/lib/rate-limit'

const valid = {
  name: 'Ada',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'Nice site.',
}

test('a complete submission is trimmed and accepted', () => {
  const decision = planContactSubmission({
    name: '  Ada  ',
    email: ' ada@example.com ',
    subject: ' Hello ',
    message: ' Nice site. ',
    website: '',
  })
  assert.deepEqual(decision, {
    kind: 'accept',
    submission: { name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Nice site.' },
  })
})

test('missing and non-string fields are rejected', () => {
  for (const key of ['name', 'email', 'subject', 'message'] as const) {
    const decision = planContactSubmission({ ...valid, [key]: undefined })
    assert.deepEqual(decision, { kind: 'reject', status: 400, error: 'All fields are required.' })
  }
  assert.equal(planContactSubmission({ ...valid, name: 42 }).kind, 'reject')
})

test('non-object bodies are rejected rather than throwing', () => {
  for (const body of [null, undefined, 'text', [], 7]) {
    assert.deepEqual(planContactSubmission(body), {
      kind: 'reject',
      status: 400,
      error: 'Invalid request.',
    })
  }
})

test('a filled honeypot is dropped silently', () => {
  assert.deepEqual(planContactSubmission({ ...valid, website: 'https://spam.example' }), {
    kind: 'drop',
    reason: 'honeypot',
  })
  assert.equal(planContactSubmission({ ...valid, website: '   ' }).kind, 'accept')
})

test('each field is capped at its limit', () => {
  const limits = CONTACT_FIELD_LIMITS
  const cases: Array<[string, number, string]> = [
    ['name', limits.name, 'Name must be 100 characters or fewer.'],
    ['subject', limits.subject, 'Subject must be 150 characters or fewer.'],
    ['message', limits.message, 'Message must be 5000 characters or fewer.'],
  ]
  for (const [field, limit, error] of cases) {
    assert.deepEqual(planContactSubmission({ ...valid, [field]: 'x'.repeat(limit + 1) }), {
      kind: 'reject',
      status: 400,
      error,
    })
    assert.equal(
      planContactSubmission({ ...valid, [field]: 'x'.repeat(limit) }).kind,
      'accept',
      `${field} should accept exactly the limit`,
    )
  }
})

test('the email length cap is applied before the format check', () => {
  const long = `${'a'.repeat(CONTACT_FIELD_LIMITS.email)}@example.com`
  assert.deepEqual(planContactSubmission({ ...valid, email: long }), {
    kind: 'reject',
    status: 400,
    error: 'Email must be 254 characters or fewer.',
  })
})

test('malformed email addresses are rejected', () => {
  for (const email of ['ada', 'ada@example', 'ada example.com', 'a@b@c.com', '@example.com']) {
    assert.deepEqual(planContactSubmission({ ...valid, email }), {
      kind: 'reject',
      status: 400,
      error: 'Enter a valid email address.',
    })
  }
})

test('the limiter allows the limit and then reports a retry window', () => {
  const limiter = createSlidingWindowLimiter({ limit: 3, windowMs: 10_000 })
  const start = 1_000_000

  assert.equal(limiter.check('ip:1', start).allowed, true)
  assert.equal(limiter.check('ip:1', start + 1_000).allowed, true)
  assert.equal(limiter.check('ip:1', start + 2_000).allowed, true)

  const blocked = limiter.check('ip:1', start + 3_000)
  assert.equal(blocked.allowed, false)
  assert.equal(blocked.retryAfterSeconds, 7)

  // A different key is unaffected, and the window slides.
  assert.equal(limiter.check('ip:2', start + 3_000).allowed, true)
  assert.equal(limiter.check('ip:1', start + 10_001).allowed, true)
})

test('the limiter evicts the oldest keys instead of growing forever', () => {
  const limiter = createSlidingWindowLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 })
  limiter.check('a', 0)
  limiter.check('b', 0)
  limiter.check('c', 0)
  assert.equal(limiter.size(), 2)
  assert.equal(limiter.check('a', 0).allowed, true, 'an evicted key starts fresh')
})
