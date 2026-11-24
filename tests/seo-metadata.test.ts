import test from 'node:test'
import assert from 'node:assert/strict'
import { articleMetadata, pageMetadata } from '../src/lib/seo'

test('a case study passes its dates into the Open Graph article tags', () => {
  const metadata = articleMetadata({
    title: 'BuyNepal Marketplace',
    description: 'A commerce case study.',
    path: '/projects/buynepal-marketplace',
    publishedTime: '2025-03-09T00:00:00.000Z',
    modifiedTime: '2026-11-09T01:02:27.424Z',
  })

  const openGraph = metadata.openGraph as Record<string, unknown>
  assert.equal(openGraph.type, 'article')
  assert.equal(openGraph.publishedTime, '2025-03-09T00:00:00.000Z')
  assert.equal(openGraph.modifiedTime, '2026-11-09T01:02:27.424Z')
})

test('a page fallback title reaches the social image alt text', () => {
  const metadata = pageMetadata(undefined, { title: 'Projects & Case Studies' }, '/projects')

  const openGraph = metadata.openGraph as Record<string, unknown>
  const twitter = metadata.twitter as Record<string, unknown>
  const image = (openGraph.images as Array<Record<string, unknown>>)[0]

  assert.equal(openGraph.title, 'Projects & Case Studies')
  assert.equal(image.alt, 'Projects & Case Studies')
  assert.deepEqual((twitter.images as Array<Record<string, unknown>>)[0], image)
})

test('dates are omitted rather than invented when a case study has none', () => {
  const metadata = articleMetadata({ title: 'Study', path: '/projects/study' })

  const openGraph = metadata.openGraph as Record<string, unknown>
  assert.equal('publishedTime' in openGraph, false)
  assert.equal('modifiedTime' in openGraph, false)
})
