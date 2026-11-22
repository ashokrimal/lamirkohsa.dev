import assert from 'node:assert/strict'
import test from 'node:test'
import { CMS_COLLECTIONS } from '../src/lib/cms-schema'
import {
  CMS_BACKUP_COLLECTIONS,
  CMS_BACKUP_FORMAT,
  CMS_BACKUP_KEEP,
  CMS_BACKUP_MAX_BYTES,
  CMS_BACKUP_PLATFORM_LIMIT_BYTES,
  CMS_BACKUP_STALE_AFTER_MS,
  CMS_BACKUP_VERSION,
  cmsBackupAge,
  formatCmsBackupBytes,
  cmsBackupFileName,
  cmsRecordIdentity,
  isCmsBackupPathname,
  countCmsBackup,
  parseCmsBackup,
  planCmsRestore,
  type CmsBackupRecord,
  type CmsExistingRecord,
} from '../src/lib/cms-backup'

function record(overrides: Partial<CmsBackupRecord> = {}): CmsBackupRecord {
  return {
    collection: 'Projects',
    title: 'Harbour terminal',
    slug: 'harbour-terminal',
    payload: { summary: 'A build' },
    status: 'published',
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}

function backupFile(overrides: Record<string, unknown> = {}) {
  return {
    format: CMS_BACKUP_FORMAT,
    version: CMS_BACKUP_VERSION,
    createdAt: '2026-11-22T07:30:00.000Z',
    source: 'test',
    cmsContent: [record()],
    studio: { pages: [], projects: [], siteSettings: null },
    ...overrides,
  }
}

test('the backup collection list matches the CMS schema', () => {
  assert.deepEqual(
    new Set(CMS_BACKUP_COLLECTIONS),
    new Set(Object.values(CMS_COLLECTIONS)),
  )
})

test('a valid backup parses with normalised counts', () => {
  const result = parseCmsBackup(
    backupFile({
      cmsContent: [record(), record({ collection: 'blogs', title: ' Notes ', slug: 'notes' })],
      studio: {
        pages: [
          {
            slug: '/about',
            title: 'About',
            sections: [
              { sectionKey: 'hero', sortOrder: 0, content: { heading: 'Hi' } },
              { sectionKey: 'bio', sortOrder: 1, content: {} },
            ],
          },
        ],
        projects: [{ slug: 'harbour', title: 'Harbour', techStack: ['Go'] }],
        siteSettings: { contactEmail: 'a@b.com', socialLinks: [] },
      },
    }),
  )

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.backup.cmsContent[1].collection, 'Blogs', 'collection names are canonicalised')
  assert.equal(result.backup.cmsContent[1].title, 'Notes')
  assert.equal(result.backup.studio.pages[0].sections.length, 2)
  assert.equal(result.backup.studio.projects[0].status, 'Active', 'project defaults are applied')
  assert.deepEqual(result.backup.counts, {
    cmsContent: 2,
    pages: 1,
    pageSections: 2,
    projects: 1,
    siteSettings: 1,
    total: 7,
  })
})

test('files that are not this backup are rejected with a readable message', () => {
  const cases: Array<[unknown, RegExp]> = [
    [null, /not a CMS backup/],
    ['{"cmsContent":[]}', /not a CMS backup/],
    [backupFile({ format: 'something-else' }), /not a portfolio CMS backup/],
    [backupFile({ version: 99 }), /version 1/],
    [backupFile({ cmsContent: 'nope' }), /missing its cmsContent list/],
    [backupFile({ cmsContent: [record({ collection: 'Secrets' })] }), /not a CMS collection/],
    [backupFile({ cmsContent: [record({ title: '' })] }), /title is empty/],
    [backupFile({ cmsContent: [record({ status: 'live' })] }), /published.*draft/],
    [
      backupFile({ cmsContent: [record({ payload: [] as unknown as Record<string, unknown> })] }),
      /must be a JSON object/,
    ],
    [backupFile({ cmsContent: [record({ slug: '' , payload: {} })] }), /neither a slug nor a payload key/],
  ]

  for (const [input, expected] of cases) {
    const result = parseCmsBackup(input)
    assert.equal(result.ok, false, `expected a rejection for ${JSON.stringify(input)?.slice(0, 60)}`)
    if (result.ok) continue
    assert.match(result.error, expected)
  }
})

test('duplicate identities are rejected instead of silently collapsing', () => {
  const result = parseCmsBackup(
    backupFile({
      cmsContent: [
        record({ collection: 'Site Settings', slug: 'brand', payload: { key: 'brand' } }),
        record({ collection: 'site settings', slug: 'brand-two', payload: { key: 'Brand' } }),
      ],
    }),
  )
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.match(result.error, /two records for Site Settings "brand"/i)
})

test('identity prefers the locked key over the slug', () => {
  assert.equal(
    cmsRecordIdentity('Page Copy', 'old-slug', { key: ' About ' }),
    'page copy::key:about',
  )
  assert.equal(cmsRecordIdentity('Projects', 'Harbour', null), 'projects::slug:harbour')
})

test('merge only adds and updates, never removes', () => {
  const existing: CmsExistingRecord[] = [
    { id: 1, collection: 'Projects', slug: 'harbour-terminal', payload: {} },
    { id: 2, collection: 'Projects', slug: 'retired-build', payload: {} },
    { id: 3, collection: 'Blogs', slug: 'notes', payload: {} },
  ]
  const plan = planCmsRestore(
    existing,
    [record({ title: 'Renamed' }), record({ collection: 'Blogs', slug: 'fresh', title: 'Fresh' })],
    'merge',
  )

  assert.equal(plan.update.length, 1)
  assert.equal(plan.update[0].existing.id, 1)
  assert.equal(plan.insert.length, 1)
  assert.equal(plan.insert[0].slug, 'fresh')
  assert.deepEqual(plan.remove, [])
})

test('declared coverage lets replace clear a collection with no records in the file', () => {
  const existing: CmsExistingRecord[] = [
    { id: 1, collection: 'Projects', slug: 'retired-build', payload: {} },
    { id: 2, collection: 'Blogs', slug: 'notes', payload: {} },
  ]
  const plan = planCmsRestore(existing, [], 'replace', ['Projects'])
  assert.deepEqual(
    plan.remove.map((entry) => entry.id),
    [1],
    'projects are covered and empty, so the stray project goes; blogs are not covered',
  )
})

test('replace removes unmatched records only inside the collections the file covers', () => {
  const existing: CmsExistingRecord[] = [
    { id: 1, collection: 'Projects', slug: 'harbour-terminal', payload: {} },
    { id: 2, collection: 'Projects', slug: 'retired-build', payload: {} },
    { id: 3, collection: 'Blogs', slug: 'notes', payload: {} },
  ]
  const plan = planCmsRestore(existing, [record()], 'replace')

  assert.deepEqual(
    plan.remove.map((entry) => entry.id),
    [2],
    'the retired project goes; the blog the file never mentions stays',
  )
})

test('an empty backup is valid and covers nothing', () => {
  const result = parseCmsBackup(backupFile({ cmsContent: [], studio: {} }))
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.backup.counts.total, 0)
  assert.deepEqual(result.backup.studio, { pages: [], projects: [], siteSettings: null })
  assert.deepEqual(planCmsRestore([], [], 'replace'), { insert: [], update: [], remove: [] })
  assert.equal(countCmsBackup(result.backup).total, 0)
})

test('the backup budget stays under the hosting platform body cap', () => {
  assert.equal(CMS_BACKUP_PLATFORM_LIMIT_BYTES, 4.5 * 1024 * 1024)
  assert.ok(
    CMS_BACKUP_MAX_BYTES < CMS_BACKUP_PLATFORM_LIMIT_BYTES,
    'the studio must refuse before Vercel rejects the request or response',
  )
  assert.ok(CMS_BACKUP_MAX_BYTES >= 3 * 1024 * 1024, 'the budget must stay useful')
  assert.equal(CMS_BACKUP_KEEP, 14)
})

test('byte sizes read the same way in every message', () => {
  assert.equal(formatCmsBackupBytes(0), '0 B')
  assert.equal(formatCmsBackupBytes(512), '512 B')
  assert.equal(formatCmsBackupBytes(2048), '2.0 KB')
  assert.equal(formatCmsBackupBytes(CMS_BACKUP_MAX_BYTES), '4.00 MB')
  assert.equal(formatCmsBackupBytes(CMS_BACKUP_PLATFORM_LIMIT_BYTES), '4.50 MB')
})

test('only the scheduled snapshot names can be read back', () => {
  assert.equal(isCmsBackupPathname('backups/cms-backup-2026-11-22-03-00.json'), true)
  assert.equal(
    isCmsBackupPathname('backups/cms-backup-2026-11-22-03-00-k3j9x2.json'),
    true,
    'a public store appends a random suffix',
  )
  assert.equal(isCmsBackupPathname('backups/other.json'), false)
  assert.equal(isCmsBackupPathname('site/user/photo.png'), false)
  assert.equal(isCmsBackupPathname('backups/cms-backup-2026-11-22-03-00.txt'), false)
  assert.equal(
    isCmsBackupPathname('backups/cms-backup-2026-11-22-03-00.json/../secret.json'),
    false,
    'traversal cannot escape the snapshot prefix',
  )
  assert.equal(isCmsBackupPathname('backups/cms-backup-latest.json'), false)
  assert.equal(isCmsBackupPathname(undefined), false)
  assert.equal(isCmsBackupPathname(null), false)
})

test('every listed snapshot name can be downloaded and restored', () => {
  const names = [
    'backups/cms-backup-2026-11-22-03-00.json',
    'backups/cms-backup-2026-11-22-03-00-k3j9x2.json',
    'backups/cms-backup-2026-11-21-03-00.json',
  ]
  assert.equal(
    names.filter((name) => isCmsBackupPathname(name)).length,
    names.length,
    'the list filter and the download/restore whitelist must agree',
  )
  assert.equal(
    ['backups/notes.json', 'backups/cms-backup-latest.json', 'cms-backup-2026-11-22.json'].filter(
      (name) => isCmsBackupPathname(name),
    ).length,
    0,
    'anything outside the whitelist is never listed',
  )
})

test('the newest snapshot is fresh until it is more than two days old', () => {
  const now = new Date('2026-11-22T12:00:00.000Z')

  assert.deepEqual(cmsBackupAge([], now), { state: 'missing', newest: null, ageMs: null })
  assert.deepEqual(cmsBackupAge(['not a date'], now), { state: 'missing', newest: null, ageMs: null })

  const fresh = cmsBackupAge(
    ['2026-11-21T03:00:00.000Z', '2026-11-22T03:00:00.000Z', '2026-11-19T03:00:00.000Z'],
    now,
  )
  assert.equal(fresh.state, 'fresh')
  assert.equal(fresh.newest, '2026-11-22T03:00:00.000Z')
  assert.equal(fresh.ageMs, 9 * 60 * 60 * 1000)

  // Exactly two days is still fresh; a minute more is a silently failing cron.
  assert.equal(
    cmsBackupAge([new Date('2026-11-20T12:00:00.000Z')], now).state,
    'fresh',
    'two whole days is the boundary, not a miss',
  )
  assert.equal(
    cmsBackupAge([new Date(now.getTime() - CMS_BACKUP_STALE_AFTER_MS - 60_000)], now).state,
    'stale',
  )
  assert.equal(
    cmsBackupAge(['2026-11-25T12:00:00.000Z'], now).state,
    'fresh',
    'a store clock ahead of this one is never a negative age',
  )
})

test('backup filenames sort chronologically and avoid filesystem punctuation', () => {
  assert.equal(
    cmsBackupFileName(new Date('2026-11-22T07:30:45.000Z')),
    'cms-backup-2026-11-22-07-30.json',
  )
})
