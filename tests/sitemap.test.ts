import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CASE_STUDY_REDIRECT_SOURCES,
  isSitemapPageSlug,
  newestOf,
  normalizeSitemapSlug,
  toLastModified,
} from '../src/lib/sitemap'

test('redirecting case study routes never enter the sitemap', () => {
  assert.deepEqual([...CASE_STUDY_REDIRECT_SOURCES], ['/work'])
  assert.equal(isSitemapPageSlug('/work'), false)
  assert.equal(isSitemapPageSlug('work'), false, 'a missing leading slash is normalized')
  assert.equal(isSitemapPageSlug('/projects'), false, 'the canonical index has its own entry')
})

test('structural and unlisted routes are excluded', () => {
  for (const route of ['/', '/about', '/about/gallery', '/media/music', '/contact', '/projects']) {
    assert.equal(isSitemapPageSlug(route), false, `${route} is covered elsewhere`)
  }
  for (const route of ['/admin', '/sign-in', '/reset-password', '/classic']) {
    assert.equal(isSitemapPageSlug(route), false, `${route} must not be indexable`)
  }
})

test('dynamic collections are listed from their records, not page rows', () => {
  assert.equal(isSitemapPageSlug('/projects/lamirkohsa'), false)
  assert.equal(isSitemapPageSlug('/blogs/hello'), false)
  assert.equal(isSitemapPageSlug('/about/team'), false)
})

test('studio-authored pages outside the registry are listed', () => {
  assert.equal(isSitemapPageSlug('/privacy'), true)
  assert.equal(isSitemapPageSlug('privacy'), true)
  assert.equal(isSitemapPageSlug('/now/'), true)
  assert.equal(normalizeSitemapSlug('/privacy/'), '/privacy')
  assert.equal(normalizeSitemapSlug(''), '/')
})

test('lastModified only accepts real timestamps', () => {
  const iso = '2025-02-03T04:05:06.000Z'
  assert.equal(toLastModified(iso)?.toISOString(), iso)

  const date = new Date(iso)
  assert.equal(toLastModified(date), date)

  assert.equal(toLastModified(undefined), undefined)
  assert.equal(toLastModified(null), undefined)
  assert.equal(toLastModified(''), undefined)
  assert.equal(toLastModified('not a date'), undefined)
  assert.equal(toLastModified(new Date('nope')), undefined)
  assert.equal(toLastModified(1_700_000_000), undefined, 'epoch numbers are not trusted')
})

test('newestOf picks the most recent usable timestamp', () => {
  assert.equal(
    newestOf('2024-01-01T00:00:00.000Z', '2025-06-01T00:00:00.000Z', undefined)?.toISOString(),
    '2025-06-01T00:00:00.000Z',
  )
  assert.equal(newestOf(undefined, ''), undefined)
})
