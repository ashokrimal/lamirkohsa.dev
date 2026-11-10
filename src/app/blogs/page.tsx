import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight, Clock } from 'lucide-react'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { MetaChip, PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { toSlug } from '@/lib/slug'
import { getPageCopy } from '@/lib/site-content'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Journal & Notes - Ashok Rimal',
  description:
    'Essays, field observations, and architectural notes by Ashok Rimal with estimated reading times.',
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
    return { minutes: 1, text: '1 min read', words: 0 }
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
    text: `${minutes} min read`,
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
  return 'A new note from the studio.'
}

function getBlogCategory(blog: Blog): string {
  if (typeof blog.payload === 'object' && blog.payload !== null) {
    const p = blog.payload as Record<string, unknown>
    if (typeof p.category === 'string' && p.category) return p.category
  }
  return 'Note'
}

function getBlogDate(blog: Blog): string | undefined {
  if (typeof blog.payload === 'object' && blog.payload !== null) {
    const p = blog.payload as Record<string, unknown>
    if (typeof p.date === 'string' && p.date) return p.date
  }
  return undefined
}

export default async function BlogsPage() {
  const [blogsRaw, copy] = await Promise.all([getPublishedCmsContent('Blogs'), getPageCopy()])
  const blogs = blogsRaw as Blog[]
  const pageCopy = copy.journal

  return (
    <PageShell>
      <PageHero
        eyebrow={pageCopy?.eyebrow ?? ''}
        krEyebrow={pageCopy?.krEyebrow}
        title={pageCopy?.title ?? ''}
        accent={pageCopy?.accent}
        description={pageCopy?.description}
        meta={
          blogs.length ? (
            <MetaChip icon={Clock}>{blogs.length} published notes</MetaChip>
          ) : undefined
        }
      />

      {blogs && blogs.length > 0 ? (
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
                      {String(index + 1).padStart(2, '0')} / {category}
                    </span>

                    <div
                      className="inline-flex items-center gap-1.5 rounded-full bg-overlay px-3 py-1 text-[11px] font-mono text-ink-secondary border border-line-subtle"
                      title={`Estimated reading time: ~${readingTime.words} words at 200 WPM`}
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

                  <p className="mt-3 text-xs md:text-sm text-muted leading-relaxed line-clamp-4">
                    {body}
                  </p>
                </div>

                <div className="px-6 md:px-7 pb-6 pt-4 flex items-center justify-between border-t border-line-subtle text-xs">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                  >
                    Read note
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                    {date && <span>{date} · </span>}
                    <span>~{readingTime.words} words</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyCollectionState
          eyebrow="Journal / Empty"
          title="The first note is still forming."
          description="Essays, experiments, and observations will appear here when they are ready to share."
          action={{ label: 'Return home', href: '/' }}
        />
      )}

      <PageNav />
    </PageShell>
  )
}
