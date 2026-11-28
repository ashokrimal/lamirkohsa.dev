import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getPublishedCmsContentResult } from '@/lib/cms-content'
import {
  blogBody,
  blogExcerpt,
  blogPayload,
  blogReadingTime,
  blogSlug as slugOf,
  blogTagPath,
  blogTagSlug,
  blogTags,
} from '@/lib/blog-article'
import { MetaChip, PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { CmsErrorState } from '@/components/ui/CmsState'
import { BlogArticleBody } from '@/components/blogs/BlogArticleBody'
import { CMS_COLLECTIONS, CMS_SCHEMA, type CmsResult } from '@/lib/cms-schema'
import { getUiCopy } from '@/lib/ui-copy'
import { articleMetadata } from '@/lib/seo'
import { snippet } from '@/lib/snippets'
import { blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/structured-data'
import { bumpSlugRedirectHit, resolveSlugRedirect } from '@/lib/slug-history'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300

type Blog = {
  id: number
  title: string
  slug?: string
  payload?: Record<string, unknown> | string
  updatedAt?: string | Date
}

async function findBlog(slug: string): Promise<CmsResult<Blog | undefined>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.blogs)
  if (result.status !== 'ok') return result
  return {
    status: 'ok',
    data: (result.data as Blog[]).find((blog) => slugOf(blog) === slug),
  }
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>
  }
): Promise<Metadata> {
  const uiStrings = await getUiCopy()
  const params = await props.params;
  const result = await findBlog(params.slug)
  if (result.status === 'error') return { title: uiStrings.journal.label.en }
  if (result.status !== 'ok' || !result.data) {
    const renamed = await resolveSlugRedirect(`/blogs/${params.slug}`)
    if (renamed) permanentRedirect(renamed)
    notFound()
  }
  const blog = result.data
  const payload = blogPayload(blog)
  const description = snippet(blogExcerpt(blog))
  const image =
    (typeof payload.coverUrl === 'string' && payload.coverUrl) ||
    (typeof payload.imageUrl === 'string' && payload.imageUrl) ||
    undefined
  const date =
    (typeof payload.publishAt === 'string' && payload.publishAt) ||
    (typeof payload.date === 'string' && payload.date) ||
    undefined
  const publishedTime =
    date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined

  return articleMetadata({
    title: blog.title,
    description,
    path: `/blogs/${slugOf(blog)}`,
    image,
    tags: blogTags(blog),
    publishedTime,
  })
}

export default async function BlogArticlePage(props: { params: Promise<{ slug: string }> }) {
  const uiStrings = await getUiCopy()
  const params = await props.params;
  const result = await findBlog(params.slug)
  if (result.status === 'error') {
    return (
      <PageShell>
        <CmsErrorState message={result.message} className="mt-12" />
        <PageNav backHref="/blogs" />
      </PageShell>
    )
  }
  if (result.status !== 'ok' || !result.data) {
    // A slug corrected in the studio keeps its old URL working.
    const renamed = await resolveSlugRedirect(`/blogs/${params.slug}`)
    if (renamed) {
      await bumpSlugRedirectHit(`/blogs/${params.slug}`)
      permanentRedirect(renamed)
    }
    notFound()
  }
  const blog = result.data

  const payload = blogPayload(blog)
  const body = blogBody(blog)
  const { words, minutes } = blogReadingTime(body)
  const category = typeof payload.category === 'string' ? payload.category : undefined
  const date = typeof payload.date === 'string' ? payload.date : undefined
  const tags = blogTags(blog).filter((tag) => blogTagSlug(tag))

  const description = snippet(blogExcerpt(blog))
  const coverImage =
    (typeof payload.coverUrl === 'string' && payload.coverUrl) ||
    (typeof payload.imageUrl === 'string' && payload.imageUrl) ||
    undefined
  const publishedTime =
    date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined
  const modifiedTime = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined
  const slug = slugOf(blog)

  return (
    <PageShell>
      <JsonLd
        data={blogPostingJsonLd({
          title: blog.title,
          description,
          path: `/blogs/${slug}`,
          image: coverImage,
          publishedTime,
          modifiedTime,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Journal', path: '/blogs' },
          { name: blog.title, path: `/blogs/${slug}` },
        ])}
      />
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

      <BlogArticleBody
        body={body}
        emptyMessage={CMS_SCHEMA.sections.home.blogArticle.emptyState.message}
        emptyHint={CMS_SCHEMA.sections.home.blogArticle.emptyState.hint}
      />

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
            {uiStrings.journal.tagsLabel.en}
          </span>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={blogTagPath(tag)}
              className="rounded-full border border-line-subtle bg-surface/70 px-3 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:border-line-medium hover:text-accent"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <PageNav
        nextHref="/contact"
        nextLabel={uiStrings.journal.startConversation.en}
      />
    </PageShell>
  )
}
