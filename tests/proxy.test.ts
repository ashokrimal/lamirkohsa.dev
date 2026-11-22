import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'
import { proxy } from '../src/proxy'

function request(path: string, cookies: Record<string, string> = {}) {
  const nextRequest = new NextRequest(new URL(path, 'http://localhost'))
  for (const [name, value] of Object.entries(cookies)) {
    nextRequest.cookies.set(name, value)
  }
  return nextRequest
}

function isPassThrough(response: Response) {
  return response.headers.get('x-middleware-next') === '1'
}

describe('proxy request gate', () => {
  it('canonicalises the GitHub archive path with a permanent redirect', async () => {
    const response = await proxy(request('/about/GitHub'))
    assert.equal(response.status, 308)
    assert.equal(new URL(response.headers.get('location') ?? '').pathname, '/about/github')
  })

  it('sends signed-out visitors to the sign-in page', async () => {
    const response = await proxy(request('/admin'))
    assert.equal(response.status, 307)
    const location = new URL(response.headers.get('location') ?? '')
    assert.equal(location.pathname, '/admin/sign-in')
    assert.equal(location.searchParams.get('returnTo'), '/admin')
  })

  it('keeps the query string in the returnTo path', async () => {
    const response = await proxy(request('/admin/inbox?tab=read'))
    const location = new URL(response.headers.get('location') ?? '')
    assert.equal(location.searchParams.get('returnTo'), '/admin/inbox?tab=read')
  })

  it('lets the sign-in and sign-out pages through without a session', async () => {
    for (const path of ['/admin/sign-in', '/admin/sign-out']) {
      assert.ok(isPassThrough(await proxy(request(path))), `${path} should pass through`)
    }
  })

  it('lets a visitor with an admin cookie reach the studio shell', async () => {
    assert.ok(isPassThrough(await proxy(request('/admin', { admin_session: 'token' }))))
  })

  it('accepts a Better Auth session cookie', async () => {
    const response = await proxy(
      request('/admin/inbox', { 'better-auth.session_token': 'token' }),
    )
    assert.ok(isPassThrough(response))
  })

  it('does not gate routes outside the admin area', async () => {
    assert.ok(isPassThrough(await proxy(request('/api/newsletter'))))
    assert.ok(isPassThrough(await proxy(request('/about'))))
  })
})
