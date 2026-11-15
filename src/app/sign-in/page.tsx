import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth/AuthForm'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  let session = null
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    // Database or auth service unavailable; render sign-in form safely.
  }
  if (session?.user) redirect('/admin')
  return <main className="auth-page"><AuthForm /></main>
}
