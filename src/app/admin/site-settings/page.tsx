import { redirect } from 'next/navigation'
import SiteSettingsManager from '@/components/studio/admin/SiteSettingsManager'
import { getSiteSettingsForAdmin } from '@/lib/studio/data'
import { hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminSiteSettingsPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/site-settings')
  }

  let settings: Awaited<ReturnType<typeof getSiteSettingsForAdmin>> | null = null
  let error: string | null = null
  try {
    settings = await getSiteSettingsForAdmin()
  } catch (readError) {
    error = readError instanceof Error ? readError.message : 'Could not read the site settings.'
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Site settings</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          The contact email and availability badge shown across the site, and the footer social
          links. The footer is a hardcoded layout component; these values fill it.
        </p>
      </header>

      {error || !settings ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error ?? 'No site settings available.'}
        </p>
      ) : (
        <SiteSettingsManager
          contactEmail={settings.contactEmail}
          availabilityStatus={settings.availabilityStatus}
          socialLinks={settings.socialLinks}
        />
      )}
    </div>
  )
}
