import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'

interface ProjectsPreviewGridProps {
  projects: ProjectData[]
}

/**
 * The featured-work preview. Case studies live on their own routes, so the
 * preview is a plain grid of links with no modal or view-mode switch.
 */
export function ProjectsPreviewGrid({ projects }: ProjectsPreviewGridProps) {
  if (!projects.length) {
    return (
      <div className="apple-card p-8 text-center text-sm text-muted">
        Featured work will appear here as projects are published.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id || project.title}
          project={{ ...project, featured: false }}
          index={index}
        />
      ))}
    </div>
  )
}
