import type { Metadata } from 'next'
import ProjectsContent from '@/components/pages/ProjectsContent'
import { getProjectsResult } from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Projects & Systems - Ashok Rimal',
  description:
    'Technical case studies demonstrating Ashok Rimal’s approach to web, mobile, and full-stack software development.',
}

export default async function ProjectsPage() {
  // Case study detail lives on /projects/[slug]; the index only lists records.
  const [projectsResult, copyResult] = await Promise.all([getProjectsResult(), getPageCopy()])
  const projects = projectsResult.status === 'ok' ? projectsResult.data : []
  const copy = copyResult.status === 'ok' ? copyResult.data.projects : undefined

  return (
    <ProjectsContent
      projects={projects}
      copy={copy}
      error={projectsResult.status === 'error' ? projectsResult.message : undefined}
    />
  )
}
