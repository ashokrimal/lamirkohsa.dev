/**
 * One parser for every publication date an owner can type.
 *
 * The public site only emits `datePublished`/`article:published_time` for a real
 * calendar date, and `cmsDate()` correctly refuses to invent one. The gap was on
 * the input side: `"Q3 2025"` was saved happily and then silently produced no tag.
 * Both editors run values through this parser, show its message inline and store
 * the normalized value, so a date that cannot be published cannot be saved.
 */

export type DateInputResult =
  | { ok: true; value: string | null }
  | { ok: false; message: string }

const FORMAT_HINT = 'Use YYYY-MM-DD or YYYY-MM (for example 2025-03-09).'

const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function pad(value: number, width = 2) {
  return String(value).padStart(width, '0')
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function monthNumber(name: string): number | null {
  const normalized = name.trim().toLowerCase().replace(/\.$/, '')
  if (normalized.length < 3) return null
  const index = MONTH_NAMES.findIndex((month) => month.startsWith(normalized.slice(0, 3)))
  return index === -1 ? null : index + 1
}

const INVALID_MONTH = `That month doesn't exist. ${FORMAT_HINT}`
const INVALID_DAY = `That day doesn't exist in that month. ${FORMAT_HINT}`

function buildDate(year: number, month: number, day?: number): DateInputResult {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return { ok: false, message: `Year must be between 1900 and 2100. ${FORMAT_HINT}` }
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false, message: INVALID_MONTH }
  }
  if (day === undefined) {
    return { ok: true, value: `${pad(year, 4)}-${pad(month)}` }
  }
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) {
    return { ok: false, message: INVALID_DAY }
  }
  return { ok: true, value: `${pad(year, 4)}-${pad(month)}-${pad(day)}` }
}

/**
 * Accepts an empty value (clearing the date is valid), ISO dates, slash or dot
 * separators, and English month names. Anything else is rejected with a message
 * the editors can show next to the field.
 */
export function parseDateInput(raw: string | null | undefined): DateInputResult {
  const value = (raw ?? '').trim()
  if (!value) return { ok: true, value: null }

  // YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm — the CMS date fields are datetime-local.
  const dateTime = /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value)
  if (dateTime) {
    const [, year, month, day, hour, minute] = dateTime
    const date = buildDate(Number(year), Number(month), Number(day))
    if (!date.ok || !date.value) return date
    const hours = Number(hour)
    const minutes = Number(minute)
    if (hours > 23 || minutes > 59) {
      return { ok: false, message: `That time doesn't exist. ${FORMAT_HINT}` }
    }
    return { ok: true, value: `${date.value}T${pad(hours)}:${pad(minutes)}` }
  }

  // 2025-03-09, 2025/3/9, 2025.03.09, 2025-03, 2025/3
  const numeric = /^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?$/.exec(value)
  if (numeric) {
    const [, year, month, day] = numeric
    return buildDate(Number(year), Number(month), day === undefined ? undefined : Number(day))
  }

  // 9 March 2025, 9 Mar, 2025 → day first
  const dayFirst = /^(\d{1,2})\s+([A-Za-z]+)\.?,?\s+(\d{4})$/.exec(value)
  if (dayFirst) {
    const [, day, monthName, year] = dayFirst
    const month = monthNumber(monthName)
    if (month === null) return { ok: false, message: INVALID_MONTH }
    return buildDate(Number(year), month, Number(day))
  }

  // March 9, 2025 → month first, with a day
  const monthFirst = /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/.exec(value)
  if (monthFirst) {
    const [, monthName, day, year] = monthFirst
    const month = monthNumber(monthName)
    if (month === null) return { ok: false, message: INVALID_MONTH }
    return buildDate(Number(year), month, Number(day))
  }

  // March 2025 → month precision
  const monthOnly = /^([A-Za-z]+)\.?,?\s+(\d{4})$/.exec(value)
  if (monthOnly) {
    const [, monthName, year] = monthOnly
    const month = monthNumber(monthName)
    if (month === null) return { ok: false, message: INVALID_MONTH }
    return buildDate(Number(year), month)
  }

  if (/^\d{4}$/.test(value)) {
    return {
      ok: false,
      message: `A year on its own isn't a date. Add a month, like ${value}-03.`,
    }
  }

  return { ok: false, message: `"${value}" isn't a date. ${FORMAT_HINT}` }
}
