import { redirect } from 'next/navigation'
import BackupWorkspace from '@/components/admin/BackupWorkspace'
import { hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Backup & restore. The page itself only guards access; the download and the
 * restore both run through owner-authenticated API routes.
 */
export default async function AdminBackupPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/backup')
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Backup &amp; restore</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Keep a copy of everything you have written. Download one before running a repair script,
          and restore it if content is ever lost or overwritten.
        </p>
      </header>

      <BackupWorkspace />
    </div>
  )
}
