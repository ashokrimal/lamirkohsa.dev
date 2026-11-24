import type { Metadata } from 'next'
import ProjectsContent from '@/components/pages/ProjectsContent'
import { extractProjectTechTags, getProjectsResult } from '@/lib/projects'
import { getPageCopy } from '@/lib/site-content'
import { getPageMetadata } from '@/lib/studio/data'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import { JsonLd } from '@/components/seo/JsonLd'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const [copyResult, studio] = await Promise.all([getPageCopy(), getPageMetadata('/projects')])
  // The studio page row is the fallback, not a patch applied afterwards: that
  // keeps og:title, og:image:alt and the Twitter card on the same title.
  return pageMetadata(
    copyResult.status === 'ok' ? copyResult.data.projects : undefined,
    { title: studio?.title, description: studio?.description },
    '/projects',
  )
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
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: copy?.title ?? 'Projects & Case Studies', path: '/projects' },
        ])}
      />
      <ProjectsContent
        projects={projects}
        techTags={techTags}
        copy={copy}
        error={projectsResult.status === 'error' ? projectsResult.message : undefined}
      />
    </>
  )
}
