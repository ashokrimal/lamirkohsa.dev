'use client'

import { useRouter } from 'next/navigation'
import { TechDistributionChart } from '@/components/projects/TechDistributionChart'
import type { ProjectEntry } from '@/lib/projects'

interface HomeTechDistributionProps {
  projects: ProjectEntry[]
}

/**
 * Home page bridge for the D3 technology distribution chart. Selecting any
 * slice or stack card navigates straight to `/projects?tech=...` with that filter
 * pre-selected.
 */
export function HomeTechDistribution({ projects }: HomeTechDistributionProps) {
  const router = useRouter()

  return (
    <TechDistributionChart
      projects={projects}
      onToggleTech={(tech) => {
        router.push(`/projects?tech=${encodeURIComponent(tech)}`)
      }}
    />
  )
}
