import assert from 'node:assert/strict'
import test from 'node:test'
import { nextPageNav, parentPageNav } from '../src/lib/page-nav'

test('next links follow the route registry order', () => {
  assert.deepEqual(nextPageNav('/about'), { nextHref: '/media', nextLabel: 'Next · Media' })
  assert.deepEqual(nextPageNav('/projects'), { nextHref: '/contact', nextLabel: 'Next · Contact' })
  assert.deepEqual(nextPageNav('/blogs'), { nextHref: '/about/gallery', nextLabel: 'Next · Gallery' })
})

test('the last registry route and unknown routes have no next link', () => {
  assert.equal(nextPageNav('/certificates'), undefined)
  assert.equal(nextPageNav('/not-a-page'), undefined)
})

test('nested routes get their nearest parent as a back link', () => {
  assert.deepEqual(parentPageNav('/about/gallery'), { backHref: '/about', backLabel: 'Back to about' })
  assert.deepEqual(parentPageNav('/media/music'), { backHref: '/media', backLabel: 'Back to media' })
})

test('top-level routes never link home, and unknown parents yield nothing', () => {
  assert.equal(parentPageNav('/about'), undefined)
  assert.equal(parentPageNav('/'), undefined)
  assert.deepEqual(parentPageNav('/projects/unknown'), {
    backHref: '/projects',
    backLabel: 'Back to projects',
  })
})
