import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Database, HardDrive, Mail, ShieldCheck } from 'lucide-react'
import { requireAdminStudio } from '@/lib/admin-page-auth'
import { collectHealth } from '@/lib/health'
import { pool } from '@/lib/db'
import { newsletterCounts } from '@/lib/newsletter-store'
import { listSlugRedirects } from '@/lib/slug-history'
import { StatusRefreshButton } from '@/components/admin/StatusRefreshButton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Site status',
}

interface ContentStatus {
  published: number
  drafts: number
  staleDrafts: number
  unreadMessages: number
}

async function contentStatus(): Promise<ContentStatus | null> {
  try {
    const [cms, inbox] = await Promise.all([
      pool.query<{ collection: string; status: string; updatedAt: Date | string | null }>(
        `SELECT "collection", "status", "updatedAt" FROM "cmsContent"`,
      ),
      pool.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM "inboxMessage" WHERE "readAt" IS NULL`,
      ),
    ])

    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const drafts = cms.rows.filter((row) => row.status !== 'published')
    return {
      published: cms.rows.length - drafts.length,
      drafts: drafts.length,
      staleDrafts: drafts.filter((row) => {
        if (!row.updatedAt) return false
        const updated = new Date(row.updatedAt).getTime()
        return Number.isFinite(updated) && updated < monthAgo
      }).length,
      unreadMessages: Number(inbox.rows[0]?.count ?? 0) || 0,
    }
  } catch {
    return null
  }
}

function StatePill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
      }`}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {label}
    </span>
  )
}

/**
 * One place for the checks that used to live in five.
 *
 * Every value is read live on each request, so the panel can never show a stale
 * green tick. The CLI-only gates (`cms:check`, `studio:verify`) are linked rather
 * than executed: they need a database connection and belong in CI or a terminal,
 * not in a serverless request.
 */
export default async function AdminStatusPage() {
  await requireAdminStudio('/admin/status')

  const [health, content, redirects, counts] = await Promise.all([
    collectHealth(),
    contentStatus(),
    listSlugRedirects(),
    newsletterCounts().catch(() => null),
  ])

  const envRows = Object.entries(health.env)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Command</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Site status</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Runtime configuration, the database, scheduled backups and content health in one panel.
          </p>
        </div>
        <StatusRefreshButton />
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Serving requests
            </span>
            <Database className="h-4 w-4 text-slate-300" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{health.ok ? 'Yes' : 'Degraded'}</p>
          <p className="mt-0.5 text-xs text-slate-500">Database {health.database}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Scheduled backup
            </span>
            <HardDrive className="h-4 w-4 text-slate-300" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {health.scheduledBackups.status}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {health.scheduledBackups.ageHours === null
              ? 'No snapshot reading'
              : `${health.scheduledBackups.ageHours}h since the newest snapshot`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Content
            </span>
            <ShieldCheck className="h-4 w-4 text-slate-300" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {content ? content.published : '—'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {content
              ? `${content.drafts} drafts${content.staleDrafts ? ` · ${content.staleDrafts} untouched 30d+` : ''}`
              : 'Database unavailable'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Readers
            </span>
            <Mail className="h-4 w-4 text-slate-300" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {counts ? counts.subscribed : '—'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {content ? `${content.unreadMessages} unread inbox messages` : 'Newsletter subscribers'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Environment</h2>
          <p className="mt-1 text-xs text-slate-500">
            Presence only. Values never leave the deployment.
          </p>
          <ul className="mt-3 space-y-1.5">
            {envRows.map(([name, present]) => (
              <li key={name} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[11px] text-slate-600">{name}</span>
                <StatePill ok={present} label={present ? 'set' : 'missing'} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Checks</h2>
          <p className="mt-1 text-xs text-slate-500">
            The content gates need a database connection, so they run in CI and a terminal
            rather than in a request.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            <li>
              <code className="font-mono text-[11px]">pnpm cms:check</code> — required fields on
              every record.
            </li>
            <li>
              <code className="font-mono text-[11px]">pnpm cms:check:duplicates</code> — duplicate
              published keys.
            </li>
            <li>
              <code className="font-mono text-[11px]">pnpm studio:verify</code> — seeded pages and
              sections.
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-teal-700">
            <Link href="/admin/redirects" className="hover:underline">
              Redirects ({redirects.length})
            </Link>
            <Link href="/admin/backup" className="hover:underline">
              Backups
            </Link>
            <a href="/api/health" target="_blank" rel="noreferrer" className="hover:underline">
              Raw health JSON ↗
            </a>
          </div>

          {health.warnings.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
              <span className="font-semibold">Warnings:</span> {health.warnings.join(', ')}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
