import { toSlug } from '@/lib/slug'

/**
 * Journal entry helpers shared by the public article page, the studio preview
 * and the tag indexes. They are pure so the rules for reading a CMS payload,
 * counting words and deriving a tag URL can be tested without a database.
 */

export type BlogRecord = {
  title: string
  slug?: string
  payload?: unknown
  status?: string
  updatedAt?: string | Date
}

/** The payload object of a record; a bare string payload is not a payload. */
export function blogPayload(blog: BlogRecord): Record<string, unknown> {
  return typeof blog.payload === 'object' && blog.payload !== null
    ? (blog.payload as Record<string, unknown>)
    : {}
}

/** The article text, in the same field order the article page renders. */
export function blogBody(blog: BlogRecord): string {
  const payload = blogPayload(blog)
  for (const key of ['content', 'body', 'description']) {
    const value = payload[key]
    if (typeof value === 'string' && value) return value
  }
  return typeof blog.payload === 'string' ? blog.payload : ''
}

/** Word count and estimated reading time at 200 words per minute. */
export function blogReadingTime(text: string): { words: number; minutes: number } {
  const words = text
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) }
}

/** Blank-line separated paragraphs with inline HTML stripped. */
export function blogParagraphs(body: string): string[] {
  return body
    .replace(/<[^>]*>/g, '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

/** The excerpt shown in cards and metadata, falling back to the body. */
export function blogExcerpt(blog: BlogRecord): string {
  const excerpt = blogPayload(blog).excerpt
  return typeof excerpt === 'string' && excerpt.trim() ? excerpt : blogBody(blog)
}

/** The date an entry displays, preferring its authored date over its schedule. */
export function blogDate(blog: BlogRecord): string | undefined {
  const payload = blogPayload(blog)
  for (const key of ['date', 'publishAt']) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

/** The URL segment for an entry: an explicit slug wins, then the title. */
export function blogSlug(blog: BlogRecord): string {
  return blog.slug?.trim() || toSlug(blog.title)
}

/**
 * Normalizes the free-form `tags` field: an array or comma-separated string,
 * trimmed, de-duplicated case-insensitively, with the first spelling kept.
 */
export function normalizeBlogTags(value: unknown): string[] {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []

  const seen = new Map<string, string>()
  for (const item of items) {
    if (typeof item !== 'string') continue
    const tag = item.trim().replace(/\s+/g, ' ')
    if (!tag) continue
    const key = toSlug(tag) || tag.toLowerCase()
    if (!seen.has(key)) seen.set(key, tag)
  }
  return [...seen.values()]
}

export function blogTags(blog: BlogRecord): string[] {
  return normalizeBlogTags(blogPayload(blog).tags)
}

/**
 * A tag is reachable only when it has a slug. A tag written entirely in a
 * non-Latin script has no ASCII slug, so it still displays but never becomes a
 * link to a route that would not exist.
 */
export function blogTagSlug(tag: string): string {
  return toSlug(tag)
}

export function blogTagPath(tag: string): string {
  return `/blogs/tag/${blogTagSlug(tag)}`
}

export type BlogTag = { tag: string; slug: string; count: number }

/** Every linkable tag across a set of entries, most used first. */
export function collectBlogTags(blogs: BlogRecord[]): BlogTag[] {
  const bySlug = new Map<string, BlogTag>()
  for (const blog of blogs) {
    if (!blog.title) continue
    for (const tag of blogTags(blog)) {
      const slug = blogTagSlug(tag)
      if (!slug) continue
      const entry = bySlug.get(slug)
      if (entry) {
        entry.count += 1
      } else {
        bySlug.set(slug, { tag, slug, count: 1 })
      }
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  )
}

/**
 * The display spelling for a tag slug, recovered from a published entry so a
 * tag page keeps the author's capitalisation instead of the URL's.
 */
export function blogTagLabel(blogs: BlogRecord[], slug: string): string | undefined {
  return collectBlogTags(blogs).find((tag) => tag.slug === slug)?.tag
}

/** Entries carrying a tag, newest first (undated entries keep their order). */
export function blogsWithTag(blogs: BlogRecord[], slug: string): BlogRecord[] {
  const match = toSlug(slug)
  if (!match) return []
  return blogs.filter((blog) => blogTags(blog).some((tag) => blogTagSlug(tag) === match))
}
