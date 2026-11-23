import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildReferenceCorpus,
  findOrphanedBlobs,
  selectDeletableBlobs,
  type StoredBlob,
} from '../src/lib/blob-audit'

const blobs: StoredBlob[] = [
  {
    pathname: 'site/admin/1/cover.png',
    url: 'https://store.public.blob.vercel-storage.com/site/admin/1/cover.png',
    size: 1000,
    uploadedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    pathname: 'site/admin/1/old-gallery.jpg',
    url: 'https://store.public.blob.vercel-storage.com/site/admin/1/old-gallery.jpg',
    size: 500,
    uploadedAt: '2026-04-01T00:00:00.000Z',
  },
]

test('a file named in the content is kept, an unmentioned one is orphaned', () => {
  const corpus = buildReferenceCorpus([
    { imageUrl: 'https://store.public.blob.vercel-storage.com/site/admin/1/cover.png' },
  ])
  const audit = findOrphanedBlobs(blobs, corpus)

  assert.deepEqual(audit.referenced, ['site/admin/1/cover.png'])
  assert.deepEqual(
    audit.orphaned.map((blob) => blob.pathname),
    ['site/admin/1/old-gallery.jpg'],
  )
  assert.equal(audit.totalBytes, 1500)
  assert.equal(audit.orphanedBytes, 500)
})

test('next/image query strings do not hide a reference', () => {
  const corpus = buildReferenceCorpus([
    { src: '/site/admin/1/cover.png?v=2&w=640' },
  ])
  const audit = findOrphanedBlobs(blobs, corpus)
  assert.equal(audit.referenced.includes('site/admin/1/cover.png'), true)
})

test('nothing referenced means everything is orphaned', () => {
  const audit = findOrphanedBlobs(blobs, buildReferenceCorpus([{}, '']))
  assert.equal(audit.orphaned.length, 2)
  assert.equal(audit.referenced.length, 0)
})

test('a deletion request can only remove what the server found orphaned', () => {
  const audit = findOrphanedBlobs(blobs, buildReferenceCorpus([{ imageUrl: blobs[0].url }]))

  const deletable = selectDeletableBlobs(
    ['site/admin/1/old-gallery.jpg', 'site/admin/1/cover.png', '../../etc/passwd'],
    audit.orphaned,
  )

  assert.deepEqual(deletable.map((blob) => blob.pathname), ['site/admin/1/old-gallery.jpg'])
})

test('duplicates and oversized requests are bounded', () => {
  const many: StoredBlob[] = Array.from({ length: 5 }, (_, index) => ({
    pathname: `site/${index}.png`,
    url: `https://store.public.blob.vercel-storage.com/site/${index}.png`,
    size: 1,
    uploadedAt: '2026-05-01T00:00:00.000Z',
  }))

  const chosen = selectDeletableBlobs(
    ['site/0.png', 'site/0.png', 'site/1.png', 'site/2.png'],
    many,
    2,
  )
  assert.deepEqual(chosen.map((blob) => blob.pathname), ['site/0.png', 'site/1.png'])
})

test('the corpus ignores query strings in stored values', () => {
  const corpus = buildReferenceCorpus([{ image: 'https://x.test/a.png?token=abc' }])
  assert.equal(corpus.includes('token=abc'), false)
  assert.equal(corpus.includes('https://x.test/a.png'), true)
})
