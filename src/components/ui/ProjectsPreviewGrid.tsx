'use client'

import { useState } from 'react'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { ProjectQuickViewModal } from '@/components/ui/ProjectQuickViewModal'
import { LayoutGrid, List } from 'lucide-react'

interface ProjectsPreviewGridProps {
  projects: ProjectData[]
}

export function ProjectsPreviewGrid({ projects }: ProjectsPreviewGridProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="space-y-6">
      {/* View Mode controls inspired by creative-developer.webflow.io & tenztan.in */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--muted)]">
          Showing {projects.length} featured engineering systems
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-xs bg-[var(--surface)] border border-[var(--line)]">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded-xs transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1 rounded-xs transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            title="Compact list view"
            aria-label="Compact list view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid rendering */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id || project.title}
              project={project}
              index={idx}
              onQuickView={(p) => setSelectedProject(p)}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[var(--line)] rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
          {projects.map((project, idx) => (
            <div
              key={project.id || project.title}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--paper)] transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--muted)]">0{idx + 1}</span>
                  <span className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                    {project.title}
                  </span>
                  {project.status && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)]">
                      {project.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] line-clamp-1 max-w-xl">
                  {project.summary || project.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <div className="hidden md:flex items-center gap-1.5">
                  {project.techStack?.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-xs bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="px-3 py-1.5 rounded-xs bg-[var(--accent)] text-white text-[11px] font-medium hover:bg-[#435d4c] transition cursor-pointer"
                >
                  Quick view →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal instance */}
      <ProjectQuickViewModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}
