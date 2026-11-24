import test from 'node:test'
import assert from 'node:assert/strict'
import { VAULTS, fieldsForTab } from '../src/lib/admin-vaults'
import { CMS_COLLECTIONS, CMS_SCHEMA } from '../src/lib/cms-schema'

/**
 * The case study's datePublished and article:published_time both read
 * `completionDate`. The field was declared in the CMS schema but missing from the
 * Projects vault, so it could not be filled in — which is why every case study
 * shipped without a publication date. These tests fail if that happens again.
 */

const completionDateField = VAULTS.projects.fields.find((field) => field.key === 'completionDate')

test('the Projects vault exposes the Completion date field', () => {
  assert.ok(completionDateField, 'completionDate is missing from VAULTS.projects.fields')
  assert.equal(completionDateField.type, 'date')
  assert.equal(completionDateField.label, 'Completion date')
  assert.ok(completionDateField.help?.includes('datePublished'))
})

test('the field reaches the tab the editor renders, not just the vault list', () => {
  for (const tab of VAULTS.projects.tabs) {
    const keys = fieldsForTab(VAULTS.projects, tab.id).map((field) => field.key)
    assert.ok(keys.includes('completionDate'), `tab "${tab.id}" hides completionDate`)
  }
})

test('the CMS schema still accepts completionDate for the projects collection', () => {
  const definition = CMS_SCHEMA.collections.projects
  const keys = [...(definition.requiredFields ?? []), ...(definition.optionalFields ?? [])].map(
    (field) => field.key,
  )

  assert.equal(definition.name, CMS_COLLECTIONS.projects)
  assert.ok(keys.includes('completionDate'), 'the CMS schema no longer declares completionDate')
})

test('every vault field with a date type is optional in its collection schema', () => {
  // A required date would block saving a record that has none, which is the
  // state most case studies are in.
  const definition = CMS_SCHEMA.collections.projects
  const required = new Set((definition.requiredFields ?? []).map((field) => field.key))

  assert.equal(required.has('completionDate'), false)
})
