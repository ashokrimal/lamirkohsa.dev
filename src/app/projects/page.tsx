import type { Metadata } from 'next'
import ProjectsContent from '@/components/pages/ProjectsContent'
import { getPublishedCmsContent } from '@/app/actions/content-cms'
import { mapProjectRecords } from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Projects & Systems - Ashok Rimal',
  description:
    'Technical case studies demonstrating Ashok Rimal’s approach to web, mobile, and full-stack software development.',
}

export default async function ProjectsPage() {
  // Case study detail lives on /projects/[slug]; the index only lists records.
  const [records, copy] = await Promise.all([getPublishedCmsContent('Projects'), getPageCopy()])
  const projects = mapProjectRecords(records)

  return <ProjectsContent projects={projects} copy={copy.projects} />
}
