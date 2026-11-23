/**
 * The performance budget the site holds itself to.
 *
 * Core Web Vitals are measured in the visitor's browser, so a budget only means
 * something if a real measurement can be compared against it. These numbers are
 * the "good" thresholds Google publishes (p75, mobile): LCP 2.5 s, INP 200 ms,
 * CLS 0.1, plus first paint and server response.
 *
 * `useReportWebVitals` sends each metric to `/api/vitals`, which logs every
 * breach as a warning. That is the cheap version of a performance gate: no
 * dashboard to keep, and a regression shows up in the deployment log next to the
 * request that caused it.
 */

export const WEB_VITALS_BUDGET = {
  LCP: 2_500,
  INP: 200,
  CLS: 0.1,
  FCP: 1_800,
  TTFB: 800,
} as const

export type WebVitalName = keyof typeof WEB_VITALS_BUDGET

export function isWebVitalName(name: string): name is WebVitalName {
  // `in` would also accept "constructor" and "toString" through the prototype;
  // the check must only accept the five metrics the budget actually names.
  return Object.prototype.hasOwnProperty.call(WEB_VITALS_BUDGET, name)
}

/** True when a measurement is inside the budget for its metric. */
export function withinBudget(name: WebVitalName, value: number): boolean {
  if (!Number.isFinite(value)) return true
  return value <= WEB_VITALS_BUDGET[name]
}

/** One fixed-format log line; values are rounded so lines compare easily. */
export function describeWebVital(name: string, value: number, path = ''): string {
  const rounded = Math.round(value * 1000) / 1000
  if (!isWebVitalName(name)) return `[vitals] ${name} ${rounded}${path ? ` on ${path}` : ''}`
  const budget = WEB_VITALS_BUDGET[name]
  const verdict = withinBudget(name, value) ? 'ok' : 'over budget'
  return `[vitals] ${name} ${rounded} (budget ${budget}) ${verdict}${path ? ` on ${path}` : ''}`
}

export type WebVitalReport = {
  name: string
  value: number
  path?: string
  rating?: string
}

const MAX_PATH = 200

/** Validates the body a browser sends; anything unusable is dropped quietly. */
export function parseWebVital(input: unknown): WebVitalReport | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const raw = input as Record<string, unknown>
  if (typeof raw.name !== 'string' || !isWebVitalName(raw.name)) return null
  if (typeof raw.value !== 'number' || !Number.isFinite(raw.value) || raw.value < 0) return null

  const path =
    typeof raw.path === 'string' && raw.path.startsWith('/')
      ? raw.path.split('?')[0].slice(0, MAX_PATH)
      : undefined

  return {
    name: raw.name,
    value: raw.value,
    ...(path ? { path } : {}),
    ...(typeof raw.rating === 'string' ? { rating: raw.rating.slice(0, 20) } : {}),
  }
}

export function exceedsBudget(report: WebVitalReport): boolean {
  return isWebVitalName(report.name) ? !withinBudget(report.name, report.value) : false
}
