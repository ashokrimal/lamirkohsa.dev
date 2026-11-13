import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight, Clock, NotebookPen } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { CMS_COLLECTIONS, CMS_SCHEMA } from '@/lib/cms-schema'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { toSlug } from '@/lib/slug'
import { getPageCopy } from '@/lib/site-content'
import { uiStrings } from '@/lib/ui-strings'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.journal : undefined, {
    title: CMS_SCHEMA.sections.pages.blogs.label,
  })
}

interface BlogPayload {
  description?: string
  content?: string
  body?: string
  category?: string
  date?: string
  imageUrl?: string
}

type Blog = {
  id: number
  title: string
  slug?: string
  payload?: BlogPayload | unknown
  sortOrder?: number
}

/**
 * Calculates estimated reading time for a blog post based on word count.
 * Average reading speed: 200 words per minute (industry standard).
 */
function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200,
): { minutes: number; text: string; words: number } {
  if (!content || typeof content !== 'string') {
    return { minutes: 1, text: uiStrings.journal.minRead(1), words: 0 }
  }

  // Strip HTML tags and markdown formatting to count real words
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`~>]/g, ' ')
    .trim()

  const words = cleanContent.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))

  return {
    minutes,
    text: uiStrings.journal.minRead(minutes),
    words,
  }
}

function getBlogText(blog: Blog): string {
  if (typeof blog.payload === 'object' && blog.payload !== null) {
    const p = blog.payload as Record<string, unknown>
    if (typeof p.content === 'string' && p.content) return p.content
    if (typeof p.description === 'string' && p.description) return p.description
    if (typeof p.body === 'string' && p.body) return p.body
  }
  if (typeof blog.payload === 'string') {
    return blog.payload
  }
  return ''
}

function getBlogCategory(blog: Blog): string | undefined {
  if (typeof blog.payload === 'object' && blog.payload !== null) {
    const p = blog.payload as Record<string, unknown>
    if (typeof p.category === 'string' && p.category) return p.category
  }
  return undefined
}

function getBlogDate(blog: Blog): string | undefined {
  if (typeof blog.payload === 'object' && blog.payload !== null) {
    const p = blog.payload as Record<string, unknown>
    if (typeof p.date === 'string' && p.date) return p.date
  }
  return undefined
}

export default async function BlogsPage() {
  const [blogsResult, copyResult] = await Promise.all([
    getPublishedCmsContentResult(CMS_COLLECTIONS.blogs),
    getPageCopy(),
  ])
  const blogs = (blogsResult.status === 'ok' ? blogsResult.data : []) as Blog[]
  const pageCopy = copyResult.status === 'ok' ? copyResult.data.journal : undefined

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? CMS_SCHEMA.sections.pages.blogs.label}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
        meta={
          blogs.length ? (
            <MetaChip icon={Clock}>{uiStrings.journal.publishedNotes(blogs.length)}</MetaChip>
          ) : undefined
        }
      />

      {blogsResult.status === 'error' ? (
        <div className="mt-10 md:mt-14">
          <CmsErrorState message={blogsResult.message} />
        </div>
      ) : blogs.length > 0 ? (
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog, index) => {
            const body = getBlogText(blog)
            // Reading time is based on post title + body content
            const readingTime = calculateReadingTime(`${blog.title}. ${body}`)
            const category = getBlogCategory(blog)
            const date = getBlogDate(blog)
            const href = `/blogs/${blog.slug || toSlug(blog.title)}`

            return (
              <article
                className="apple-card overflow-hidden flex flex-col justify-between"
                key={blog.id}
              >
                <div className="p-6 md:p-7">
                  {/* Card meta: index, category, reading time */}
                  <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-line-subtle">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                      {String(index + 1).padStart(2, '0')}
                      {category ? ` / ${category}` : ''}
                    </span>

                    <div
                      className="inline-flex items-center gap-1.5 rounded-full bg-overlay px-3 py-1 text-[11px] font-mono text-ink-secondary border border-line-subtle"
                      title={uiStrings.journal.readingTimeTitle(readingTime.words)}
                    >
                      <Clock className="w-3 h-3 text-accent" />
                      <span>{readingTime.text}</span>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-semibold text-ink tracking-[-0.03em] leading-snug">
                    <Link href={href} className="hover:text-accent transition-colors">
                      {blog.title}
                    </Link>
                  </h2>

                  {body && (
                    <p className="mt-3 text-xs md:text-sm text-muted leading-relaxed line-clamp-4">
                      {body}
                    </p>
                  )}
                </div>

                <div className="px-6 md:px-7 pb-6 pt-4 flex items-center justify-between border-t border-line-subtle text-xs">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                  >
                    {uiStrings.journal.readNote.en}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                    {date && <span>{date} · </span>}
                    <span>{uiStrings.journal.words(readingTime.words)}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-10 md:mt-14">
          <EmptyState
            icon={NotebookPen}
            message={CMS_SCHEMA.sections.pages.blogs.emptyState.message}
            hint={CMS_SCHEMA.sections.pages.blogs.emptyState.hint}
            actionLabel={CMS_SCHEMA.sections.pages.blogs.emptyState.actionLabel}
            actionHref={CMS_SCHEMA.sections.pages.blogs.emptyState.actionHref}
          />
        </div>
      )}

      <PageNav />
    </PageShell>
  )
}
