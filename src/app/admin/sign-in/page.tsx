import { redirect } from 'next/navigation'
import AdminSignIn from '@/components/admin/AdminSignIn'
import { hasAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage() {
  if (await hasAdminSession()) redirect('/admin')

  const configured = await isAdminAuthConfigured()
  return <AdminSignIn configured={configured} />
}
