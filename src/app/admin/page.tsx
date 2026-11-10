import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAdminContent } from '@/app/actions/content'
import { getSettingsForAdmin } from '@/app/actions/settings'
import AdminWorkspace from '@/components/admin/AdminWorkspace'
import AdminSignIn from '@/components/admin/AdminSignIn'
import { hasAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage({ searchParams }: { searchParams?: { section?: string } }) {
  const requestHeaders = await headers()
  let session = null
  try {
    session = await auth.api.getSession({ headers: requestHeaders })
  } catch {
    // Auth or database unavailable; the admin cookie below still decides access.
  }

  // The studio is owner-only: a better-auth session or a valid admin session
  // cookie. There is no demo mode and no unauthenticated fallback.
  const adminSession = await hasAdminSession()
  if (!session?.user && !adminSession) {
    return <AdminSignIn configured={isAdminAuthConfigured()} />
  }

  const content = await getAdminContent()
  const settings = await getSettingsForAdmin()
  const section = searchParams?.section ?? 'overview'

  return (
    <AdminWorkspace
      section={section}
      content={content}
      settings={settings}
      isDemoSession={false}
      user={
        session?.user ?? {
          name: 'Site owner',
          email: adminSession ? process.env.ADMIN_EMAIL ?? '' : '',
        }
      }
    />
  )
}
