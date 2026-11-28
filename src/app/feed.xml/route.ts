import { getPublishedCmsContentResult } from '@/lib/cms-content'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { buildRssFeed, type FeedItem } from '@/lib/rss'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { toSlug } from '@/lib/slug'

export const revalidate = 3600

type Blog = {
  title: string
  slug?: string
  payload?: Record<string, unknown> | string
  createdAt?: string | Date
  updatedAt?: string | Date
}

function payloadOf(blog: Blog): Record<string, unknown> {
  return blog.payload && typeof blog.payload === 'object' ? blog.payload : {}
}

function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function summaryOf(blog: Blog): string | undefined {
  const payload = payloadOf(blog)
  for (const key of ['excerpt', 'summary', 'description', 'content', 'body']) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return plainText(value).slice(0, 400)
  }
  return undefined
}

function publishedOf(blog: Blog): Date | null {
  const payload = payloadOf(blog)
  for (const value of [payload.publishAt, payload.date, blog.createdAt, blog.updatedAt]) {
    if (typeof value !== 'string' && !(value instanceof Date)) continue
    const date = value instanceof Date ? value : new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return null
}

/**
 * The journal as RSS.
 *
 * Subscribers, readers and feed readers get the same published set the journal
 * page shows; drafts never appear because the read is the published-only CMS
 * query. An empty journal still answers with a valid (empty) channel rather than
 * a 404, so a reader keeps the subscription.
 */
export async function GET() {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.blogs)
  const blogs = result.status === 'ok' ? (result.data as Blog[]) : []

  const items: FeedItem[] = blogs.filter((blog) => Boolean(blog.title)).map((blog) => {
    const slug = blog.slug || toSlug(blog.title)
    return {
      title: blog.title,
      link: `${SITE_URL}/blogs/${slug}`,
      description: summaryOf(blog),
      published: publishedOf(blog),
    }
  })

  const xml = buildRssFeed({
    title: `${SITE_NAME} — Journal`,
    description: 'Notes on product engineering, interfaces and systems.',
    siteUrl: SITE_URL,
    feedPath: '/feed.xml',
    items,
  })

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
