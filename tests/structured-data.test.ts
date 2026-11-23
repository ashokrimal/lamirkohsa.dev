import test from 'node:test'
import assert from 'node:assert/strict'
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  caseStudyJsonLd,
} from '../src/lib/structured-data'

test('a blog post declares BlogPosting identity, author and dates', () => {
  const data = blogPostingJsonLd({
    title: 'Designing the studio',
    description: 'How the CMS works.',
    path: '/blogs/designing-the-studio',
    image: '/og.png',
    publishedTime: '2026-05-01T00:00:00.000Z',
    modifiedTime: '2026-05-02T00:00:00.000Z',
  })

  assert.equal(data['@context'], 'https://schema.org')
  assert.equal(data['@type'], 'BlogPosting')
  assert.equal(data.headline, 'Designing the studio')
  assert.match(String(data.url), /\/blogs\/designing-the-studio$/)
  assert.equal(data.datePublished, '2026-05-01T00:00:00.000Z')
  assert.equal(data.dateModified, '2026-05-02T00:00:00.000Z')
  assert.deepEqual((data.author as Record<string, unknown>)['@type'], 'Person')
  assert.deepEqual((data.image as string[])[0].startsWith('http'), true)
})

test('missing optional fields are omitted rather than invented', () => {
  const data = blogPostingJsonLd({ title: 'Untitled draft', path: '/blogs/draft' })

  assert.equal('datePublished' in data, false)
  assert.equal('description' in data, false)
  assert.equal('image' in data, false)
})

test('a case study lists its technologies and live URL', () => {
  const data = caseStudyJsonLd({
    title: 'Portfolio & studio',
    description: 'A CMS-backed portfolio.',
    path: '/projects/portfolio',
    technologies: ['Next.js', '  ', 'Postgres'],
    liveUrl: 'https://ashokrimal.com.np',
    modifiedTime: '2026-04-01T00:00:00.000Z',
  })

  assert.equal(data['@type'], 'TechArticle')
  assert.equal(data.keywords, 'Next.js, Postgres')
  assert.equal((data.about as unknown[]).length, 2)
  assert.deepEqual(data.sameAs, ['https://ashokrimal.com.np'])
})

test('a case study with no stack omits about and keywords', () => {
  const data = caseStudyJsonLd({ title: 'Empty', path: '/projects/empty', technologies: ['   '] })

  assert.equal('about' in data, false)
  assert.equal('keywords' in data, false)
})

test('breadcrumbs number their items in order', () => {
  const data = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
  ])

  const items = data.itemListElement as Array<Record<string, unknown>>
  assert.equal(items.length, 2)
  assert.equal(items[0].position, 1)
  assert.equal(items[1].name, 'Projects')
  assert.match(String(items[1].item), /\/projects$/)
})
