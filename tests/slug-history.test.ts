import test from 'node:test'
import assert from 'node:assert/strict'
import {
  followSlugRedirect,
  isSafeSlug,
  normalizeSlugInput,
} from '../src/lib/slug-history'

test('slug input is normalised into something safe for a URL', () => {
  assert.equal(normalizeSlugInput('/Blogs/Old_Name/'), 'old-name')
  assert.equal(normalizeSlugInput('hot takes on css'), 'hot-takes-on-css')
  assert.equal(normalizeSlugInput('  --trailing--  '), 'trailing')
  assert.equal(normalizeSlugInput(undefined), '')
  assert.equal(normalizeSlugInput(42), '')
})

test('only lowercase hyphenated slugs are accepted as-is', () => {
  assert.equal(isSafeSlug('a-b-c'), true)
  assert.equal(isSafeSlug('2026-notes'), true)
  assert.equal(isSafeSlug('Bad Slug'), false)
  assert.equal(isSafeSlug('trailing-'), false)
  assert.equal(isSafeSlug(''), false)
  assert.equal(isSafeSlug('a'.repeat(121)), false)
})

test('a redirect chain lands on its final path', async () => {
  const table: Record<string, string> = {
    '/blogs/a': '/blogs/b',
    '/blogs/b': '/blogs/c',
  }
  const lookup = async (from: string) => table[from] ?? null

  assert.equal(await followSlugRedirect('/blogs/a', lookup), '/blogs/c')
  assert.equal(await followSlugRedirect('/blogs/c', lookup), null)
})

test('a loop stops instead of cycling forever', async () => {
  const table: Record<string, string> = {
    '/blogs/a': '/blogs/b',
    '/blogs/b': '/blogs/a',
  }
  const lookup = async (from: string) => table[from] ?? null

  const result = await followSlugRedirect('/blogs/a', lookup)
  assert.ok(result === '/blogs/b' || result === null)
})

test('an unrelated path has no redirect', async () => {
  assert.equal(await followSlugRedirect('/blogs/kept', async () => null), null)
})
