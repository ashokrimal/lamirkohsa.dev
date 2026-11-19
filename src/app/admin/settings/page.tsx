import { redirect } from 'next/navigation'
import SettingsWorkspace from '@/components/admin/SettingsWorkspace'
import { getSettingsForAdmin } from '@/app/actions/settings'
import { getAdminIdentity, hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/settings')
  }

  const [identity, settings] = await Promise.all([
    getAdminIdentity(),
    getSettingsForAdmin(),
  ])

  return (
    <SettingsWorkspace
      settings={settings}
      email={identity?.email ?? ''}
      source={identity?.source ?? 'database'}
    />
  )
}
