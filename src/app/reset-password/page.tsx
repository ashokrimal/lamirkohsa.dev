import { Suspense } from 'react'
import PasswordResetForm from '@/components/auth/PasswordResetForm'

/**
 * The form reads its token from the query string, which needs a Suspense
 * boundary to prerender. It is scoped to the form rather than the whole shell:
 * a shell-wide boundary starts the response before a page can answer with a
 * redirect or a 404.
 */
export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<div className="mx-auto h-40 w-full max-w-md" aria-busy="true" />}>
        <PasswordResetForm />
      </Suspense>
    </main>
  )
}
