import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'
import { proxy } from '../src/proxy'

function request(path: string) {
  return new NextRequest(new URL(path, 'http://localhost'))
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

  it('does not gate public routes', async () => {
    assert.ok(isPassThrough(await proxy(request('/api/newsletter'))))
    assert.ok(isPassThrough(await proxy(request('/about'))))
    assert.ok(isPassThrough(await proxy(request('/'))))
  })

  it('does not gate the former admin path: the studio is another deployment', async () => {
    assert.ok(isPassThrough(await proxy(request('/admin'))))
    assert.ok(isPassThrough(await proxy(request('/admin/inbox?tab=read'))))
  })
})
