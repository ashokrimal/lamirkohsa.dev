import { redirect } from 'next/navigation'
import { BlobCleanupButton } from '@/components/admin/BlobCleanupButton'
import { findOrphanedBlobs, buildReferenceCorpus } from '@/lib/blob-audit'
import { getAdminActorId } from '@/lib/admin-auth'
import { blobToken } from '@/lib/blob'
import { list } from '@vercel/blob'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

const GRACE_MS = 24 * 60 * 60 * 1000

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function readContentValues(): Promise<unknown[]> {
  const values: unknown[] = []
  const cms = await pool.query<{ payload: unknown }>(`select "payload" from "cmsContent"`).catch(() => null)
  if (cms) values.push(...cms.rows.map((row) => row.payload))
  const sections = await pool
    .query<{ content_json: unknown }>(`select "content_json" from "page_sections"`)
    .catch(() => null)
  if (sections) values.push(...sections.rows.map((row) => row.content_json))
  const projects = await pool
    .query(`select "cover_media_url","live_url","repo_url" from "projects"`)
    .catch(() => null)
  if (projects) values.push(...projects.rows)
  const settings = await pool
    .query<{ social_links: unknown }>(`select "social_links" from "site_settings" where "id" = 1`)
    .catch(() => null)
  if (settings) values.push(...settings.rows.map((row) => row.social_links))
  return values
}

/**
 * Uploaded files nothing points at.
 *
 * Deleting a gallery item or replacing a cover image leaves the file in the Blob
 * store. This page lists what the content no longer mentions; the button removes
 * them, and the route re-checks every name before deleting. Files uploaded in the
 * last day are left alone because an edit may still be in progress.
 */
export default async function AdminStoragePage() {
  if (!(await getAdminActorId())) {
    redirect('/admin/sign-in?returnTo=/admin/storage')
  }

  const token = blobToken()
  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Upload storage</h1>
        <p className="rounded-xl border border-slate-200 bg-surface p-5 text-sm text-slate-600">
          This deployment has no Blob store, so there is nothing to audit. Connect Vercel Blob to
          enable studio uploads and this report.
        </p>
      </div>
    )
  }

  const [page, values] = await Promise.all([
    list({ prefix: 'site/', token, limit: 1000 }),
    readContentValues(),
  ])

  const blobs = page.blobs.map((blob) => ({
    pathname: blob.pathname,
    url: blob.url,
    size: blob.size,
    uploadedAt: blob.uploadedAt.toISOString(),
  }))
  const cutoff = Date.now() - GRACE_MS
  const settled = blobs.filter((blob) => Date.parse(blob.uploadedAt) <= cutoff)
  const audit = findOrphanedBlobs(settled, buildReferenceCorpus(values))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Upload storage</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Files in the Blob store that no record mentions. Removing them frees storage without
          changing the site.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Files</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {audit.referenced.length + audit.orphaned.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">In use</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {audit.referenced.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Unused</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {audit.orphaned.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Reclaimable</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {humanBytes(audit.orphanedBytes)}
          </p>
        </div>
      </div>

      {page.hasMore && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          The store holds more files than one page. This report covers the first thousand; run it
          again after cleaning to see the rest.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Unused files</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Files uploaded in the last 24 hours are always kept.
            </p>
          </div>
          <BlobCleanupButton pathnames={audit.orphaned.map((blob) => blob.pathname)} />
        </div>

        {audit.orphaned.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            Every stored file is referenced by a record. Nothing to clean up.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {audit.orphaned.slice(0, 200).map((blob) => (
              <li
                key={blob.pathname}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate font-mono text-[11px] text-slate-700">
                  {blob.pathname}
                </span>
                <span className="text-[11px] tabular-nums text-slate-500">
                  {humanBytes(blob.size)} ·{' '}
                  {new Date(blob.uploadedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
