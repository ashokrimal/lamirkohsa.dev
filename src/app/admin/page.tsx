import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminContent } from '@/app/actions/content'
import { getSettingsForAdmin } from '@/app/actions/settings'
import AdminWorkspace from '@/components/admin/AdminWorkspace'
import { getAdminIdentity, hasAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { section?: string; collection?: string }
}) {
  const requestHeaders = await headers()
  let session = null
  try {
    session = await auth.api.getSession({ headers: requestHeaders })
  } catch {
    // Auth or database unavailable; the admin cookie below still decides access.
  }

  const identity = await getAdminIdentity()
  const ownerEmail = identity?.email?.toLowerCase()

  // Only the configured owner is allowed in: a better-auth session for any other
  // address is treated as signed out, and the cookie must carry a valid signature.
  const betterAuthOwner = Boolean(
    session?.user?.email && ownerEmail && session.user.email.toLowerCase() === ownerEmail,
  )
  const adminSession = await hasAdminSession()

  if (!betterAuthOwner && !adminSession) {
    const params = new URLSearchParams()
    if (searchParams?.section) params.set('section', searchParams.section)
    if (searchParams?.collection) params.set('collection', searchParams.collection)
    const returnTo = params.toString() ? `/admin?${params.toString()}` : '/admin'
    redirect(`/admin/sign-in?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const content = await getAdminContent()
  const settings = await getSettingsForAdmin()
  const section = searchParams?.section ?? 'overview'

  return (
    <AdminWorkspace
      section={section}
      initialCategory={searchParams?.collection}
      content={content}
      settings={settings}
      user={{
        name: session?.user?.name ?? 'Site owner',
        email: identity?.email ?? session?.user?.email ?? '',
      }}
    />
  )
}
