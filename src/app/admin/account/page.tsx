import { redirect } from 'next/navigation'
import ChangePasswordForm from '@/components/admin/ChangePasswordForm'
import { getAdminIdentity, hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminAccountPage() {
  if (!(await hasOwnerAccess())) redirect('/admin/sign-in')

  const identity = await getAdminIdentity()

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 space-y-8">
      <div className="space-y-1">
        <a href="/admin" className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted hover:text-accent">
          ← Back to studio
        </a>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Owner account</h1>
        <p className="text-sm text-muted">
          Signed in as {identity?.email ?? 'the site owner'}.{' '}
          {identity?.source === 'environment'
            ? 'This account currently comes from deployment variables; changing the password stores it in the database.'
            : 'The password is stored as a salted scrypt hash.'}
        </p>
      </div>

      <section className="apple-card p-6 md:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Change password</h2>
          <p className="text-xs text-muted mt-1">
            Other active sessions stay signed in until their cookie expires (up to 8 hours).
          </p>
        </div>
        <ChangePasswordForm />
      </section>

      <section className="apple-card p-6 md:p-8 space-y-2">
        <h2 className="text-lg font-semibold text-ink">Session</h2>
        <p className="text-xs text-muted">End this browser session and return to the sign-in screen.</p>
        <a href="/admin/sign-out" className="apple-btn-secondary inline-flex">
          Sign out
        </a>
      </section>
    </main>
  )
}
