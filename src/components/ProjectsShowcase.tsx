'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type ProjectCategory = 'Web' | 'Mobile';

type Project = {
  title: string;
  category: ProjectCategory;
  image: string;
  challenge: string;
  solution: string;
  features: string[];
  techStack: string[];
  github: string;
  live?: string;
};

type Filter = 'All' | ProjectCategory;

type ProjectsShowcaseProps = {
  projects: Project[];
  filters: Filter[];
};

export default function ProjectsShowcase({ projects, filters }: ProjectsShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter(project => project.category === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div className="projects-showcase">
      <div className="projects-filter">
        {filters.map(filter => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`projects-filter-button ${activeFilter === filter ? 'is-active' : ''}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project, index) => (
          <article
            key={project.title}
            className="project-showcase-card"
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <Image src={project.image} alt={`${project.title} screenshot`} width={1200} height={900} className="project-showcase-image" />
            <div className="project-showcase-body">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-blue-500">{project.category}</span>
                <h2 className="text-3xl font-semibold text-gray-900">{project.title}</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold text-gray-900">The challenge:</span> {project.challenge}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Solution &amp; process:</span> {project.solution}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Key features</h3>
                <ul className="mt-3 space-y-2 text-gray-700">
                  {project.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Tech stack</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.techStack.map(tech => (
                    <span key={tech} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    View Live Product
                  </a>
                )}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition"
                >
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
