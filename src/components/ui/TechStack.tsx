'use client'

import { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  resolveTechUsageMetadata,
  type CmsTechDefinition,
} from '@/lib/tech-metadata'

interface TechStackProps {
  items: string[]
  /** Caps the number of pills shown; the rest are summarised as +N. */
  limit?: number
  className?: string
  /** Per-project CMS definition metadata keyed by lowercased technology name. */
  definitions?: Record<string, CmsTechDefinition>
  /** Aggregated CMS definition metadata across project records. */
  globalDefinitions?: Record<string, CmsTechDefinition>
  /** Optional list of active filter tokens so matched tags highlight on project cards. */
  activeTechs?: string[]
  projectTitle?: string
  projectCategory?: string
}

function TechStackTag({
  tech,
  isHighlighted = false,
  definitions,
  globalDefinitions,
  projectTitle,
  projectCategory,
}: {
  tech: string
  isHighlighted?: boolean
  definitions?: Record<string, CmsTechDefinition>
  globalDefinitions?: Record<string, CmsTechDefinition>
  projectTitle?: string
  projectCategory?: string
}) {
  const [open, setOpen] = useState(false)
  const meta = resolveTechUsageMetadata(tech, {
    projectDefinitions: definitions,
    globalDefinitions,
    projectTitle,
    projectCategory,
  })

  return (
    <Tooltip.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setOpen((prev) => !prev)
          }}
          aria-label={`${tech}: ${meta.description}`}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 cursor-help ${
            isHighlighted
              ? 'border-accent/45 bg-overlay-medium text-accent'
              : 'border-line-hairline bg-overlay text-ink-secondary hover:border-line-medium hover:text-ink'
          }`}
        >
          {tech}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onClick={(event) => event.stopPropagation()}
          className="z-50 w-64 sm:w-72 rounded-xl border border-line-medium bg-surface p-3 text-left shadow-xl"
        >
          <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-line-hairline">
            <span className="text-xs font-semibold text-ink">{tech}</span>
            {meta.layer && (
              <span className="text-[10px] font-mono text-accent truncate max-w-[9rem]">
                {meta.layer}
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-ink-secondary">
            {meta.description}
          </p>
          {meta.source === 'cms' && (
            <p className="mt-1.5 text-[10px] font-mono text-muted">
              From project CMS metadata
            </p>
          )}
          <Tooltip.Arrow className="fill-surface" width={10} height={5} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/** Shared interactive tech stack pills used by project cards, project rows and case studies. */
export function TechStack({
  items,
  limit,
  className = '',
  definitions,
  globalDefinitions,
  activeTechs,
  projectTitle,
  projectCategory,
}: TechStackProps) {
  if (!items.length) return null
  const visible = typeof limit === 'number' ? items.slice(0, limit) : items
  const hidden = items.length - visible.length
  const highlightedSet = new Set(
    (activeTechs ?? []).map((item) => item.trim().toLowerCase()).filter(Boolean),
  )

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={250}>
      <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
        {visible.map((tech) => (
          <TechStackTag
            key={tech}
            tech={tech}
            isHighlighted={highlightedSet.has(tech.trim().toLowerCase())}
            definitions={definitions}
            globalDefinitions={globalDefinitions}
            projectTitle={projectTitle}
            projectCategory={projectCategory}
          />
        ))}
        {hidden > 0 && (
          <span className="self-center px-1 text-[11px] text-muted">+{hidden}</span>
        )}
      </div>
    </Tooltip.Provider>
  )
}
