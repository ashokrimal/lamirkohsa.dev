import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAdminIdentity, hasAdminSession } from '@/lib/admin-auth'

/**
 * Server guard for every Studio route. It accepts either the signed owner cookie
 * or a better-auth session whose address matches the configured owner.
 */
export async function requireAdminStudio(returnTo: string) {
  let session = null
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    // The cookie below still decides access when auth is unavailable.
  }

  const identity = await getAdminIdentity()
  const ownerEmail = identity?.email?.toLowerCase()
  const email = session?.user?.email?.toLowerCase() ?? null
  const betterAuthOwner = Boolean(email && ownerEmail && email === ownerEmail)
  const adminSession = await hasAdminSession()

  if (!betterAuthOwner && !adminSession) {
    redirect(`/admin/sign-in?returnTo=${encodeURIComponent(returnTo)}`)
  }

  return { email: email ?? ownerEmail ?? '' }
}
