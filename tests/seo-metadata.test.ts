import test from 'node:test'
import assert from 'node:assert/strict'
import { articleMetadata } from '../src/lib/seo'

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

test('dates are omitted rather than invented when a case study has none', () => {
  const metadata = articleMetadata({ title: 'Study', path: '/projects/study' })

  const openGraph = metadata.openGraph as Record<string, unknown>
  assert.equal('publishedTime' in openGraph, false)
  assert.equal('modifiedTime' in openGraph, false)
})
