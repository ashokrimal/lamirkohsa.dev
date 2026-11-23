import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRssFeed, escapeXml, toRfc822 } from '../src/lib/rss'

const base = {
  title: 'Ashok Rimal — Journal',
  description: 'Notes.',
  siteUrl: 'https://www.ashokrimal.com.np',
  feedPath: '/feed.xml',
}

test('RSS is well-formed with the channel metadata a reader needs', () => {
  const xml = buildRssFeed({
    ...base,
    items: [
      {
        title: 'First entry',
        link: 'https://www.ashokrimal.com.np/blogs/first-entry',
        description: 'What happened.',
        published: new Date('2026-05-01T10:00:00Z'),
      },
    ],
    lastBuildDate: new Date('2026-05-02T10:00:00Z'),
  })

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/)
  assert.match(xml, /<rss version="2.0"/)
  assert.match(xml, /<title>Ashok Rimal — Journal<\/title>/)
  assert.match(xml, /<link>https:\/\/www\.ashokrimal\.com\.np\/blogs<\/link>/)
  assert.match(xml, /<atom:link href="https:\/\/www\.ashokrimal\.com\.np\/feed\.xml" rel="self"/)
  assert.match(xml, /<guid isPermaLink="true">https:\/\/www\.ashokrimal\.com\.np\/blogs\/first-entry<\/guid>/)
  assert.match(xml, /<pubDate>Fri, 01 May 2026 10:00:00 GMT<\/pubDate>/)
})

test('channel dates follow the newest item, not the build time', () => {
  const xml = buildRssFeed({
    ...base,
    items: [
      { title: 'Old', link: 'https://x.test/a', published: new Date('2026-01-01T00:00:00Z') },
      { title: 'New', link: 'https://x.test/b', published: new Date('2026-03-01T00:00:00Z') },
    ],
    // Before every item: the newest entry is what the channel reports.
    lastBuildDate: new Date('2025-01-01T00:00:00Z'),
  })

  assert.match(xml, /<lastBuildDate>Sun, 01 Mar 2026 00:00:00 GMT<\/lastBuildDate>/)
})

test('CMS text cannot break out of the XML', () => {
  const xml = buildRssFeed({
    ...base,
    title: 'A & B <script>',
    items: [{ title: '<b>"quoted"</b> & more', link: 'https://x.test/?a=1&b=2' }],
  })

  assert.match(xml, /<title>A &amp; B &lt;script&gt;<\/title>/)
  assert.match(xml, /&lt;b&gt;&quot;quoted&quot;&lt;\/b&gt; &amp; more/)
  assert.match(xml, /https:\/\/x\.test\/\?a=1&amp;b=2/)
  assert.equal(xml.includes('<script>'), false)
})

test('an empty journal still produces a valid channel', () => {
  const xml = buildRssFeed({ ...base, items: [] })
  assert.match(xml, /<channel>/)
  assert.equal(xml.includes('<item>'), false)
})

test('escaping covers every XML metacharacter once', () => {
  assert.equal(escapeXml(`&<>"'`), '&amp;&lt;&gt;&quot;&apos;')
  assert.equal(toRfc822(new Date('2026-12-31T23:59:59Z')), 'Thu, 31 Dec 2026 23:59:59 GMT')
})
