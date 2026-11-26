import assert from 'node:assert/strict'
import test from 'node:test'
import {
  blogBody,
  blogDate,
  blogExcerpt,
  blogPayload,
  blogParagraphs,
  blogReadingTime,
  blogSlug,
  blogTagLabel,
  blogTagPath,
  blogTags,
  blogsWithTag,
  collectBlogTags,
  normalizeBlogTags,
  type BlogRecord,
} from '../src/lib/blog-article'

function entry(overrides: Partial<BlogRecord> = {}): BlogRecord {
  return {
    title: 'Designing the studio',
    slug: 'designing-the-studio',
    payload: {
      body: 'A paragraph.\n\nAnother paragraph.',
      tags: ['Next.js', 'Postgres'],
    },
    ...overrides,
  }
}

test('the payload is read only from an object, never a bare string', () => {
  assert.deepEqual(blogPayload(entry()), {
    body: 'A paragraph.\n\nAnother paragraph.',
    tags: ['Next.js', 'Postgres'],
  })
  assert.deepEqual(blogPayload({ title: 'Notes', payload: 'plain text' }), {})
})

test('body field order matches what the article page renders', () => {
  assert.equal(blogBody(entry({ payload: { content: 'C', body: 'B', description: 'D' } })), 'C')
  assert.equal(blogBody(entry({ payload: { body: 'B', description: 'D' } })), 'B')
  assert.equal(blogBody(entry({ payload: { description: 'D' } })), 'D')
  assert.equal(blogBody({ title: 'Notes', payload: 'legacy body' }), 'legacy body')
  assert.equal(blogBody({ title: 'Notes' }), '')
})

test('reading time and paragraphs ignore markup and blank lines', () => {
  assert.deepEqual(blogReadingTime(''), { words: 0, minutes: 1 })
  assert.deepEqual(blogReadingTime('one two three'), { words: 3, minutes: 1 })
  assert.equal(blogReadingTime(Array.from({ length: 401 }, () => 'word').join(' ')).minutes, 3)

  assert.deepEqual(
    blogParagraphs('<p>First</p>\n\n\nSecond\n\n  \n'),
    ['First', 'Second'],
  )
})

test('the excerpt falls back to the body', () => {
  assert.equal(blogExcerpt(entry({ payload: { excerpt: 'A summary', body: 'Body' } })), 'A summary')
  assert.equal(blogExcerpt(entry({ payload: { body: 'Body' } })), 'Body')
})

test('the URL segment prefers the slug and otherwise derives one', () => {
  assert.equal(blogSlug(entry()), 'designing-the-studio')
  assert.equal(blogSlug({ title: ' Designing The Studio! ' }), 'designing-the-studio')
  assert.equal(blogSlug({ title: 'Note', slug: '   ' }), 'note')
})

test('dates prefer the authored date over the schedule', () => {
  assert.equal(blogDate(entry({ payload: { date: '2026-05-01', publishAt: '2026-06-01' } })), '2026-05-01')
  assert.equal(blogDate(entry({ payload: { publishAt: '2026-06-01' } })), '2026-06-01')
  assert.equal(blogDate(entry({ payload: {} })), undefined)
})

test('tags are trimmed and de-duplicated case-insensitively', () => {
  assert.deepEqual(normalizeBlogTags([' Next.js ', 'next.js', 'Postgres', '']), [
    'Next.js',
    'Postgres',
  ])
  assert.deepEqual(normalizeBlogTags('Next.js, Postgres, Next.js'), ['Next.js', 'Postgres'])
  assert.deepEqual(normalizeBlogTags(undefined), [])
  assert.deepEqual(normalizeBlogTags([42, 'Notes']), ['Notes'])
  assert.deepEqual(blogTags(entry({ payload: { tags: 'Design, design' } })), ['Design'])
})

test('tag counts are shared across entries and sorted by use', () => {
  const blogs = [
    entry({ title: 'A', payload: { tags: ['Next.js', 'Postgres'] } }),
    entry({ title: 'B', payload: { tags: ['next.js'] } }),
    entry({ title: 'C', payload: { tags: ['Design'] } }),
  ]

  assert.deepEqual(collectBlogTags(blogs), [
    { tag: 'Next.js', slug: 'next-js', count: 2 },
    { tag: 'Design', slug: 'design', count: 1 },
    { tag: 'Postgres', slug: 'postgres', count: 1 },
  ])
})

test('tag links exist only for tags that can be slugged', () => {
  const blogs = [entry({ title: 'A', payload: { tags: ['한국어'] } }), entry({ title: 'B', payload: { tags: ['Notes'] } })]

  assert.deepEqual(
    collectBlogTags(blogs).map((tag) => tag.tag),
    ['Notes'],
    'a non-Latin tag still displays on the article but never links nowhere',
  )
  assert.equal(blogTagPath('Next.js'), '/blogs/tag/next-js')
  assert.equal(blogTagLabel(blogs, 'notes'), 'Notes')
  assert.equal(blogTagLabel(blogs, 'missing'), undefined)
})

test('entries are matched to a tag by its slug, case-insensitively', () => {
  const blogs = [
    entry({ title: 'A', payload: { tags: ['Next.js'] } }),
    entry({ title: 'B', payload: { tags: ['Postgres'] } }),
  ]

  assert.deepEqual(
    blogsWithTag(blogs, 'NEXT-JS').map((blog) => blog.title),
    ['A'],
  )
  assert.deepEqual(blogsWithTag(blogs, 'next js').map((blog) => blog.title), ['A'])
  assert.deepEqual(blogsWithTag(blogs, ''), [])
  assert.deepEqual(blogsWithTag(blogs, 'missing'), [])
})
