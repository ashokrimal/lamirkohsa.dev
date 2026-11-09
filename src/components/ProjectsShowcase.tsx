'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Calendar, CheckCircle2, GitBranch, Github, Layers } from 'lucide-react';

type ProjectCategory = 'Web' | 'Mobile';

export interface ProjectPhase {
  phase: string;
  name: string;
  period: string;
  description: string;
  completed: boolean;
}

export interface Project {
  title: string;
  category: ProjectCategory;
  image: string;
  challenge: string;
  solution: string;
  features: string[];
  techStack: string[];
  github: string;
  live?: string;
  completionDate?: string;
  period?: string;
  status?: string;
  phases?: ProjectPhase[];
}

type Filter = 'All' | ProjectCategory;

interface ProjectsShowcaseProps {
  projects: Project[];
  filters: Filter[];
}

export default function ProjectsShowcase({ projects, filters }: ProjectsShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div className="projects-showcase">
      {/* Category Filter Pills */}
      <div className="projects-filter flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`projects-filter-button font-mono text-xs ${
                activeFilter === filter ? 'is-active' : ''
              }`}
            >
              {filter} {filter === 'All' ? `(${projects.length})` : ''}
            </button>
          ))}
        </div>

        <p className="text-xs font-mono text-[var(--muted)]">
          Showing {filteredProjects.length} selected {filteredProjects.length === 1 ? 'case study' : 'case studies'}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid mt-6">
        {filteredProjects.map((project, index) => (
          <article
            key={project.title}
            className="project-showcase-card rounded-sm"
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className="relative overflow-hidden group">
              <Image
                src={project.image}
                alt={`${project.title} screenshot`}
                width={1200}
                height={900}
                className="project-showcase-image"
              />
              {project.status && (
                <div className="absolute top-3 right-3 bg-[var(--surface)]/95 backdrop-blur-xs border border-[var(--line)] px-2.5 py-1 rounded-xs text-[10px] font-mono font-semibold text-[var(--accent)] shadow-xs">
                  {project.status}
                </div>
              )}
            </div>

            <div className="project-showcase-body">
              {/* Category & Timeline Meta */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    {project.category} Project
                  </span>
                  {project.completionDate && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--muted)]">
                      <Calendar className="w-3 h-3 text-[var(--accent)]" />
                      {project.completionDate}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-normal text-[var(--ink)] tracking-[-0.04em]">
                  {project.title}
                </h2>
              </div>

              {/* Challenge & Solution */}
              <div className="space-y-3.5 text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                <p>
                  <strong className="text-[var(--ink)] font-semibold">Challenge:</strong> {project.challenge}
                </p>
                <p>
                  <strong className="text-[var(--ink)] font-semibold">Solution:</strong> {project.solution}
                </p>
              </div>

              {/* Phases Milestone Track if available */}
              {project.phases && project.phases.length > 0 && (
                <div className="p-3.5 rounded-sm bg-[var(--paper)] border border-[var(--line)]">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-2.5">
                    <span className="flex items-center gap-1.5 font-semibold text-[var(--ink)]">
                      <Layers className="w-3 h-3 text-[var(--accent)]" />
                      Phases Breakdown ({project.phases.length} steps)
                    </span>
                    <span className="text-[var(--accent)] font-semibold">100% Completed</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {project.phases.map((ph, pIdx) => (
                      <div
                        key={ph.phase}
                        className="p-2 rounded-xs bg-[var(--surface)] border border-[var(--line)]/70 text-[10px]"
                      >
                        <div className="flex items-center justify-between text-[9px] text-[var(--muted)] font-mono">
                          <span>0{pIdx + 1}</span>
                          <CheckCircle2 className="w-2.5 h-2.5 text-[var(--accent)]" />
                        </div>
                        <p className="font-semibold text-[var(--ink)] truncate mt-1">{ph.name}</p>
                        <p className="text-[9px] text-[var(--muted)] font-mono">{ph.period}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                  Key Capabilities
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-xs text-[var(--ink)]">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                  Technologies
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-xs bg-[var(--surface)] border border-[var(--line)] px-2.5 py-0.5 text-[11px] font-mono text-[var(--ink)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                {project.live && project.live !== '#' && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xs bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#435d4c] transition shadow-2xs"
                  >
                    View Live Product
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xs border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
                >
                  <Github className="w-3.5 h-3.5" />
                  View Source Code
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
