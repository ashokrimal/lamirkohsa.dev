'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function AuthForm() {
  const router = useRouter(); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (event.nativeEvent instanceof SubmitEvent === false) return; setPending(true); setError(''); const form = new FormData(event.currentTarget); const result = await authClient.signIn.email({ email: String(form.get('email')), password: String(form.get('password')) }); setPending(false); if (result.error) setError('Unable to sign in with those details.'); else { router.push('/admin'); router.refresh() } }
  return <div className="auth-card"><Link href="/" className="brand-mark">AK<span>.</span></Link><p className="section-label">Private workspace</p><h1>Welcome <em>back.</em></h1><form onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button><Link href="/forgot-password" className="auth-secondary-link">Forgot your password?</Link></form></div>
}
