import { redirect } from 'next/navigation'
import { ADMIN_SESSION_MAX_AGE, hasOwnerAccess, isSecondFactorRequired } from '@/lib/admin-auth'
import { listAdminEvents } from '@/lib/admin-audit'

export const dynamic = 'force-dynamic'

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Access to the studio: whether a second factor is required, and what has
 * happened to the owner account lately.
 *
 * The log is the durable answer to "was that me?" — sign-ins, failed sign-ins,
 * rejected authenticator codes, sign-outs and password changes, newest first.
 * Nothing on this page can change a password or a factor; those stay in Account
 * settings and the deployment's environment.
 */
export default async function AdminSecurityPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/security')
  }

  const events = await listAdminEvents(50)
  const secondFactor = isSecondFactorRequired()
  const sessionHours = Math.round(ADMIN_SESSION_MAX_AGE / 3600)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Security</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          How the owner account is protected, and what has happened to it.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Second factor</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                secondFactor ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              aria-hidden="true"
            />
            {secondFactor ? 'Required' : 'Not enabled'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {secondFactor
              ? 'Sign-in needs the password and a six-digit code from the enrolled authenticator app.'
              : 'Sign-in needs only the password. Generate a secret with `node scripts/admin-totp-setup.mjs`, then set ADMIN_TOTP_SECRET in the deployment to require a code as well.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Session</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Signed cookie, {sessionHours} hours
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            The cookie is HttpOnly, SameSite=Lax and signed with the owner's session secret. Signing
            out clears it immediately; an expired cookie needs a new sign-in.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-surface">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Recent access</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Newest first. Failed attempts are recorded too, so a password guess is visible here.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            Nothing recorded yet. The next sign-in, sign-out or password change appears here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">When</th>
                  <th className="px-5 py-2 font-medium">Event</th>
                  <th className="px-5 py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-2.5 text-xs tabular-nums text-slate-500">
                      {dateTime(event.createdAt)}
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          event.action.includes('failed')
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {event.action}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-slate-600">{event.detail || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
