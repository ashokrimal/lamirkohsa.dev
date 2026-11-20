export const PROJECT_LIFECYCLE_STATUSES = ['Active', 'Planning', 'Archived'] as const

export type ProjectLifecycleStatus = (typeof PROJECT_LIFECYCLE_STATUSES)[number]

/**
 * Maps stored project status strings (e.g. "Active", "Live on Vercel",
 * "Completed", "Prototype", "Planning", "Archived") into one of the three
 * canonical lifecycle states for summary counts, filtering, and color badges.
 */
export function resolveProjectLifecycleStatus(
  rawStatus?: string | null,
): ProjectLifecycleStatus {
  const normalized = (rawStatus ?? '').trim().toLowerCase()
  if (!normalized) return 'Active'

  if (
    normalized === 'archived' ||
    normalized === 'archive' ||
    normalized === 'paused' ||
    normalized === 'on hold' ||
    normalized === 'deprecated' ||
    normalized === 'legacy' ||
    normalized === 'retired' ||
    normalized === 'sunset'
  ) {
    return 'Archived'
  }

  if (
    normalized === 'planning' ||
    normalized === 'planned' ||
    normalized === 'prototype' ||
    normalized === 'in progress' ||
    normalized === 'wip' ||
    normalized === 'beta' ||
    normalized === 'concept' ||
    normalized === 'roadmap'
  ) {
    return 'Planning'
  }

  return 'Active'
}

export interface ProjectStatusVisual {
  lifecycle: ProjectLifecycleStatus
  label: string
  dotClass: string
  badgeClass: string
}

export function getProjectStatusVisual(rawStatus?: string | null): ProjectStatusVisual {
  const lifecycle = resolveProjectLifecycleStatus(rawStatus)
  const label = rawStatus?.trim() || lifecycle

  switch (lifecycle) {
    case 'Planning':
      return {
        lifecycle,
        label,
        dotClass: 'bg-orange-500',
        badgeClass:
          'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
      }
    case 'Archived':
      return {
        lifecycle,
        label,
        dotClass: 'bg-slate-400 dark:bg-zinc-500',
        badgeClass:
          'border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-zinc-400',
      }
    case 'Active':
    default:
      return {
        lifecycle: 'Active',
        label,
        dotClass: 'bg-emerald-500',
        badgeClass:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      }
  }
}
