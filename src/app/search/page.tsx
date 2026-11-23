import type { Metadata } from 'next'
import Link from 'next/link'
import { Search as SearchIcon } from 'lucide-react'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { getProjectsResult } from '@/lib/projects'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { getPublishedPagesForSitemap } from '@/lib/studio/data'
import { searchDocuments, type SearchDoc } from '@/lib/search'
import { PageHero, PageShell } from '@/components/ui/PageChrome'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search',
  // A query page has nothing of its own to index; the pages it points at do.
  robots: { index: false, follow: true },
}

type CmsRow = {
  title: string
  slug?: string
  payload?: Record<string, unknown> | string
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function descriptionOf(row: CmsRow): string | undefined {
  if (typeof row.payload !== 'object' || !row.payload) return undefined
  for (const key of ['summary', 'description', 'excerpt', 'content']) {
    const value = text(row.payload[key])
    if (value) return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return undefined
}

/**
 * Builds the index from the same published rows the site renders.
 *
 * Nothing is stored: the CMS reads are cached, so a search costs the same rows a
 * page view already paid for. Drafts cannot appear because every getter below is
 * the published-only one.
 */
async function buildIndex(): Promise<SearchDoc[]> {
  const [pages, projects, blogs, experience, skills, certificates] = await Promise.all([
    getPublishedPagesForSitemap(),
    getProjectsResult(),
    getPublishedCmsContent(CMS_COLLECTIONS.blogs),
    getPublishedCmsContent(CMS_COLLECTIONS.experience),
    getPublishedCmsContent(CMS_COLLECTIONS.skills),
    getPublishedCmsContent(CMS_COLLECTIONS.certificates),
  ])

  const docs: SearchDoc[] = [
    { id: 'page-home', kind: 'page', title: 'Home', url: '/', description: 'Portfolio home' },
    { id: 'page-about', kind: 'page', title: 'About', url: '/about' },
    { id: 'page-projects', kind: 'page', title: 'Projects', url: '/projects' },
    { id: 'page-journal', kind: 'page', title: 'Journal', url: '/blogs' },
    { id: 'page-contact', kind: 'page', title: 'Contact', url: '/contact' },
    { id: 'page-gallery', kind: 'page', title: 'Gallery', url: '/about/gallery' },
    { id: 'page-github', kind: 'page', title: 'GitHub activity', url: '/about/github' },
    { id: 'page-media', kind: 'page', title: 'Media', url: '/media' },
  ]

  for (const page of pages) {
    if (page.slug === '/') continue
    docs.push({
      id: `page-${page.slug}`,
      kind: 'page',
      title: page.title,
      description: page.metaDescription || undefined,
      url: page.slug,
    })
  }

  if (projects.status === 'ok') {
    for (const project of projects.data) {
      docs.push({
        id: `project-${project.slug}`,
        kind: 'project',
        title: project.title,
        description: project.summary || project.description,
        url: `/projects/${project.slug}`,
        keywords: project.category ? [project.category] : undefined,
      })
    }
  }

  const collectionDocs: Array<{
    rows: CmsRow[]
    kind: SearchDoc['kind']
    urlFor: (row: CmsRow, index: number) => string
    prefix: string
  }> = [
    {
      rows: blogs as CmsRow[],
      kind: 'journal',
      urlFor: (row) => `/blogs/${row.slug ?? ''}`,
      prefix: 'journal',
    },
    {
      rows: experience as CmsRow[],
      kind: 'profile',
      urlFor: () => '/experience',
      prefix: 'experience',
    },
    { rows: skills as CmsRow[], kind: 'profile', urlFor: () => '/skills', prefix: 'skill' },
    {
      rows: certificates as CmsRow[],
      kind: 'collection',
      urlFor: () => '/certificates',
      prefix: 'certificate',
    },
  ]

  for (const group of collectionDocs) {
    group.rows.forEach((row, index) => {
      if (!row?.title) return
      const url = group.urlFor(row, index)
      if (!url || url.endsWith('/')) return
      docs.push({
        id: `${group.prefix}-${index}-${row.title}`,
        kind: group.kind,
        title: row.title,
        description: descriptionOf(row),
        url,
      })
    })
  }

  return docs
}

const KIND_LABEL: Record<SearchDoc['kind'], string> = {
  page: 'Page',
  project: 'Case study',
  journal: 'Journal',
  collection: 'Collection',
  profile: 'Profile',
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await props.searchParams
  const query = (params.q ?? '').trim().slice(0, 120)
  const hits = query ? searchDocuments(await buildIndex(), query) : []

  return (
    <PageShell>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : 'Search the site'}
        description={
          query
            ? `${hits.length} ${hits.length === 1 ? 'match' : 'matches'} across pages, case studies, journal entries and collections.`
            : 'Find a case study, a journal entry or a page by what it says.'
        }
      />

      <form action="/search" method="get" className="mt-8 flex max-w-xl gap-2" role="search">
        <label className="sr-only" htmlFor="search-q">
          Search term
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Next.js, Postgres, design systems…"
          className="w-full rounded-xl border border-line-subtle bg-surface px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-inverse hover:opacity-90"
        >
          <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-8 text-sm text-muted">
          Type at least two characters. Every word you enter has to appear on the page.
        </p>
      ) : hits.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            eyebrow="Search"
            icon={SearchIcon}
            message={`Nothing matches “${query}” yet.`}
            hint="Try a shorter phrase, a technology name, or browse the case studies and journal instead."
          />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line-hairline border-t border-line-hairline">
          {hits.map((hit) => (
            <li key={hit.id}>
              <Link href={hit.url} className="group flex flex-col gap-1.5 py-4">
                <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {KIND_LABEL[hit.kind]}
                  <span aria-hidden="true">·</span>
                  <span className="normal-case tracking-normal">{hit.url}</span>
                </span>
                <span className="text-base font-semibold text-ink group-hover:text-accent">
                  {hit.title}
                </span>
                {hit.snippet && (
                  <span className="text-sm leading-relaxed text-ink-secondary">{hit.snippet}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
