import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { studioProject } from '../src/lib/db/schema'
import { cmsDate } from '../src/lib/structured-data'

/**
 * Studio-owned case studies publish from the `projects` table, not from the CMS
 * collection, so `completion_date` is what lets those pages emit datePublished
 * and article:published_time at all.
 */

test('the studio projects table declares a completion date column', () => {
  const column = studioProject.completionDate
  assert.ok(column, 'studioProject.completionDate is missing')
  assert.equal(column.name, 'completion_date')
})

test('existing databases get the column without a manual migration', () => {
  const source = fs.readFileSync(new URL('../src/lib/studio/data.ts', import.meta.url), 'utf8')

  // Table creation covers a fresh database; this ALTER covers the live one.
  assert.ok(
    /ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "completion_date"/.test(source),
    'ensureStudioTables does not add completion_date to an existing projects table',
  )
  assert.ok(
    /CREATE TABLE IF NOT EXISTS "projects"[\s\S]*"completion_date" text/.test(source),
    'a fresh projects table is created without completion_date',
  )
})

test('the studio field accepts the same date formats as the CMS field', () => {
  assert.equal(cmsDate('2025-03-09'), '2025-03-09T00:00:00.000Z')
  assert.equal(cmsDate('2025-03'), '2025-03-01T00:00:00.000Z')
  assert.equal(cmsDate('Q3 2025'), undefined)
  assert.equal(cmsDate('2025'), undefined)
})
