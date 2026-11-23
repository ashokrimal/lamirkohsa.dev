import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CMS_BACKUP_COLLECTIONS,
  CMS_BACKUP_FORMAT,
  CMS_BACKUP_VERSION,
  countCmsBackup,
  parseCmsBackup,
  verifyCmsBackupIntegrity,
  type CmsBackupFile,
} from '../src/lib/cms-backup'

function backupWith(overrides: Partial<CmsBackupFile> = {}): CmsBackupFile {
  const base: CmsBackupFile = {
    format: CMS_BACKUP_FORMAT,
    version: CMS_BACKUP_VERSION,
    createdAt: '2026-05-01T00:00:00.000Z',
    source: 'test',
    collections: [...CMS_BACKUP_COLLECTIONS],
    counts: { cmsContent: 0, pages: 0, pageSections: 0, projects: 0, siteSettings: 0, total: 0 },
    cmsContent: [],
    studio: { pages: [], projects: [], siteSettings: null },
  }
  const merged = { ...base, ...overrides }
  merged.counts = countCmsBackup(merged)
  return merged
}

const record = {
  collection: 'Blogs',
  title: 'Entry',
  slug: 'entry',
  payload: { description: 'text' },
  status: 'published',
  sortOrder: 0,
  createdAt: null,
  updatedAt: null,
}

test('a consistent snapshot passes its integrity check', () => {
  const backup = backupWith({ cmsContent: [record] })
  const integrity = verifyCmsBackupIntegrity(backup)
  assert.equal(integrity.ok, true)
  assert.deepEqual(integrity.problems, [])
})

test('counts that disagree with the content fail', () => {
  const backup = backupWith({ cmsContent: [record] })
  backup.counts = { ...backup.counts, total: backup.counts.total + 3 }

  const integrity = verifyCmsBackupIntegrity(backup)
  assert.equal(integrity.ok, false)
  assert.match(integrity.problems[0], /declares \d+ total but carries 1/)
})

test('a truncated file is rejected at parse time', () => {
  const backup = backupWith({ cmsContent: [record] })
  const raw = JSON.parse(JSON.stringify(backup))
  raw.counts.total = 9

  const parsed = parseCmsBackup(raw)
  assert.equal(parsed.ok, false)
  assert.match(parsed.ok ? '' : parsed.error, /truncated/)
})

test('two studio pages with one slug are caught', () => {
  const backup = backupWith({
    studio: {
      pages: [
        { slug: '/about', title: 'About', metaDescription: '', isPublished: true, sections: [] },
        { slug: '/about', title: 'Again', metaDescription: '', isPublished: true, sections: [] },
      ],
      projects: [],
      siteSettings: null,
    },
  })

  const integrity = verifyCmsBackupIntegrity(backup)
  assert.equal(integrity.ok, false)
  assert.match(integrity.problems.join(' '), /share the slug \/about/)
})

test('an unknown status and a keyless section are reported', () => {
  const backup = backupWith({
    cmsContent: [{ ...record, status: 'archived' }],
    studio: {
      pages: [
        {
          slug: '/notes',
          title: 'Notes',
          metaDescription: '',
          isPublished: true,
          sections: [{ sectionKey: '', sortOrder: 0, isEnabled: true, content: {} }],
        },
      ],
      projects: [],
      siteSettings: null,
    },
  })

  const integrity = verifyCmsBackupIntegrity(backup)
  assert.equal(integrity.ok, false)
  const text = integrity.problems.join(' ')
  assert.match(text, /unknown status \(archived\)/)
  assert.match(text, /section with no key/)
})
