import type { Metadata } from 'next'
import ProjectsContent from '@/components/pages/ProjectsContent'
import { extractProjectTechTags, getProjectsResult } from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const copyResult = await getPageCopy()
  return pageMetadata(copyResult.status === 'ok' ? copyResult.data.projects : undefined, undefined, '/projects')
}

export default async function ProjectsPage() {
  // Case study detail lives on /projects/[slug]; the index fetches live CMS
  // records and computes technology stack tags from published CMS projects.
  const [projectsResult, copyResult] = await Promise.all([
    getProjectsResult({ fresh: true }),
    getPageCopy(),
  ])
  const projects = projectsResult.status === 'ok' ? projectsResult.data : []
  const copy = copyResult.status === 'ok' ? copyResult.data.projects : undefined
  const techTags = extractProjectTechTags(projects)

  return (
    <ProjectsContent
      projects={projects}
      techTags={techTags}
      copy={copy}
      error={projectsResult.status === 'error' ? projectsResult.message : undefined}
    />
  )
}
