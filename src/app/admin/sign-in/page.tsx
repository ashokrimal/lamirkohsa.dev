import { redirect } from 'next/navigation'
import AdminSignIn from '@/components/admin/AdminSignIn'
import { hasAdminSession, isAdminAuthConfigured, isSecondFactorRequired } from '@/lib/admin-auth'
import { countAdminPasskeys } from '@/lib/admin-passkey'

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage(
  props: {
    searchParams?: Promise<{ returnTo?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const requested = searchParams?.returnTo
  const returnTo = requested && requested.startsWith('/admin') && !requested.startsWith('//') ? requested : '/admin'

  if (await hasAdminSession()) redirect(returnTo)

  const configured = await isAdminAuthConfigured()
  // The passkey button is only offered once one has been enrolled, so a fresh
  // deployment is not shown a button that can only fail.
  const passkeysAvailable = configured && (await countAdminPasskeys()) > 0

  return (
    <AdminSignIn
      configured={configured}
      returnTo={returnTo}
      requiresSecondFactor={configured && isSecondFactorRequired()}
      passkeysAvailable={passkeysAvailable}
    />
  )
}
