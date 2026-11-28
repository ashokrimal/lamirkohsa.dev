import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import { getPublishedCmsContentResult } from '@/lib/cms-content'
import { CMS_COLLECTIONS, CMS_SCHEMA } from '@/lib/cms-schema'
import {
  blogDate,
  blogExcerpt,
  blogPayload,
  blogReadingTime,
  blogSlug,
  blogTagLabel,
  blogTagSlug,
  blogsWithTag,
  type BlogRecord,
} from '@/lib/blog-article'
import { snippet } from '@/lib/snippets'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'
import { MetaChip, PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { CmsErrorState } from '@/components/ui/CmsState'
import { getUiCopy } from '@/lib/ui-copy'

/**
 * One landing page per published journal tag.
 *
 * Tags are free text on a journal entry, so this route is built from the
 * published set rather than from a registry: a tag exists exactly while a
 * published entry carries it. A slug that matches nothing is a 404, not an
 * empty page, and `/blogs` plus every article link here.
 */

export const revalidate = 300

type Blog = BlogRecord & { id: number }

async function readBlogs(): Promise<Blog[]> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.blogs)
  return result.status === 'ok' ? (result.data as Blog[]) : []
}

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await props.params
  const slug = blogTagSlug(tag)
  if (!slug) return { title: CMS_SCHEMA.sections.pages.blogs.label }

  const blogs = await readBlogs()
  const entries = blogsWithTag(blogs, slug)
  if (!entries.length) return { title: CMS_SCHEMA.sections.pages.blogs.label }

  const label = blogTagLabel(blogs, slug) ?? slug.replace(/-/g, ' ')
  return pageMetadata(
    undefined,
    {
      title: `${label} — ${CMS_SCHEMA.sections.pages.blogs.label}`,
      description: `${entries.length} journal ${entries.length === 1 ? 'note' : 'notes'} tagged ${label}.`,
    },
    `/blogs/tag/${slug}`,
  )
}

export default async function BlogTagPage(props: { params: Promise<{ tag: string }> }) {
  const { tag } = await props.params
  const slug = blogTagSlug(tag)
  if (!slug) notFound()

  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.blogs)
  if (result.status === 'error') {
    return (
      <PageShell>
        <CmsErrorState message={result.message} className="mt-12" />
        <PageNav backHref="/blogs" />
      </PageShell>
    )
  }

  const blogs = (result.status === 'ok' ? result.data : []) as Blog[]
  const entries = blogsWithTag(blogs, slug) as Blog[]
  if (!entries.length) notFound()

  const uiStrings = await getUiCopy()
  const label = blogTagLabel(blogs, slug) ?? slug.replace(/-/g, ' ')

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: CMS_SCHEMA.sections.pages.blogs.label, path: '/blogs' },
          { name: label, path: `/blogs/tag/${slug}` },
        ])}
      />
      <PageHero
        eyebrow={uiStrings.journal.tagEyebrow.en}
        krEyebrow={uiStrings.journal.krEyebrow.en}
        title={label}
        description={uiStrings.journal.tagDescription(entries.length, label)}
        meta={
          <MetaChip icon={Clock}>{uiStrings.journal.publishedNotes(entries.length)}</MetaChip>
        }
      />

      <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((blog, index) => {
          const body = blogExcerpt(blog)
          const readingTime = blogReadingTime(`${blog.title}. ${body}`)
          const payload = blogPayload(blog)
          const category = typeof payload.category === 'string' ? payload.category : undefined
          const date = blogDate(blog)
          const href = `/blogs/${blogSlug(blog)}`

          return (
            <article className="apple-card overflow-hidden flex flex-col justify-between" key={blog.id}>
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-line-subtle">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                    {String(index + 1).padStart(2, '0')}
                    {category ? ` / ${category}` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-overlay px-3 py-1 text-[11px] font-mono text-ink-secondary border border-line-subtle">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>{uiStrings.journal.minRead(readingTime.minutes)}</span>
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-ink tracking-[-0.03em] leading-snug">
                  <Link href={href} className="hover:text-accent transition-colors">
                    {blog.title}
                  </Link>
                </h2>

                {body && (
                  <p className="mt-3 text-xs md:text-sm text-muted leading-relaxed line-clamp-4">
                    {snippet(body)}
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

      <PageNav backHref="/blogs" backLabel={uiStrings.journal.backToJournal.en} />
    </PageShell>
  )
}
