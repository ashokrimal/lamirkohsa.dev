import Link from 'next/link'
import type { Metadata } from 'next'
import { Clock, ArrowUpRight, BookOpen } from 'lucide-react'
import EmptyCollectionState from '@/components/EmptyCollectionState'
import { getPublishedCmsContent } from '@/app/actions/content-cms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Journal & Notes - Ashok Rimal',
  description: 'Essays, field observations, and architectural notes by Ashok Rimal with estimated reading times.',
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
  payload?: BlogPayload | unknown
  sortOrder?: number
}

/**
 * Calculates estimated reading time for a blog post based on word count.
 * Average reading speed: 200 words per minute (industry standard).
 */
function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
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
  const blogs = (await getPublishedCmsContent('Blogs')) as Blog[]

  return (
    <main className="collection-page shell-width">
      {/* Header section with calm editorial typography */}
      <header className="collection-intro space-y-3 pb-8 border-b border-[var(--line)]">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--muted)]">
          Journal / Essays &amp; Notes
        </p>
        <h1 className="text-4xl md:text-6xl font-normal tracking-[-0.07em] text-[var(--ink)] leading-[0.95]">
          Notes in <span className="font-serif italic text-[var(--accent)]">progress.</span>
        </h1>
        <p className="text-sm md:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
          Essays, architectural experiments, and field observations on software design, pedagogical robotics, and calm digital craft.
        </p>
      </header>

      {blogs && blogs.length > 0 ? (
        <div className="blog-index-grid my-10">
          {blogs.map((blog, index) => {
            const body = getBlogText(blog)
            // Calculate reading time based on post title + body content
            const fullContent = `${blog.title}. ${body}`
            const readingTime = calculateReadingTime(fullContent)
            const category = getBlogCategory(blog)
            const date = getBlogDate(blog)

            return (
              <article
                className="blog-index-card rounded-sm border border-[var(--line)] bg-[var(--surface)] p-6 md:p-7 flex flex-col justify-between transition-all"
                key={blog.id}
              >
                <div>
                  {/* Card Meta Top: Note index, category, and calculated reading time badge */}
                  <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--line)]/60">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                      {String(index + 1).padStart(2, '0')} / {category}
                    </span>

                    {/* Reading time badge based on content length */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[var(--paper)] border border-[var(--line)] text-[11px] font-mono font-medium text-[var(--accent)]"
                      title={`Estimated reading time: ~${readingTime.words} words at 200 WPM`}
                    >
                      <Clock className="w-3 h-3 text-[var(--accent)]" />
                      <span>{readingTime.text}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl md:text-2xl font-normal text-[var(--ink)] tracking-[-0.04em] leading-snug">
                    {blog.title}
                  </h2>

                  {/* Body excerpt */}
                  <p className="mt-3 text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                    {body}
                  </p>
                </div>

                {/* Card Footer: Read note link and word count breakdown */}
                <div className="mt-6 pt-4 flex items-center justify-between border-t border-[var(--line)]/60 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-[var(--accent)] group hover:underline">
                    Read note <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--muted)]">
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

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-[var(--line)] flex items-center justify-between text-xs">
        <Link href="/" className="text-link inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--ink)]">
          ← Back to home
        </Link>
        <Link href="/contact" className="text-link inline-flex items-center gap-1 text-[var(--accent)] font-semibold hover:underline">
          Start a conversation ↗
        </Link>
      </div>
    </main>
  )
}
