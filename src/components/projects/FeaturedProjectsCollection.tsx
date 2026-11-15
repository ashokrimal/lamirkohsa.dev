'use client'

import { useState } from 'react'
import { HorizontalCollection } from '@/components/ui/HorizontalCollection'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { ProjectQuickViewDrawer } from '@/components/projects/ProjectQuickViewDrawer'

interface FeaturedProjectsCollectionProps {
  projects: ProjectData[]
  previewCount?: number
  viewAllHref?: string
  viewAllLabel?: string
  ariaLabel?: string
}

export function FeaturedProjectsCollection({
  projects,
  previewCount,
  viewAllHref,
  viewAllLabel,
  ariaLabel,
}: FeaturedProjectsCollectionProps) {
  const [quickViewProject, setQuickViewProject] = useState<ProjectData | null>(null)

  return (
    <>
      <HorizontalCollection
        items={projects.map((project, index) => (
          <ProjectCard
            key={project.id ?? project.title}
            project={project}
            index={index}
            onQuickView={() => setQuickViewProject(project)}
          />
        ))}
        previewCount={previewCount}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
        ariaLabel={ariaLabel}
      />
      <ProjectQuickViewDrawer
        project={quickViewProject}
        onClose={() => setQuickViewProject(null)}
      />
    </>
  )
}
