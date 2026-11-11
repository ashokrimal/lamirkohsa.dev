import { redirect } from 'next/navigation'
import AdminSignIn from '@/components/admin/AdminSignIn'
import { hasAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams?: { returnTo?: string }
}) {
  const requested = searchParams?.returnTo
  const returnTo = requested && requested.startsWith('/admin') && !requested.startsWith('//') ? requested : '/admin'

  if (await hasAdminSession()) redirect(returnTo)

  const configured = await isAdminAuthConfigured()
  return <AdminSignIn configured={configured} returnTo={returnTo} />
}
