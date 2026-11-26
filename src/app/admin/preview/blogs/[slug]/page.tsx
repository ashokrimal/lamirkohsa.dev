import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowUpRight, Clock } from 'lucide-react'
import { getAdminContent } from '@/app/actions/content'
import { hasOwnerAccess } from '@/lib/admin-auth'
import { CMS_COLLECTIONS, CMS_SCHEMA } from '@/lib/cms-schema'
import { getUiCopy } from '@/lib/ui-copy'
import {
  blogBody,
  blogPayload,
  blogReadingTime,
  blogSlug,
  blogTagSlug,
  blogTags,
  type BlogRecord,
} from '@/lib/blog-article'
import { MetaChip, PageHero, PageShell } from '@/components/ui/PageChrome'
import { PageNav } from '@/components/ui/PageNav'
import { BlogArticleBody } from '@/components/blogs/BlogArticleBody'

/**
 * Owner-only preview of a journal entry, drafts included.
 *
 * It reads the studio query (every record for the signed-in owner, straight from
 * Postgres) rather than the published CMS cache, so an unsaved-to-public draft
 * renders here without ever entering the ISR cache the public pages read. The
 * route lives under /admin, which already sends `X-Robots-Tag: noindex`, and the
 * session check below is the same one the studio uses — a signed-out visitor is
 * sent to sign in and comes back to the same preview.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Journal preview',
  robots: { index: false, follow: false, nocache: true },
}

function findBySlug(records: BlogRecord[], slug: string): BlogRecord | undefined {
  return records.find((record) => blogSlug(record) === slug)
}

export default async function BlogPreviewPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const previewPath = `/admin/preview/blogs/${params.slug}`

  if (!(await hasOwnerAccess())) {
    redirect(`/admin/sign-in?returnTo=${encodeURIComponent(previewPath)}`)
  }

  const { cms } = await getAdminContent()
  const blog = findBySlug(
    cms.filter((record) => record.collection.toLowerCase() === CMS_COLLECTIONS.blogs.toLowerCase()),
    params.slug,
  )
  if (!blog) notFound()

  const uiStrings = await getUiCopy()
  const payload = blogPayload(blog)
  const body = blogBody(blog)
  const { words, minutes } = blogReadingTime(body)
  const category = typeof payload.category === 'string' ? payload.category : undefined
  const date = typeof payload.date === 'string' ? payload.date : undefined
  const tags = blogTags(blog).filter((tag) => blogTagSlug(tag))
  const published = blog.status === 'published'
  const livePath = `/blogs/${blogSlug(blog)}`

  return (
    <PageShell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line-medium bg-overlay-faint/40 px-4 py-3 text-xs text-ink-secondary">
        <p className="min-w-0">
          <span className="font-semibold uppercase tracking-[0.14em] text-muted">Preview</span>{' '}
          {published ? 'Published entry.' : 'Draft entry.'} Only a signed-in owner can see this
          page, and it is never cached for visitors.
        </p>
        <div className="flex items-center gap-3 font-medium">
          {published && (
            <Link href={livePath} className="inline-flex items-center gap-1 text-accent hover:underline">
              Live page <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
          <Link href="/admin" className="text-muted hover:text-ink">
            Back to studio
          </Link>
        </div>
      </div>

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
            <span
              key={tag}
              className="rounded-full border border-line-subtle bg-surface/70 px-3 py-1 text-[11px] font-medium text-ink-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <PageNav backHref="/admin" backLabel="Studio" nextHref={published ? livePath : undefined} nextLabel={published ? uiStrings.journal.readNote.en : undefined} />
    </PageShell>
  )
}
