import { redirect } from 'next/navigation'
import WorkManager from '@/components/studio/admin/WorkManager'
import { getAllProjectsForAdmin } from '@/lib/studio/data'
import { getProjectsResult } from '@/lib/projects'
import { hasOwnerAccess } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminWorkPage() {
  if (!(await hasOwnerAccess())) {
    redirect('/admin/sign-in?returnTo=/admin/work')
  }

  let projects: Awaited<ReturnType<typeof getAllProjectsForAdmin>> = []
  let cmsProjects: Awaited<ReturnType<typeof getProjectsResult>> = { status: 'ok', data: [] }
  let error: string | null = null
  try {
    ;[projects, cmsProjects] = await Promise.all([
      getAllProjectsForAdmin(),
      getProjectsResult({ fresh: true }),
    ])
  } catch (readError) {
    error = readError instanceof Error ? readError.message : 'Could not read the projects table.'
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Case studies</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Full CRUD and lifecycle status toggles (<code className="rounded bg-slate-100 px-1">Active</code>,{' '}
          <code className="rounded bg-slate-100 px-1">Planning</code>,{' '}
          <code className="rounded bg-slate-100 px-1">Archived</code>) for projects published to{' '}
          <code className="mx-1 rounded bg-slate-100 px-1">/projects</code>, the one
          canonical case study route.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </p>
      ) : (
        <WorkManager
          projects={projects}
          cmsProjects={cmsProjects.status === 'ok' ? cmsProjects.data : []}
        />
      )}
    </div>
  )
}
