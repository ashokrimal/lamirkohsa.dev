import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDateInput } from '../src/lib/cms-date-input'
import { cmsDate } from '../src/lib/structured-data'

function valueOf(input: string | null | undefined) {
  const result = parseDateInput(input)
  assert.equal(result.ok, true, `expected "${input}" to parse, got ${JSON.stringify(result)}`)
  return result.ok ? result.value : null
}

function messageOf(input: string) {
  const result = parseDateInput(input)
  assert.equal(result.ok, false, `expected "${input}" to be rejected`)
  return result.ok ? '' : result.message
}

test('clearing the date is valid', () => {
  assert.equal(valueOf(''), null)
  assert.equal(valueOf('   '), null)
  assert.equal(valueOf(undefined), null)
})

test('ISO dates and month precision pass through normalized', () => {
  assert.equal(valueOf('2025-03-09'), '2025-03-09')
  assert.equal(valueOf('2025-03'), '2025-03')
  assert.equal(valueOf(' 2025-03-09 '), '2025-03-09')
  assert.equal(valueOf('2025-3-9'), '2025-03-09')
})

test('slash and dot separators are accepted', () => {
  assert.equal(valueOf('2025/03/09'), '2025-03-09')
  assert.equal(valueOf('2025/3'), '2025-03')
  assert.equal(valueOf('2025.03.09'), '2025-03-09')
})

test('month names are accepted and reduced to ISO', () => {
  assert.equal(valueOf('9 March 2025'), '2025-03-09')
  assert.equal(valueOf('9 Mar 2025'), '2025-03-09')
  assert.equal(valueOf('March 9, 2025'), '2025-03-09')
  assert.equal(valueOf('March 2025'), '2025-03')
  assert.equal(valueOf('mar 2025'), '2025-03')
})

test('datetime values keep their time', () => {
  assert.equal(valueOf('2025-03-09T09:30'), '2025-03-09T09:30')
  assert.equal(valueOf('2025-03-09 09:30'), '2025-03-09T09:30')
  assert.equal(valueOf('2025-03-09T09:30:00'), '2025-03-09T09:30')
})

test('prose and vague values are rejected with a message', () => {
  assert.match(messageOf('Q3 2025'), /isn't a date/)
  assert.match(messageOf('sometime next year'), /isn't a date/)
  assert.match(messageOf('next spring'), /isn't a date/)
  assert.match(messageOf('2025'), /year on its own/)
  // A season looks like a month name but is not one.
  assert.match(messageOf('Spring 2025'), /month doesn't exist/)
})

test('impossible calendar dates are rejected', () => {
  assert.match(messageOf('2025-02-30'), /day doesn't exist/)
  assert.match(messageOf('2025-13-01'), /month doesn't exist/)
  assert.match(messageOf('2025-04-31'), /day doesn't exist/)
  assert.match(messageOf('1899-01-01'), /between 1900 and 2100/)
})

test('the publisher reads exactly what the editor accepts', () => {
  assert.equal(cmsDate('2025-03-09'), '2025-03-09T00:00:00.000Z')
  assert.equal(cmsDate('9 Mar 2025'), '2025-03-09T00:00:00.000Z')
  assert.equal(cmsDate('2025-03'), '2025-03-01T00:00:00.000Z')
  assert.equal(cmsDate('2025-03-09T09:30'), '2025-03-09T00:00:00.000Z')
  assert.equal(cmsDate('Q3 2025'), undefined)
  assert.equal(cmsDate('2025-02-30'), undefined)
  assert.equal(cmsDate(''), undefined)
})
