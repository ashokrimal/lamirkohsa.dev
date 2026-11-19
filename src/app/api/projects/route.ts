import { NextResponse } from 'next/server'
import { extractProjectTechTags, getProjectsResult } from '@/lib/projects'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await getProjectsResult({ fresh: true })
  if (result.status === 'error') {
    return NextResponse.json(
      { error: result.message, projects: [], techTags: [] },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const projects = result.status === 'ok' ? result.data : []
  const techTags = extractProjectTechTags(projects)

  return NextResponse.json(
    { projects, techTags, count: projects.length },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
