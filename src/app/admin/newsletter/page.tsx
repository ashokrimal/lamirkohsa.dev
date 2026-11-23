import { redirect } from 'next/navigation'
import { hasOwnerAccess } from '@/lib/admin-auth'
import {
  listRecentAnnouncements,
  listSubscribers,
  NEWSLETTER_MAX_RECIPIENTS,
  newsletterCounts,
} from '@/lib/newsletter-store'

export const dynamic = 'force-dynamic'

const dateFormat = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

/**
 * Journal subscribers, read-only.
 *
 * The list is served here rather than through a JSON API: the owner needs to see
 * who is on it, not to export addresses. Emails are never sent from this page —
 * publishing a post is what announces it, and `blog-notifications` emails each
 * post once. The cap is shown so a list that outgrows one announcement batch is
 * visible before it silently truncates.
 */
export default async function AdminNewsletterPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/newsletter')
  }

  const [counts, subscribers, announcements] = await Promise.all([
    newsletterCounts(),
    listSubscribers(500),
    listRecentAnnouncements(10),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Journal newsletter</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Everyone who asked to hear about a new entry. Publishing a post emails each subscriber
          once, from the journal address, with a personal unsubscribe link.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Subscribed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{counts.subscribed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Unsubscribed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
            {counts.unsubscribed}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Per announcement</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
            {NEWSLETTER_MAX_RECIPIENTS.toLocaleString('en-US')}
          </p>
        </div>
      </div>

      {counts.subscribed > NEWSLETTER_MAX_RECIPIENTS && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          The list is larger than one announcement batch. Each publish reaches the newest{' '}
          {NEWSLETTER_MAX_RECIPIENTS.toLocaleString('en-US')} subscribers; split the send before the
          list grows further.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-surface">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Subscribers</h2>
          <span className="text-[11px] text-slate-500">
            Showing {subscribers.length} of {counts.subscribed}
          </span>
        </div>

        {subscribers.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            Nobody has subscribed yet. The sign-up form on the journal page writes here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Email</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Source</th>
                  <th className="px-5 py-2 font-medium">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.map((row) => (
                  <tr key={row.email} className="hover:bg-slate-50/60">
                    <td className="max-w-[22rem] truncate px-5 py-2.5 font-medium text-slate-800">
                      {row.email}
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          row.status === 'subscribed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}
                      >
                        {row.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-slate-500">{row.source}</td>
                    <td className="px-5 py-2.5 text-xs tabular-nums text-slate-500">
                      {dateFormat(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Announced posts</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Each post appears once. A later edit that keeps it published does not email anyone again.
          </p>
        </div>
        {announcements.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">
            No post has been announced yet. The first published entry appears here after its email
            batch is accepted.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {announcements.map((row) => (
              <li
                key={row.postKey}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm"
              >
                <span className="font-medium text-slate-800">{row.title}</span>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {dateFormat(row.announcedAt)} · /blogs/{row.postKey.replace(/^blogs:/, '')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
