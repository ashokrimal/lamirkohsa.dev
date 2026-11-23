import test from 'node:test'
import assert from 'node:assert/strict'
import {
  exceedsClientErrorBudget,
  parseClientError,
  summarizeClientError,
} from '../src/lib/client-error-report'

test('a well-formed report is accepted and trimmed', () => {
  const parsed = parseClientError({
    kind: 'error',
    message: '  Cannot read properties of undefined  ',
    stack: 'Error: boom\n  at foo',
    source: 'https://www.ashokrimal.com.np/_next/static/chunk.js',
  })

  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  assert.equal(parsed.report.message, 'Cannot read properties of undefined')
  assert.equal(parsed.report.kind, 'error')
  assert.match(parsed.report.stack ?? '', /at foo/)
})

test('the query string is dropped so tokens never reach the server', () => {
  const parsed = parseClientError({
    message: 'boom',
    url: 'https://www.ashokrimal.com.np/admin/sign-in?token=secret-value&returnTo=/admin',
  })

  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  assert.equal(parsed.report.url, 'https://www.ashokrimal.com.np/admin/sign-in')
  assert.equal(JSON.stringify(parsed.report).includes('secret-value'), false)
})

test('long fields are capped instead of stored whole', () => {
  const parsed = parseClientError({ message: 'x'.repeat(5_000), stack: 'y'.repeat(50_000) })
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  assert.equal(parsed.report.message.length, 500)
  assert.equal(parsed.report.stack?.length, 4_000)
})

test('browser-extension errors are ignored', () => {
  for (const source of [
    'chrome-extension://abc/inject.js',
    'moz-extension://abc/inject.js',
    'safari-extension://abc/inject.js',
  ]) {
    const parsed = parseClientError({ message: 'extension blew up', source })
    assert.equal(parsed.ok, false)
  }
})

test('a non-object or empty payload is rejected', () => {
  assert.equal(parseClientError(null).ok, false)
  assert.equal(parseClientError('message').ok, false)
  assert.equal(parseClientError([]).ok, false)
  assert.equal(parseClientError({ message: '   ' }).ok, false)
})

test('an unknown kind falls back to error', () => {
  const parsed = parseClientError({ message: 'boom', kind: 'something-else' })
  assert.equal(parsed.ok, true)
  if (!parsed.ok) return
  assert.equal(parsed.report.kind, 'error')
})

test('the log line names the kind and the page, not the query', () => {
  const line = summarizeClientError({
    kind: 'boundary',
    message: 'Route error',
    url: '/projects/foo',
  })
  assert.equal(line, '[client:boundary] Route error at /projects/foo')
})

test('the body budget matches the route limit', () => {
  assert.equal(exceedsClientErrorBudget(1_000), false)
  assert.equal(exceedsClientErrorBudget(9_000), true)
  assert.equal(exceedsClientErrorBudget(Number.NaN), false)
})
