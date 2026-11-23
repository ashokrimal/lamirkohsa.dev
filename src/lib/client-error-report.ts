/**
 * What a browser-side error is allowed to say when it reaches the server.
 *
 * The endpoint that receives these reports is public, so the payload is treated
 * as hostile: lengths are capped, the URL loses its query string (which can hold
 * tokens), and errors raised by browser extensions are dropped entirely because
 * they are neither ours nor actionable.
 *
 * Pure on purpose — the route and the tests use the same rules.
 */

export interface ClientErrorReport {
  message: string
  stack?: string
  source?: string
  url?: string
  kind: 'error' | 'unhandledrejection' | 'boundary' | 'vitals'
  userAgent?: string
}

export type ClientErrorParseResult =
  | { ok: true; report: ClientErrorReport }
  | { ok: false; error: string }

const MAX_BODY_BYTES = 8_000
const MAX_MESSAGE = 500
const MAX_STACK = 4_000
const MAX_URL = 300

/** Extensions inject their own scripts; their errors are not this site's. */
const IGNORED_SOURCE = /^(chrome|moz|safari|safari-web)-extension:\/\/|^extension:\/\//

function text(value: unknown, limit: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, limit)
}

function stripQuery(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url, 'https://placeholder.invalid')
    return `${parsed.origin === 'https://placeholder.invalid' ? '' : parsed.origin}${parsed.pathname}`.slice(
      0,
      MAX_URL,
    )
  } catch {
    return url.split('?')[0].slice(0, MAX_URL)
  }
}

export function parseClientError(input: unknown): ClientErrorParseResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Expected a JSON object.' }
  }

  const raw = input as Record<string, unknown>
  const message = text(raw.message, MAX_MESSAGE)
  if (!message) return { ok: false, error: 'A message is required.' }

  const source = text(raw.source, MAX_URL)
  if (source && IGNORED_SOURCE.test(source)) {
    return { ok: false, error: 'Browser-extension errors are not recorded.' }
  }

  const kinds: ClientErrorReport['kind'][] = ['error', 'unhandledrejection', 'boundary', 'vitals']
  const kind = kinds.includes(raw.kind as ClientErrorReport['kind'])
    ? (raw.kind as ClientErrorReport['kind'])
    : 'error'

  return {
    ok: true,
    report: {
      message,
      ...(text(raw.stack, MAX_STACK) ? { stack: text(raw.stack, MAX_STACK) } : {}),
      ...(source ? { source } : {}),
      ...(stripQuery(text(raw.url, MAX_URL)) ? { url: stripQuery(text(raw.url, MAX_URL)) } : {}),
      kind,
      ...(text(raw.userAgent, 200) ? { userAgent: text(raw.userAgent, 200) } : {}),
    },
  }
}

/** A one-line summary for the server log; the full report goes to the sink. */
export function summarizeClientError(report: ClientErrorReport): string {
  const where = report.url ? ` at ${report.url}` : ''
  return `[client:${report.kind}] ${report.message}${where}`
}

export function exceedsClientErrorBudget(declaredLength: number): boolean {
  return Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES
}
