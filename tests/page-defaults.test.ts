import test from 'node:test'
import assert from 'node:assert/strict'
import { PAGE_DEFAULTS } from '../src/lib/page-defaults'

const SITE_TAGLINE = 'The official portfolio of Ashok Rimal.'

test('every uncopied route has a title and a description of its own', () => {
  const entries = Object.entries(PAGE_DEFAULTS)
  assert.ok(entries.length > 0)

  const seen = new Map<string, string>()
  for (const [path, value] of entries) {
    assert.ok(value.title.trim(), `${path} has an empty title`)
    assert.ok(value.description.trim(), `${path} has an empty description`)
    // Google truncates the snippet around 155-160 characters; longer text is
    // wasted rather than wrong, so keep the defaults inside that window.
    assert.ok(
      value.description.length <= 160,
      `${path} description is ${value.description.length} characters`,
    )
    assert.notEqual(value.description, SITE_TAGLINE, `${path} still uses the site tagline`)

    const duplicate = seen.get(value.description)
    assert.equal(duplicate, undefined, `${path} duplicates the description of ${duplicate}`)
    seen.set(value.description, path)
  }
})
