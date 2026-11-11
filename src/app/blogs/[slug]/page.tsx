import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock } from 'lucide-react'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { toSlug } from '@/lib/slug'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_COLLECTIONS, CMS_SCHEMA, type CmsResult } from '@/lib/cms-schema'
import { uiStrings } from '@/lib/ui-strings'
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
  if (result.status !== 'ok' || !result.data) return { title: uiStrings.journal.label.en }
  const blog = result.data
  const payload = readPayload(blog)
  const description = getBody(blog).slice(0, 160)
  const image = typeof payload.imageUrl === 'string' ? payload.imageUrl : undefined
  return {
    title: `${blog.title} — ${uiStrings.journal.label.en}`,
    ...(description ? { description } : {}),
    ...(image
      ? {
          openGraph: {
            title: blog.title,
            ...(description ? { description } : {}),
            images: [{ url: image }],
          },
        }
      : {}),
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
        eyebrow={
          category ? uiStrings.journal.eyebrow(category) : uiStrings.journal.label.en
        }
        krEyebrow={uiStrings.journal.krEyebrow.en}
        title={blog.title}
        description={`${date ? `${date} · ` : ''}${uiStrings.journal.minRead(minutes)}`}
        meta={
          <>
            <MetaChip icon={Clock}>{uiStrings.journal.minRead(minutes)}</MetaChip>
            <MetaChip>{uiStrings.journal.words(words)}</MetaChip>
            {date && <MetaChip>{date}</MetaChip>}
          </>
        }
      />

      {paragraphs.length ? (
        <article className="mt-10 md:mt-14 max-w-3xl space-y-5">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm md:text-base text-ink-secondary leading-7">
              {paragraph}
            </p>
          ))}
        </article>
      ) : (
        <div className="mt-10 md:mt-14">
          <EmptyState
            icon={NotebookPen}
            message={CMS_SCHEMA.sections.home.blogArticle.emptyState.message}
            hint={CMS_SCHEMA.sections.home.blogArticle.emptyState.hint}
            actionLabel={CMS_SCHEMA.sections.home.blogArticle.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.sections.home.blogArticle.emptyState.actionHref}
          />
        </div>
      )}

      <PageNav
        backHref="/blogs"
        backLabel={uiStrings.journal.allNotes.en}
        nextHref="/contact"
        nextLabel={uiStrings.journal.startConversation.en}
      />
    </PageShell>
  )
}
