/**
 * Turns a runtime error into a pre-filled GitHub issue.
 *
 * The site's error screens offer "Report the issue": the visitor never has to
 * copy a stack trace by hand. Everything is built in the browser at click time
 * and only leaves the page when the visitor submits the issue on GitHub.
 */

/** Repository that receives reported issues. */
export const ISSUE_REPO = 'ashokrimal/lamirkohsa.dev'

const MAX_TITLE_LENGTH = 90
const MAX_STACK_LENGTH = 3500
const MAX_URL_LENGTH = 1800

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

const safe = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export interface IssueReportInput {
  error?: unknown
  /** Next.js server-rendered error digest. */
  digest?: string
  /** Short description of where the error happened, e.g. "Projects page". */
  context?: string
}

export interface IssueReportDetails {
  title: string
  body: string
  url: string
}

function describeError(error: unknown): { headline: string; stack: string } {
  if (error instanceof Error) {
    return {
      headline: error.message || error.name || 'Unknown error',
      stack: error.stack || '',
    }
  }
  const rendered = safe(error)
  return { headline: rendered || 'Unknown error', stack: '' }
}

/**
 * Builds the issue title, Markdown body and the `issues/new` URL. Reads the
 * current page and browser from `window` when the call happens in a browser so
 * the report describes the environment the visitor actually saw.
 */
export function buildIssueReport(input: IssueReportInput = {}): IssueReportDetails {
  const { headline, stack } = describeError(input.error)
  const inBrowser = typeof window !== 'undefined'

  const pageUrl = inBrowser ? window.location.href : ''
  const userAgent = inBrowser ? window.navigator.userAgent : ''
  const language = inBrowser ? window.navigator.language : ''
  const viewport = inBrowser ? `${window.innerWidth}×${window.innerHeight}` : ''
  const referrer = inBrowser && document.referrer ? document.referrer : ''
  const when = new Date().toISOString()

  const title = truncate(`[Site error] ${headline}`, MAX_TITLE_LENGTH)

  const lines: string[] = [
    '### What happened',
    input.context
      ? `The site showed an error screen while I was on the **${input.context}**.`
      : 'The site showed an error screen.',
    '',
  ]

  if (pageUrl) lines.push(`- **Page:** ${pageUrl}`)
  if (input.digest) lines.push(`- **Error digest:** \`${input.digest}\``)
  if (input.context) lines.push(`- **Area:** ${input.context}`)
  lines.push(`- **When:** ${when}`)
  if (userAgent) lines.push(`- **Browser:** ${userAgent}`)
  if (language) lines.push(`- **Language:** ${language}`)
  if (viewport) lines.push(`- **Viewport:** ${viewport}`)
  if (referrer) lines.push(`- **Came from:** ${referrer}`)
  lines.push('')

  lines.push('### Error details', '', '```', truncate(headline, 800), '```', '')

  if (stack) {
    lines.push(
      '<details><summary>Stack trace</summary>',
      '',
      '```',
      truncate(stack, MAX_STACK_LENGTH),
      '```',
      '',
      '</details>',
      '',
    )
  }

  lines.push(
    '---',
    '',
    '_Reported from the site error screen. The details above were filled in automatically — feel free to add what you were doing when it happened._',
  )

  const body = lines.join('\n')
  const url = `https://github.com/${ISSUE_REPO}/issues/new?title=${encodeURIComponent(
    title,
  )}&body=${encodeURIComponent(body)}`

  return { title, body, url: truncate(url, MAX_URL_LENGTH + 4000) }
}
