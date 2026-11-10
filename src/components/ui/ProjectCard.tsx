'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Github, Layers, Sparkles } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'
import { sensoryAudio } from '@/lib/sensory-audio'

export interface ProjectData {
  id?: number | string
  title: string
  slug?: string
  category?: string
  summary?: string
  description?: string
  challenge?: string
  solution?: string
  techStack?: string[]
  image?: string
  live?: string
  github?: string
  status?: string
  featured?: boolean
  completionDate?: string
  phases?: Array<{ phase: string; name: string; completed?: boolean }>
}

interface ProjectCardProps {
  project: ProjectData
  variant?: 'featured' | 'standard' | 'compact'
  index?: number
  onQuickView?: (project: ProjectData) => void
}

export function ProjectCard({ project, variant = 'standard', index, onQuickView }: ProjectCardProps) {
  const isFeatured = variant === 'featured' || project.featured

  return (
    <Card3D maxTilt={6} className={isFeatured ? 'md:col-span-2' : ''}>
      <article className="apple-card group overflow-hidden flex flex-col justify-between h-full">
        {/* Top Image Preview if available */}
        {project.image && (
          <div className="relative overflow-hidden aspect-[16/10] max-h-[300px] bg-black/[0.02]">
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            {/* Apple Frosted Glass Pill Badges */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
              {project.category && (
                <div className="px-3 py-1 rounded-full bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-black/[0.06] text-[11px] font-medium tracking-tight text-[#1d1d1f] shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                  <span>{project.category}</span>
                </div>
              )}
              {project.status && (
                <div className="px-3 py-1 rounded-full bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-black/[0.06] text-[11px] font-medium text-emerald-600 shadow-xs">
                  {project.status}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-6 md:p-7 flex-1 flex flex-col justify-between space-y-5">
          <div>
            {/* Meta Row with Korean Subtitle */}
            <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
              {index !== undefined && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
                  <span className="font-mono">0{index + 1}</span>
                  <span className="font-korean">· 프로젝트</span>
                </div>
              )}
              {project.completionDate && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#86868b] ml-auto">
                  <Calendar className="w-3 h-3 text-[#0071e3]" />
                  {project.completionDate}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f] tracking-tight leading-snug group-hover:text-[#0071e3] transition-colors">
              {project.title}
            </h3>

            {/* Description */}
            <p className="mt-2.5 text-sm text-[#86868b] leading-relaxed line-clamp-3 font-normal">
              {project.summary ||
                project.description ||
                'A full-stack software application built with attention to performance, human-centric interfaces, and scalable architecture.'}
            </p>

            {/* Phases Pill */}
            {project.phases && project.phases.length > 0 && (
              <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.03] text-[11px] text-[#424245]">
                <Layers className="w-3 h-3 text-[#0071e3]" />
                <span>{project.phases.length} Execution Phases</span>
              </div>
            )}
          </div>

          {/* Tech Stack Apple Pills */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-medium text-[#424245] border border-black/[0.03]"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 5 && (
                  <span className="text-[11px] text-[#86868b] self-center px-1">
                    +{project.techStack.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions with Anti-Boxy Apple Pill Buttons */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {project.live && project.live !== '#' && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sensoryAudio.playClick()}
                  className="apple-btn-primary !py-1.5 !px-3.5 !text-xs !shadow-none"
                >
                  <span>Live Demo</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sensoryAudio.playClick()}
                  className="apple-btn-secondary !py-1.5 !px-3 !text-xs"
                  title="View Source Code"
                >
                  <Github className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>Code</span>
                </a>
              )}
            </div>

            {onQuickView ? (
              <button
                type="button"
                onClick={() => {
                  sensoryAudio.playModal()
                  onQuickView(project)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] hover:underline cursor-pointer"
              >
                <span>Details</span>
                <span className="font-korean text-[10px] text-[#86868b] font-normal">상세</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ) : (
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0071e3] hover:underline"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </Card3D>
  )
}
