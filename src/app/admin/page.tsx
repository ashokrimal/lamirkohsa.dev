import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminContent } from '@/app/actions/content'
import { getSettingsForAdmin } from '@/app/actions/settings'
import { ensureCmsSeedData } from '@/app/actions/content-cms'
import AdminWorkspace from '@/components/admin/AdminWorkspace'

export const dynamic = 'force-dynamic'

export default async function AdminPage({ searchParams }: { searchParams?: { section?: string } }) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session?.user) redirect('/sign-in')
  await ensureCmsSeedData()
  const content = await getAdminContent()
  const settings = await getSettingsForAdmin()
  const section = searchParams?.section ?? 'overview'
  return <AdminWorkspace section={section} content={content} settings={settings} />
}
