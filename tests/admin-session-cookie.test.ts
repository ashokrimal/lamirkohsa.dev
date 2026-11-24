import test from 'node:test'
import assert from 'node:assert/strict'
import { ADMIN_SESSION_COOKIE_NAME, adminSessionCookie } from '../src/lib/admin-session-cookie'
import {
  ADMIN_REMEMBERED_SESSION_MAX_AGE,
  ADMIN_SESSION_MAX_AGE,
} from '../src/lib/admin-session-token'

test('a remembered session writes a persistent cookie', () => {
  const cookie = adminSessionCookie('token', {
    maxAgeSeconds: ADMIN_REMEMBERED_SESSION_MAX_AGE,
    secure: true,
  })

  assert.equal(cookie.name, ADMIN_SESSION_COOKIE_NAME)
  assert.equal(cookie.value, 'token')
  assert.equal(cookie.maxAge, 60 * 60 * 24 * 7)
  assert.equal(cookie.httpOnly, true)
  assert.equal(cookie.sameSite, 'lax')
  assert.equal(cookie.path, '/')
  assert.equal(cookie.secure, true)
})

test('a short session omits maxAge, so the browser drops it on close', () => {
  const cookie = adminSessionCookie('token', { secure: true })

  assert.equal('maxAge' in cookie, false)
  assert.equal(cookie.maxAge, undefined)
})

test('signing out deletes the cookie instead of writing a new session', () => {
  const cookie = adminSessionCookie('', { maxAgeSeconds: 0, secure: true })

  assert.equal(cookie.value, '')
  assert.equal(cookie.maxAge, 0)
})

test('the cookie is not marked secure outside production', () => {
  assert.equal(adminSessionCookie('token').secure, false)
  assert.equal(adminSessionCookie('token', { secure: false }).secure, false)
})

test('the session window is longer than the short one', () => {
  assert.ok(ADMIN_REMEMBERED_SESSION_MAX_AGE > ADMIN_SESSION_MAX_AGE)
})
