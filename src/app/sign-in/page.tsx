import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth/AuthForm'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/admin')
  return <main className="auth-page"><AuthForm /></main>
}
