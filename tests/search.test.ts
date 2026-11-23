import test from 'node:test'
import assert from 'node:assert/strict'
import {
  scoreDoc,
  searchDocuments,
  snippetFor,
  tokenize,
  type SearchDoc,
} from '../src/lib/search'

const docs: SearchDoc[] = [
  {
    id: 'p1',
    kind: 'project',
    title: 'Portfolio & Studio',
    description: 'A CMS-backed portfolio built with Next.js and Postgres.',
    url: '/projects/portfolio',
    keywords: ['Next.js', 'Postgres'],
  },
  {
    id: 'p2',
    kind: 'project',
    title: 'Snake Trail',
    description: 'A playful canvas experiment.',
    url: '/projects/snake-trail',
  },
  {
    id: 'b1',
    kind: 'journal',
    title: 'Notes on Postgres indexes',
    description: 'Why a partial index made the dashboard fast.',
    url: '/blogs/postgres-indexes',
  },
  {
    id: 'g1',
    kind: 'page',
    title: 'Gallery',
    description: 'Photographs from Kathmandu and Butwal.',
    url: '/about/gallery',
  },
]

test('tokenize keeps words of two or more characters', () => {
  assert.deepEqual(tokenize('Postgres indexes'), ['postgres', 'indexes'])
  assert.deepEqual(tokenize('a b cd'), ['cd'])
  assert.deepEqual(tokenize('Next.js & Postgres!'), ['next', 'js', 'postgres'])
  assert.deepEqual(tokenize('   '), [])
})

test('every query word must appear somewhere', () => {
  const hits = searchDocuments(docs, 'postgres indexes')
  assert.deepEqual(hits.map((hit) => hit.id), ['b1'])

  const either = searchDocuments(docs, 'postgres')
  assert.equal(either.length, 2)
})

test('a title match outranks a description match', () => {
  const hits = searchDocuments(docs, 'postgres')
  assert.equal(hits[0].id, 'b1')
  assert.equal(hits[1].id, 'p1')
})

test('an exact title match wins outright', () => {
  const hits = searchDocuments(docs, 'gallery')
  assert.equal(hits[0].id, 'g1')
  assert.ok(hits[0].score > 10)
})

test('keywords count toward a match', () => {
  const hits = searchDocuments(docs, 'nextjs')
  assert.deepEqual(hits.map((hit) => hit.id), [])
  // "next.js" tokenizes to next + js, both present in the keyword list.
  assert.deepEqual(searchDocuments(docs, 'next js').map((hit) => hit.id), ['p1'])
})

test('case does not matter and results are capped', () => {
  assert.equal(searchDocuments(docs, 'POSTGRES').length, 2)
  const many: SearchDoc[] = Array.from({ length: 50 }, (_, index) => ({
    id: `d${index}`,
    kind: 'page',
    title: `Snippet ${index}`,
    description: 'shared word',
    url: `/x/${index}`,
  }))
  assert.equal(searchDocuments(many, 'shared', { limit: 5 }).length, 5)
})

test('an empty or single-character query returns nothing', () => {
  assert.deepEqual(searchDocuments(docs, ''), [])
  assert.deepEqual(searchDocuments(docs, 'a'), [])
})

test('a snippet shows the matching part of a long description', () => {
  const long = `${'Lead in. '.repeat(20)}Postgres is the interesting part. ${'Tail. '.repeat(20)}`
  const snippet = snippetFor(long, ['postgres'])
  assert.ok(snippet.length <= 175)
  assert.match(snippet, /Postgres is the interesting part/)
})

test('documents with no matching field score zero', () => {
  assert.equal(scoreDoc(docs[1], ['postgres']), 0)
})
