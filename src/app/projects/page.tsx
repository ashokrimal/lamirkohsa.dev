import type { Metadata } from 'next'
import ProjectsContent from '@/components/pages/ProjectsContent'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { mapProjectRecords } from '@/lib/projects'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects & Systems - Ashok Rimal',
  description:
    'Technical case studies demonstrating Ashok Rimal’s approach to web, mobile, and full-stack software development.',
}

export default async function ProjectsPage() {
  // Case study detail lives on /projects/[slug]; the index only lists records.
  const records = await getPublishedCmsContent('Projects')
  const projects = mapProjectRecords(records)

  return <ProjectsContent projects={projects} />
}
