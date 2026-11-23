/**
 * RSS 2.0 for the journal.
 *
 * The feed is built from a pure function so the XML — and the escaping that
 * makes it safe with arbitrary CMS text — can be tested without a database or a
 * request. Nothing is written by hand into the channel: the site name, origin
 * and path all come from the same constants the pages use.
 */

export type FeedItem = {
  title: string
  /** Absolute URL of the entry. */
  link: string
  description?: string
  published?: Date | null
}

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/** Escapes text and attribute content; a CMS title is never trusted as XML. */
export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ENTITIES[character])
}

/** RFC 822 is what RSS readers parse; ISO 8601 in a pubDate is ignored by some. */
export function toRfc822(date: Date): string {
  return date.toUTCString()
}

export function buildRssFeed({
  title,
  description,
  siteUrl,
  feedPath,
  items,
  lastBuildDate = new Date(),
  language = 'en',
}: {
  title: string
  description: string
  siteUrl: string
  feedPath: string
  items: FeedItem[]
  lastBuildDate?: Date
  language?: string
}): string {
  const home = siteUrl.replace(/\/+$/, '')
  const feedUrl = `${home}${feedPath.startsWith('/') ? feedPath : `/${feedPath}`}`
  // The channel's build date is the newest entry the feed carries; a reader
  // treats it as "this feed changed then", so the latest item is the honest one.
  let newest = lastBuildDate
  for (const item of items) {
    if (item.published && item.published.getTime() > newest.getTime()) newest = item.published
  }

  const entries = items
    .map((item) => {
      const lines = [
        '    <item>',
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
        ...(item.description
          ? [`      <description>${escapeXml(item.description)}</description>`]
          : []),
        ...(item.published ? [`      <pubDate>${toRfc822(item.published)}</pubDate>`] : []),
        '    </item>',
      ]
      return lines.join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(`${home}/blogs`)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${escapeXml(language)}</language>`,
    `    <lastBuildDate>${toRfc822(newest)}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    entries,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter((line) => line !== '')
    .join('\n')
}
