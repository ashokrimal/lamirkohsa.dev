import test from 'node:test'
import assert from 'node:assert/strict'
import {
  blogIndexJsonLd,
  blogPostingJsonLd,
  breadcrumbJsonLd,
  caseStudyJsonLd,
  cmsDate,
} from '../src/lib/structured-data'

type Publisher = {
  '@type'?: string
  logo?: { '@type'?: string; url?: string; width?: number; height?: number }
}

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

test('the publisher is an Organization with a logo, as Article rich results require', () => {
  const blogPublisher = blogPostingJsonLd({ title: 'Post', path: '/blogs/post' }).publisher as Publisher
  const caseStudyPublisher = caseStudyJsonLd({ title: 'Study', path: '/projects/study' }).publisher as Publisher

  for (const publisher of [blogPublisher, caseStudyPublisher]) {
    assert.equal(publisher['@type'], 'Organization')
    assert.equal(publisher.logo?.['@type'], 'ImageObject')
    assert.match(String(publisher.logo?.url), /^https:\/\/.+\.png$/)
    assert.ok((publisher.logo?.width ?? 0) >= 112)
    assert.ok((publisher.logo?.height ?? 0) >= 112)
  }
})

test('the journal index declares the Blog node its articles belong to', () => {
  const index = blogIndexJsonLd({
    name: 'Journal',
    description: 'Notes on building software.',
    path: '/blogs',
  })

  assert.equal(index['@type'], 'Blog')
  assert.match(String(index['@id']), /\/blogs$/)
  assert.equal(index.name, 'Journal')
  assert.equal(index.description, 'Notes on building software.')
  assert.equal((index.publisher as Publisher)['@type'], 'Organization')

  const article = blogPostingJsonLd({ title: 'Post', path: '/blogs/post' })
  const belongsTo = article.isPartOf as Record<string, unknown>
  assert.equal(belongsTo['@id'], index['@id'])
  assert.equal(belongsTo.url, index['@id'])
})

test('an article without a cover still carries the required image', () => {
  const data = blogPostingJsonLd({ title: 'Untitled draft', path: '/blogs/draft' })

  const images = data.image as string[]
  assert.equal(images.length, 1)
  assert.equal(images[0].startsWith('http'), true)
})

test('missing optional fields are omitted rather than invented', () => {
  const data = blogPostingJsonLd({ title: 'Untitled draft', path: '/blogs/draft' })

  assert.equal('datePublished' in data, false)
  assert.equal('description' in data, false)
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
  assert.deepEqual(data.sameAs, ['https://ashokrimal.com.np/'])
})

test('a placeholder or relative live URL is dropped from sameAs', () => {
  for (const liveUrl of ['#', '', '  ', '/projects/portfolio', 'javascript:void(0)']) {
    const data = caseStudyJsonLd({ title: 'Study', path: '/projects/study', liveUrl })
    assert.equal('sameAs' in data, false, `unexpected sameAs for ${JSON.stringify(liveUrl)}`)
  }
})

test('a case study with no stack omits about and keywords', () => {
  const data = caseStudyJsonLd({ title: 'Empty', path: '/projects/empty', technologies: ['   '] })

  assert.equal('about' in data, false)
  assert.equal('keywords' in data, false)
})

test('a case study publish date comes from a real studio date', () => {
  const monthOnly = caseStudyJsonLd({
    title: 'Study',
    path: '/projects/study',
    publishedTime: '2025-03',
  })
  assert.equal(monthOnly.datePublished, '2025-03-01T00:00:00.000Z')

  const prose = caseStudyJsonLd({ title: 'Study', path: '/projects/study', publishedTime: 'Q3 2025' })
  assert.equal('datePublished' in prose, false)
})

test('cmsDate accepts ISO calendar dates and rejects anything ambiguous', () => {
  assert.equal(cmsDate('2025-03-09'), '2025-03-09T00:00:00.000Z')
  assert.equal(cmsDate('2025-03'), '2025-03-01T00:00:00.000Z')
  assert.equal(cmsDate(' 2025-03 '), '2025-03-01T00:00:00.000Z')
  assert.equal(cmsDate('2025-02-31'), undefined)
  assert.equal(cmsDate('2025'), undefined)
  assert.equal(cmsDate('March 2025'), undefined)
  assert.equal(cmsDate(undefined), undefined)
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
