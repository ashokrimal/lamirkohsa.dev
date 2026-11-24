import test from 'node:test'
import assert from 'node:assert/strict'
import { SNIPPET_LIMIT, snippet } from '../src/lib/snippets'

test('short text is returned whole', () => {
  assert.equal(snippet('A case study about calm interfaces.'), 'A case study about calm interfaces.')
})

test('collapses whitespace before measuring the length', () => {
  assert.equal(snippet('  Design\n\n notes   here.  '), 'Design notes here.')
})

test('long text is cut at a word boundary, never mid-word', () => {
  const source =
    'Most modern digital software bombards users with notifications, saturated gradients, modal dialogs, and simulated urgency. Over the past year of designing and shipping interfaces, one pattern held.'
  const result = String(snippet(source))

  assert.ok(result.length <= SNIPPET_LIMIT + 1, `unexpectedly long: ${result.length}`)
  assert.ok(result.endsWith('…'))
  const withoutEllipsis = result.slice(0, -1)
  // The last retained character must close a whole word from the source.
  assert.ok(
    source.startsWith(withoutEllipsis),
    'the kept text is not an exact prefix of the source',
  )
  assert.ok(
    source[withoutEllipsis.length] === ' ',
    'the cut happened inside a word rather than at a space',
  )
})

test('trailing punctuation is dropped before the ellipsis', () => {
  const result = String(snippet('Word '.repeat(40)))
  assert.equal(result.endsWith('Word…'), true)
})

test('a single very long word still produces a snippet', () => {
  const result = String(snippet('a'.repeat(300)))
  assert.equal(result.length, SNIPPET_LIMIT + 1)
})

test('empty input has no description at all', () => {
  assert.equal(snippet(''), undefined)
  assert.equal(snippet('   '), undefined)
  assert.equal(snippet(undefined), undefined)
  assert.equal(snippet(null), undefined)
})

test('the default limit is the snippet window search engines show', () => {
  assert.equal(SNIPPET_LIMIT, 160)
})
