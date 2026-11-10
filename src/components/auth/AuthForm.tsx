'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { ShieldCheck, ArrowRight, Sparkles, Lock } from 'lucide-react'

export default function AuthForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await authClient.signIn.email({
        email: String(form.get('email')),
        password: String(form.get('password')),
      })
      if (result.error) {
        setError('Invalid credentials or database connection pending. Use demo access below to test.')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Database authentication offline. Click "Enter Demo Admin" below to proceed.')
    } finally {
      setPending(false)
    }
  }

  function enterDemoAdmin() {
    router.push('/admin?section=overview')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-inverse font-bold text-lg mb-2 shadow-sm">
            AR
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Portfolio CMS Studio
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage projects, visual media, and published records.
          </p>
        </div>

        {/* Demo Fast Track Button */}
        <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-xl space-y-2 text-center">
          <p className="text-xs font-semibold text-teal-950 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Quick Preview Access
          </p>
          <p className="text-[11px] text-teal-700 leading-normal">
            Explore all CMS features, analytics, and content tables directly.
          </p>
          <button
            type="button"
            onClick={enterDemoAdmin}
            className="w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-inverse text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Enter Admin Dashboard (Demo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-surface px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
            or sign in
          </span>
        </div>

        <form onSubmit={submit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email address</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@ashokrimal.com.np"
              defaultValue="admin@ashokrimal.com.np"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-surface text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-teal-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-surface text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {error && (
            <p className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-inverse text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{pending ? 'Authenticating...' : 'Sign In with Password'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
            ← Return to public portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}
