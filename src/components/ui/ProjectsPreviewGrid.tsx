'use client'

import { useState } from 'react'
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard'
import { ProjectQuickViewModal } from '@/components/ui/ProjectQuickViewModal'
import { LayoutGrid, List, ArrowUpRight } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'

interface ProjectsPreviewGridProps {
  projects: ProjectData[]
}

export function ProjectsPreviewGrid({ projects }: ProjectsPreviewGridProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    sensoryAudio.playToggle()
    setViewMode(mode)
  }

  const handleSelectProject = (project: ProjectData) => {
    sensoryAudio.playModal()
    setSelectedProject(project)
  }

  return (
    <div className="space-y-6">
      {/* Apple-style segmented view mode control */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted font-medium">
            Showing {projects.length} featured works
          </span>
          <span lang="ko" className="font-korean text-[11px] text-muted">· 주요 작업</span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-overlay border border-line-faint backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleSetViewMode('grid')}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSetViewMode('list')}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-muted hover:text-ink'
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
              onQuickView={handleSelectProject}
            />
          ))}
        </div>
      ) : (
        <div className="apple-card divide-y divide-line-subtle overflow-hidden">
          {projects.map((project, idx) => (
            <div
              key={project.id || project.title}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-overlay-faint transition-colors group cursor-pointer"
              onClick={() => handleSelectProject(project)}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-muted">0{idx + 1}</span>
                  <span className="text-base font-semibold text-ink group-hover:text-accent transition-colors tracking-tight">
                    {project.title}
                  </span>
                  {project.status && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                      {project.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted line-clamp-1 max-w-xl">
                  {project.summary || project.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                {project.category && (
                  <span className="px-3 py-1 rounded-full bg-overlay text-[11px] font-medium text-ink-secondary">
                    {project.category}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectProject(project)
                  }}
                  className="apple-btn-secondary !py-1.5 !px-3 text-xs"
                >
                  <span>Quick View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Quick View Modal */}
      {selectedProject && (
        <ProjectQuickViewModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}
