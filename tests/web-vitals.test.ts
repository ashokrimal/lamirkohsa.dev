import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeWebVital,
  exceedsBudget,
  isWebVitalName,
  parseWebVital,
  WEB_VITALS_BUDGET,
  withinBudget,
} from '../src/lib/web-vitals'

test('the budget holds the published good thresholds', () => {
  assert.equal(WEB_VITALS_BUDGET.LCP, 2500)
  assert.equal(WEB_VITALS_BUDGET.INP, 200)
  assert.equal(WEB_VITALS_BUDGET.CLS, 0.1)
})

test('the boundary value is inside the budget, one more is not', () => {
  assert.equal(withinBudget('LCP', 2500), true)
  assert.equal(withinBudget('LCP', 2501), false)
  assert.equal(withinBudget('INP', 201), false)
  assert.equal(withinBudget('CLS', 0.1), true)
  assert.equal(withinBudget('CLS', 0.11), false)
  // A missing measurement is not a breach.
  assert.equal(withinBudget('TTFB', Number.NaN), true)
})

test('only the metrics the budget names are accepted', () => {
  assert.equal(isWebVitalName('LCP'), true)
  assert.equal(isWebVitalName('FID'), false)
  assert.equal(isWebVitalName('constructor'), false)
})

test('a browser report is validated and its query string dropped', () => {
  const report = parseWebVital({
    name: 'LCP',
    value: 1_950.5,
    path: '/projects/portfolio?token=secret',
    rating: 'good',
  })

  assert.ok(report)
  assert.equal(report?.name, 'LCP')
  assert.equal(report?.value, 1_950.5)
  assert.equal(report?.path, '/projects/portfolio')
  assert.equal(JSON.stringify(report).includes('secret'), false)
})

test('unusable reports are dropped', () => {
  assert.equal(parseWebVital(null), null)
  assert.equal(parseWebVital('LCP'), null)
  assert.equal(parseWebVital({ name: 'FID', value: 10 }), null)
  assert.equal(parseWebVital({ name: 'LCP', value: 'slow' }), null)
  assert.equal(parseWebVital({ name: 'LCP', value: -1 }), null)
})

test('a breach is described with its budget and verdict', () => {
  assert.equal(
    describeWebVital('LCP', 3_120.4, '/projects'),
    '[vitals] LCP 3120.4 (budget 2500) over budget on /projects',
  )
  assert.match(describeWebVital('CLS', 0.02), /ok$/)
  assert.match(describeWebVital('UNKNOWN', 5), /UNKNOWN 5/)
})

test('exceedsBudget only applies to known metrics', () => {
  assert.equal(exceedsBudget({ name: 'LCP', value: 3_000 }), true)
  assert.equal(exceedsBudget({ name: 'LCP', value: 2_000 }), false)
  assert.equal(exceedsBudget({ name: 'custom', value: 9_999 }), false)
})
