import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock } from 'lucide-react'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { toSlug } from '@/lib/slug'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_COLLECTIONS, CMS_SCHEMA, type CmsResult } from '@/lib/cms-schema'
import { NotebookPen } from 'lucide-react'

export const revalidate = 300

type Blog = {
  id: number
  title: string
  slug?: string
  payload?: Record<string, unknown> | string
}

function readPayload(blog: Blog): Record<string, unknown> {
  return typeof blog.payload === 'object' && blog.payload !== null
    ? (blog.payload as Record<string, unknown>)
    : {}
}

function getBody(blog: Blog): string {
  const p = readPayload(blog)
  for (const key of ['content', 'body', 'description']) {
    if (typeof p[key] === 'string' && p[key]) return p[key] as string
  }
  return typeof blog.payload === 'string' ? blog.payload : ''
}

function readingTime(text: string) {
  const words = text
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) }
}

async function findBlog(slug: string): Promise<CmsResult<Blog | undefined>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.blogs)
  if (result.status !== 'ok') return result
  return {
    status: 'ok',
    data: (result.data as Blog[]).find((blog) => (blog.slug || toSlug(blog.title)) === slug),
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const result = await findBlog(params.slug)
  if (result.status !== 'ok' || !result.data) return { title: 'Journal - Ashok Rimal' }
  const blog = result.data
  return {
    title: `${blog.title} — Journal | Ashok Rimal`,
    description: getBody(blog).slice(0, 160),
  }
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const result = await findBlog(params.slug)
  if (result.status === 'error') {
    return (
      <PageShell>
        <CmsErrorState message={result.message} className="mt-12" />
        <PageNav backHref="/blogs" />
      </PageShell>
    )
  }
  if (result.status !== 'ok' || !result.data) notFound()
  const blog = result.data

  const payload = readPayload(blog)
  const body = getBody(blog)
  const { words, minutes } = readingTime(body)
  const category = typeof payload.category === 'string' ? payload.category : undefined
  const date = typeof payload.date === 'string' ? payload.date : undefined
  const paragraphs = body
    .replace(/<[^>]*>/g, '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <PageShell>
      <PageHero
        eyebrow={category ? `Journal / ${category}` : 'Journal'}
        krEyebrow="글"
        title={blog.title}
        description={`${date ? `${date} · ` : ''}${minutes} min read`}
        meta={
          <>
            <MetaChip icon={Clock}>{minutes} min read</MetaChip>
            <MetaChip>{words} words</MetaChip>
            {date && <MetaChip>{date}</MetaChip>}
          </>
        }
      />

      <article className="mt-10 md:mt-14 max-w-3xl space-y-5">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm md:text-base text-ink-secondary leading-7">
            {paragraph}
          </p>
        ))}
      </article>

      <PageNav
        backHref="/blogs"
        backLabel="All notes"
        nextHref="/contact"
        nextLabel="Start a conversation"
      />
    </PageShell>
  )
}
