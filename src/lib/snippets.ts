/**
 * Meta descriptions are cut to roughly 160 characters so search results and
 * social cards show one clean sentence instead of a paragraph.
 *
 * A hard `slice(0, 160)` produced snippets that ended mid-word ("…designing and
 * s"), which reads as broken text everywhere it is displayed. This trims at the
 * last whole word and closes with an ellipsis.
 */
export const SNIPPET_LIMIT = 160

export function snippet(text: string | undefined | null, limit = SNIPPET_LIMIT): string | undefined {
  const clean = text?.replace(/\s+/g, ' ').trim()
  if (!clean) return undefined
  if (clean.length <= limit) return clean

  const cut = clean.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  // A single enormous word keeps the hard cut rather than returning nothing.
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut
  // Trailing punctuation before an ellipsis looks like a typo.
  return `${base.replace(/[,;:.\-–—]+$/, '')}…`
}
