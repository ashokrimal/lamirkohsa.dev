import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle2, Route } from 'lucide-react'
import { requireAdminStudio } from '@/lib/admin-page-auth'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS, NAV_ROUTES } from '@/lib/cms-schema'
import { getPublishedPagesForSitemap, normalizePageSlug, getPublishedProjects } from '@/lib/studio/data'
import { getProjectsResult } from '@/lib/projects'
import { toSlug } from '@/lib/slug'
import {
  analyzeSlugRedirects,
  listSlugRedirects,
  type SlugRedirectIssue,
} from '@/lib/slug-history'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Redirects',
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function knownPublicPaths(): Promise<Set<string>> {
  const [blogsResult, projectsResult, studioProjects, pages] = await Promise.all([
    getPublishedCmsContentResult(CMS_COLLECTIONS.blogs),
    getProjectsResult(),
    getPublishedProjects(),
    getPublishedPagesForSitemap(),
  ])

  const paths = new Set<string>(NAV_ROUTES)
  paths.add('/')
  for (const route of [
    '/about/gallery',
    '/about/github',
    '/media/music',
    '/media/movies',
    '/media/anime',
    '/media/manga',
  ]) {
    paths.add(route)
  }

  if (blogsResult.status === 'ok') {
    for (const blog of blogsResult.data) {
      paths.add(`/blogs/${blog.slug || toSlug(blog.title)}`)
    }
  }
  if (projectsResult.status === 'ok') {
    for (const project of projectsResult.data) {
      paths.add(`/projects/${project.slug}`)
    }
  }
  for (const project of studioProjects) {
    paths.add(`/projects/${project.slug}`)
  }
  for (const page of pages) {
    paths.add(normalizePageSlug(page.slug))
  }

  return paths
}

function IssueBadge({ issues }: { issues: SlugRedirectIssue[] }) {
  if (issues.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Healthy
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
      <AlertTriangle className="h-3 w-3" /> {issues.length} issue{issues.length === 1 ? '' : 's'}
    </span>
  )
}

/**
 * The rename table, visible.
 *
 * Every redirect the site records is listed with how often it fired and when it
 * last did. A redirect is not just "present": it is diagnosed against the set of
 * pages the site actually publishes, so a loop, a chain or a destination that no
 * longer exists shows up here instead of only in a crawler report.
 */
export default async function AdminRedirectsPage() {
  await requireAdminStudio('/admin/redirects')

  const [rows, known] = await Promise.all([listSlugRedirects(), knownPublicPaths()])
  const issues = analyzeSlugRedirects(rows, known)
  const broken = [...issues.entries()].filter(([, list]) => list.length > 0)
  const totalHits = rows.reduce((sum, row) => sum + row.hits, 0)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Discovery</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Slug redirects</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Renaming a journal entry or case study records a permanent redirect here. Old links keep
            working and this table shows whether they still lead somewhere real.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <strong className="text-slate-900">{rows.length}</strong> redirects
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <strong className="text-slate-900">{totalHits}</strong> hits served
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <strong className={broken.length ? 'text-amber-700' : 'text-emerald-700'}>
              {broken.length}
            </strong>{' '}
            needing review
          </span>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Route className="mx-auto h-6 w-6 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No redirects recorded yet.</p>
          <p className="mt-1 text-xs text-slate-500">
            Rename a slug in{' '}
            <Link href="/admin/blogs" className="font-medium text-teal-700 hover:underline">
              Blogs
            </Link>{' '}
            or{' '}
            <Link href="/admin/projects" className="font-medium text-teal-700 hover:underline">
              Projects
            </Link>{' '}
            and the old URL will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Old path</th>
                <th className="px-4 py-3 font-semibold">Now serves</th>
                <th className="px-4 py-3 font-semibold">Collection</th>
                <th className="px-4 py-3 font-semibold">Hits</th>
                <th className="px-4 py-3 font-semibold">Last hit</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const rowIssues = issues.get(row.from) ?? []
                return (
                  <tr key={row.from} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{row.from}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700">
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        {row.to}
                      </span>
                      {rowIssues.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {rowIssues.map((issue) => (
                            <li key={`${issue.kind}-${issue.message}`} className="text-[10px] text-amber-700">
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.collection || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.hits}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(row.lastHitAt)}</td>
                    <td className="px-4 py-3">
                      <IssueBadge issues={rowIssues} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Broken inbound links</h2>
        <p className="mt-1 text-xs text-slate-500">
          A redirect that points at a page the site no longer publishes would send a visitor to a
          404 with a 301 in front of it. These rows need the destination corrected.
        </p>
        {broken.length === 0 ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Every redirect lands on a published page.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-xs">
            {broken.map(([from, list]) => (
              <li key={from} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-mono text-[11px] text-slate-700">{from}</span>
                <span className="text-slate-500">{list.map((issue) => issue.message).join(' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
