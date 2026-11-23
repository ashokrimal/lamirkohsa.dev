import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  DEFAULT_INDEXNOW_KEY,
  canonicalHost,
  chunkUrls,
  indexNowKeyLocation,
  indexNowPayload,
  normalizeIndexNowUrls,
} from '../src/lib/indexnow'

test('the default key has the required shape and its key file exists', () => {
  assert.match(DEFAULT_INDEXNOW_KEY, /^[A-Za-z0-9-]{8,128}$/)
  assert.equal(indexNowKeyLocation(), `/${DEFAULT_INDEXNOW_KEY}.txt`)

  const file = readFileSync(join(process.cwd(), 'public', `${DEFAULT_INDEXNOW_KEY}.txt`), 'utf8')
  assert.equal(file.trim(), DEFAULT_INDEXNOW_KEY)
})

test('only absolute http(s) URLs survive, de-duplicated and hash-free', () => {
  assert.deepEqual(
    normalizeIndexNowUrls([
      'https://www.ashokrimal.com.np/blogs/one#section',
      'https://www.ashokrimal.com.np/blogs/one',
      'http://www.ashokrimal.com.np/about',
      '/relative/path',
      'mailto:owner@example.com',
      'not a url',
      '',
    ]),
    ['https://www.ashokrimal.com.np/blogs/one', 'http://www.ashokrimal.com.np/about'],
  )
})

test('the payload names the host, the key and its location', () => {
  const payload = indexNowPayload([
    'https://www.ashokrimal.com.np/blogs/one',
    'https://www.ashokrimal.com.np/projects/two',
  ])

  assert.ok(payload)
  assert.equal(payload.host, 'www.ashokrimal.com.np')
  assert.equal(payload.key, DEFAULT_INDEXNOW_KEY)
  assert.equal(
    payload.keyLocation,
    `https://www.ashokrimal.com.np/${DEFAULT_INDEXNOW_KEY}.txt`,
  )
  assert.equal(payload.urlList.length, 2)
})

test('URLs from another host are dropped, so a key cannot vouch for them', () => {
  const payload = indexNowPayload([
    'https://www.ashokrimal.com.np/',
    'https://someone-else.example/page',
  ])

  assert.ok(payload)
  assert.deepEqual(payload.urlList, ['https://www.ashokrimal.com.np/'])
})

test('an empty or unusable list produces no payload', () => {
  assert.equal(indexNowPayload([]), null)
  assert.equal(indexNowPayload(['not a url']), null)
  assert.equal(canonicalHost('nonsense'), '')
  assert.equal(canonicalHost('https://www.ashokrimal.com.np/x'), 'www.ashokrimal.com.np')
})

test('batches never exceed the limit and keep every URL once', () => {
  const urls = Array.from({ length: 2_500 }, (_, index) => `https://www.ashokrimal.com.np/p/${index}`)
  const batches = chunkUrls(urls, 1_000)

  assert.equal(batches.length, 3)
  assert.equal(batches[0].length, 1_000)
  assert.equal(batches[2].length, 500)
  assert.equal(batches.flat().length, urls.length)
  assert.deepEqual(chunkUrls([], 10), [])
  assert.deepEqual(chunkUrls(['a'], 10), [['a']])
})
