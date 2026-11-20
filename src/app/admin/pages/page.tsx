import { redirect } from 'next/navigation'
import PagesManager from '@/components/studio/admin/PagesManager'
import { getAllPagesForAdmin } from '@/lib/studio/data'
import { hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPagesPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/pages')
  }

  let pages: Awaited<ReturnType<typeof getAllPagesForAdmin>> = []
  let error: string | null = null
  try {
    pages = await getAllPagesForAdmin()
  } catch (readError) {
    error = readError instanceof Error ? readError.message : 'Could not read the pages table.'
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Pages &amp; sections</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Choose a page, edit its metadata, then reorder, hide, add or remove the sections it
          renders. Every section is edited through typed fields, never raw JSON.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </p>
      ) : (
        <PagesManager pages={pages} />
      )}
    </div>
  )
}
