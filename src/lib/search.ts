/**
 * Searching the published site.
 *
 * The site has no search service and does not need one: every page, case study,
 * journal entry and collection record is already read from Postgres for the
 * sitemap, so the same rows become a small in-memory index per request. Scoring
 * is deliberately simple and explainable — the title counts for most, keywords
 * next, the description last, and every query word has to appear somewhere.
 *
 * Pure, so ranking is tested without a database.
 */

export type SearchDocKind = 'page' | 'project' | 'journal' | 'collection' | 'profile'

export interface SearchDoc {
  id: string
  title: string
  description?: string
  url: string
  kind: SearchDocKind
  keywords?: string[]
}

export interface SearchHit extends SearchDoc {
  score: number
  snippet: string
}

const SNIPPET_LENGTH = 170

/** Lowercase words, numbers and hangul included; punctuation separates words. */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .slice(0, 8)
}

export function snippetFor(description: string | undefined, tokens: string[]): string {
  if (!description) return ''
  const text = description.replace(/\s+/g, ' ').trim()
  if (text.length <= SNIPPET_LENGTH) return text

  const lower = text.toLowerCase()
  const first = tokens
    .map((token) => lower.indexOf(token))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0]

  if (first === undefined || first < SNIPPET_LENGTH - 40) {
    return `${text.slice(0, SNIPPET_LENGTH).trimEnd()}…`
  }

  const start = Math.max(0, first - 40)
  const window = text.slice(start, start + SNIPPET_LENGTH).trim()
  return `${start > 0 ? '…' : ''}${window}${start + SNIPPET_LENGTH < text.length ? '…' : ''}`
}

export function scoreDoc(doc: SearchDoc, tokens: string[]): number {
  if (!tokens.length) return 0

  const title = doc.title.toLowerCase()
  const description = (doc.description ?? '').toLowerCase()
  const keywords = (doc.keywords ?? []).join(' ').toLowerCase()

  let score = 0
  for (const token of tokens) {
    const inTitle = title.includes(token)
    const inKeywords = keywords.includes(token)
    const inDescription = description.includes(token)
    // Every word must appear somewhere, otherwise a two-word query would return
    // everything that matches either word.
    if (!inTitle && !inKeywords && !inDescription) return 0

    if (inTitle) score += title.startsWith(token) ? 10 : 6
    if (inKeywords) score += 3
    if (inDescription) score += 1
  }

  // A title that is exactly the query beats one that merely contains it.
  if (title === tokens.join(' ')) score += 8
  return score
}

export function searchDocuments(
  docs: readonly SearchDoc[],
  query: string,
  { limit = 24 }: { limit?: number } = {},
): SearchHit[] {
  const tokens = tokenize(query)
  if (!tokens.length) return []

  const hits: SearchHit[] = []
  for (const doc of docs) {
    const score = scoreDoc(doc, tokens)
    if (score <= 0) continue
    hits.push({ ...doc, score, snippet: snippetFor(doc.description, tokens) })
  }

  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}
