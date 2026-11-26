import assert from 'node:assert/strict'
import test from 'node:test'
import { diffCmsBackups, type CmsBackupFile } from '../src/lib/cms-backup'
import { analyzeSlugRedirects, type SlugRedirectRow } from '../src/lib/slug-history'
import { editTargetsForPath } from '../src/lib/owner-edit-targets'
import { renderOwnerDigest, type OwnerDigest } from '../src/lib/owner-digest'

function backup(cmsContent: unknown[], pages: string[] = []): CmsBackupFile {
  return {
    format: 'lamirkohsa-cms-backup',
    version: 1,
    createdAt: '2026-05-01T00:00:00.000Z',
    source: 'test',
    collections: [],
    counts: { cmsContent: cmsContent.length, pages: pages.length, pageSections: 0, projects: 0, siteSettings: 0, total: 0 },
    cmsContent,
    studio: {
      pages: pages.map((slug) => ({ slug, title: slug, sections: [] })),
      projects: [],
      siteSettings: null,
    },
  } as unknown as CmsBackupFile
}

function record(title: string, overrides: Record<string, unknown> = {}) {
  return {
    collection: 'Projects',
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    payload: { summary: 'A build' },
    status: 'published',
    sortOrder: 0,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}

function redirect(from: string, to: string): SlugRedirectRow {
  return {
    from,
    to,
    collection: 'Blogs',
    createdAt: '2026-05-01T00:00:00.000Z',
    hits: 0,
    lastHitAt: null,
  }
}

test('a backup diff is read in the restore direction', () => {
  const current = backup([
    record('Kept'),
    record('Edited'),
    record('Only live'),
  ])

  const snapshot = backup(
    [
      record('Kept'),
      record('Edited', { payload: { summary: 'Older summary' } }),
      record('Only in snapshot'),
    ],
    ['/about'],
  )

  const diff = diffCmsBackups(current, snapshot)
  assert.equal(diff.added, 1, 'a snapshot-only record is added by a restore')
  assert.equal(diff.removed, 1, 'a live-only record is removed by a restore')
  assert.equal(diff.changed, 1)
  assert.equal(diff.unchanged, 1)
  assert.deepEqual(diff.pagesAdded, ['/about'])

  const edited = diff.entries.find((entry) => entry.title === 'Edited')
  assert.ok(edited)
  assert.deepEqual(edited!.fields, ['payload.summary'])
})

test('redirects are diagnosed for loops, chains and dead destinations', () => {
  const rows = [
    redirect('/blogs/old', '/blogs/new'),
    redirect('/blogs/a', '/blogs/b'),
    redirect('/blogs/b', '/blogs/a'),
    redirect('/blogs/chain', '/blogs/old'),
    redirect('/blogs/gone', '/blogs/deleted'),
  ]
  const issues = analyzeSlugRedirects(rows, [
    '/blogs/new',
    '/blogs/a',
    '/blogs/b',
    '/blogs/old',
  ])

  assert.equal(issues.get('/blogs/a')?.[0]?.kind, 'loop')
  assert.equal(issues.get('/blogs/b')?.[0]?.kind, 'loop')
  assert.equal(issues.get('/blogs/chain')?.[0]?.kind, 'chain')
  assert.equal(issues.get('/blogs/gone')?.[0]?.kind, 'missing-target')
  assert.equal(issues.get('/blogs/old'), undefined)
})

test('the edit affordance maps a page to the right vault', () => {
  assert.deepEqual(
    editTargetsForPath('/').map((target) => target.href),
    ['/admin?section=homepage', '/admin?section=hero', '/admin/site-settings'],
  )
  assert.equal(editTargetsForPath('/blogs/one/')[0].href, '/admin/blogs')
  assert.equal(editTargetsForPath('/projects/case')[0].href, '/admin/projects')
  assert.equal(editTargetsForPath('/media/manga')[0].href, '/admin/media/manga')
  assert.deepEqual(editTargetsForPath('/sign-in'), [])
})

test('the digest says what it means and omits nothing silently', () => {
  const digest: OwnerDigest = {
    generatedAt: '2026-03-09T06:00:00.000Z',
    newMessages: [{ from: 'a@b.com', subject: 'Hello', receivedAt: '2026-03-08T00:00:00.000Z' }],
    totalUnread: 4,
    newSubscribers: 2,
    subscribers: { subscribed: 10, unsubscribed: 1 },
    staleDrafts: [{ title: 'Half an idea', collection: 'Blogs', updatedAt: null }],
    drafts: 3,
    backup: { status: 'fresh', newest: '2026-03-09T03:00:00.000Z', ageHours: 3 },
    failures: [],
  }

  const rendered = renderOwnerDigest(digest)
  assert.match(rendered.subject, /Studio week of 9 March 2026/)
  assert.match(rendered.text, /Hello — a@b.com/)
  assert.match(rendered.text, /2 new subscribers this week/)
  assert.match(rendered.text, /Half an idea \(Blogs\)/)
  assert.match(rendered.text, /Scheduled backup: fresh, newest 3h old/)
  assert.ok(rendered.html.includes('Studio digest'))

  const quiet = renderOwnerDigest({
    ...digest,
    newMessages: [],
    newSubscribers: 0,
    staleDrafts: [],
    drafts: 0,
    failures: ['inbox: timeout'],
  })
  assert.match(quiet.text, /No new contact messages this week/)
  assert.match(quiet.text, /none older than 30 days/)
  assert.match(quiet.text, /Some readings failed: inbox: timeout/)
})
