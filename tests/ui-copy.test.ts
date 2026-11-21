import assert from 'node:assert/strict'
import { test } from 'node:test'
import { planUiCopyWrite } from '../src/lib/ui-copy-write'
import {
  flattenUiStrings,
  readTemplatePlaceholders,
  resolveUiStrings,
  validateTemplate,
} from '../src/lib/ui-strings'
import { parseSectionContent } from '../src/lib/studio/sections'

test('a blank key is rejected before any database work', () => {
  assert.throws(
    () => planUiCopyWrite({ key: '  ', value: 'x', korean: '', reset: false }),
    /copy key is required/,
  )
})

test('clearing both fields deletes the override', () => {
  assert.deepEqual(
    planUiCopyWrite({ key: 'nav.openMenu', value: '', korean: '', reset: false }),
    { action: 'delete' },
  )
  assert.deepEqual(
    planUiCopyWrite({ key: 'nav.openMenu', value: 'ignored', korean: 'ignored', reset: true }),
    { action: 'delete' },
  )
})

test('a plain label keeps its Korean pair', () => {
  assert.deepEqual(
    planUiCopyWrite({ key: 'nav.openMenu', value: ' Menu ', korean: ' 메뉴 ', reset: false }),
    { action: 'upsert', payload: { key: 'nav.openMenu', value: 'Menu', korean: '메뉴' } },
  )
})

test('a template key stores English only', () => {
  assert.deepEqual(
    planUiCopyWrite({ key: 'media.entries', value: '{count} items', korean: '항목', reset: false }),
    { action: 'upsert', payload: { key: 'media.entries', value: '{count} items' } },
  )
})

test('a template with an unknown placeholder is rejected instead of saved', () => {
  assert.throws(
    () => planUiCopyWrite({ key: 'media.entries', value: '{titel}', korean: '', reset: false }),
    /Unknown placeholder \{titel\}/,
  )
})

test('template validation accepts the placeholders its builder supplies', () => {
  assert.equal(validateTemplate('media.entries', '{count} {count:item|items}'), null)
  assert.equal(validateTemplate('hero.metaRight', 'Work {current}/{total}'), null)
  assert.equal(validateTemplate('nav.openMenu', 'anything {at-all}'), null)
  assert.match(validateTemplate('hero.metaRight', '{curent}') ?? '', /Use \{current\}, \{total\}/)
})

test('plural placeholders are read out of a template', () => {
  assert.deepEqual(readTemplatePlaceholders('{count} {count:item|items} of {total}'), [
    'count',
    'total',
  ])
})

test('every catalogue entry is unique and templates are flagged', () => {
  const entries = flattenUiStrings()
  assert.equal(new Set(entries.map((entry) => entry.key)).size, entries.length)
  assert.ok(entries.some((entry) => entry.template === true))
  assert.ok(entries.some((entry) => entry.template !== true))
})

test('overrides apply to templates and literals stay as fallbacks', () => {
  const defaults = resolveUiStrings({})
  assert.equal(defaults.gallery.photographs(1), '1 photograph')
  assert.equal(defaults.gallery.photographs(2), '2 photographs')

  const overridden = resolveUiStrings({ 'gallery.photographs': { en: '{count} shot(s)' } })
  assert.equal(overridden.gallery.photographs(2), '2 shot(s)')
  assert.equal(overridden.gallery.instagramTitle.en, defaults.gallery.instagramTitle.en)
})

test('an Instagram section keeps its widget id and falls back to section defaults', () => {
  const saved = parseSectionContent('instagram', { widgetId: 'abc12345', title: 'Feed' })
  assert.equal(saved.widgetId, 'abc12345')
  assert.equal(saved.title, 'Feed')
  assert.equal(saved.ctaLabel, 'Follow on Instagram')

  const empty = parseSectionContent('instagram', {})
  assert.equal(empty.widgetId, undefined)
  assert.equal(empty.title, 'Latest from Instagram')
})
