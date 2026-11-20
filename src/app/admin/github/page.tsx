import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSettingsForAdmin } from '@/app/actions/settings'
import { hasOwnerAccess } from '@/lib/admin-auth'
import { CmsToastProvider } from '@/components/admin/ui/CmsToast'
import { CmsGitHubStats } from '@/components/admin/ui/CmsGitHubStats'

export const dynamic = 'force-dynamic'

export default async function AdminGitHubPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/github')
  }

  const settings = await getSettingsForAdmin()

  return (
    <CmsToastProvider>
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">GitHub activity</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Live repositories, commit frequency and contribution streaks. Change the username in
            Settings.
          </p>
        </div>

        {settings.githubUsername ? (
          <CmsGitHubStats initialUsername={settings.githubUsername} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-800">No GitHub username yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Add your GitHub username in Settings and this page will show live activity.
            </p>
            <Link
              href="/admin/settings"
              className="mt-3 inline-flex items-center rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Open settings
            </Link>
          </div>
        )}
      </div>
    </CmsToastProvider>
  )
}
