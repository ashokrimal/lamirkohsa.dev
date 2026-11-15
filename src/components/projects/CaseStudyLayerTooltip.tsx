'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import { Coins, Cpu } from 'lucide-react'

export interface TooltipLayerItem {
  layer: string
  context?: string
}

interface CaseStudyLayerTooltipProps {
  kind: 'cost' | 'tech'
  layers: TooltipLayerItem[]
  size?: 'sm' | 'md'
  align?: 'start' | 'center' | 'end'
  className?: string
}

const COST_LAYER_DEFINITIONS: Record<string, string> = {
  'Compute & Edge Hosting':
    'Frontend runtime, server rendering, static asset CDN, and edge routing delivery.',
  'Mobile Build & OTA':
    'Cloud native binary packaging and over-the-air bundle updates for mobile devices.',
  'Application Runtime':
    'Core server compute tier executing backend logic, API handlers, and background jobs.',
  'Database & Auth':
    'Managed real-time database sync, user authentication, and boundary security rules.',
  Persistence:
    'Managed cloud document database storing structured catalogs and transactional records.',
  'Relational Storage':
    'Managed PostgreSQL instance enforcing relational schemas and ACID transactions.',
  'Payments Gateway':
    'Hosted checkout infrastructure and webhook fee envelope for payment processing.',
  'Realtime Messaging':
    'Persistent WebSocket server tier enabling bi-directional low-latency updates.',
  'UI, Tooling & Source Control':
    'Open-source library licensing, build pipeline tooling, and Git repository hosting.',
}

const TECH_LAYER_DEFINITIONS: Record<string, string> = {
  'Frontend & SSR':
    'Handles server-side rendering, App Router navigation, and hybrid client/server delivery.',
  'UI Runtime':
    'Renders declarative component trees, state hooks, and accessible interactive views.',
  'Mobile Runtime':
    'Renders cross-platform native iOS and Android UI components from shared TypeScript.',
  'Mobile Platform':
    'Manages native device APIs, cloud build pipelines, and over-the-air patch releases.',
  'Type System':
    'Enforces compile-time type contracts across domain models, actions, and UI props.',
  'Design System':
    'Governs utility spacing, typography, contrast scales, and light/dark theme tokens.',
  'Motion Layer':
    'Powers GPU-composited transitions with reduced-motion accessibility compliance.',
  'Backend Runtime':
    'Executes server-side business logic, async I/O, and background orchestration.',
  'API Server':
    'Routes HTTP endpoints, validates payloads, and coordinates service controllers.',
  'Realtime Transport':
    'Maintains low-latency WebSocket channels for live multi-client state updates.',
  'Realtime & Auth BaaS':
    'Provides hosted authentication, live document sync, and rule-enforced access.',
  'Document Database':
    'Stores schema-flexible JSON/BSON records for catalogs, orders, and nested entities.',
  'Relational Database':
    'Stores structured SQL tables with foreign-key invariants and ACID guarantees.',
  'Payments & Webhooks':
    'Manages PCI-compliant checkout sessions and signed webhook order fulfillment.',
  'Engineering Tooling':
    'Supporting library or build dependency powering project-specific workflows.',
}

function normalizeLayers(layers: TooltipLayerItem[]): TooltipLayerItem[] {
  const seen = new Map<string, string[]>()
  for (const item of layers) {
    const key = item.layer.trim()
    if (!key) continue
    const list = seen.get(key) ?? []
    if (item.context && !list.includes(item.context)) {
      list.push(item.context)
    }
    seen.set(key, list)
  }
  return Array.from(seen.entries()).map(([layer, contexts]) => ({
    layer,
    context: contexts.length > 0 ? contexts.join(', ') : undefined,
  }))
}

export function CaseStudyLayerTooltip({
  kind,
  layers,
  size = 'sm',
  align = 'start',
  className = '',
}: CaseStudyLayerTooltipProps) {
  const normalized = normalizeLayers(layers)
  const definitions = kind === 'cost' ? COST_LAYER_DEFINITIONS : TECH_LAYER_DEFINITIONS
  const isCost = kind === 'cost'
  const title = isCost ? 'Project cost breakdown layers' : 'Tech stack breakdown layers'
  const fallbackSummary = isCost
    ? 'Tracks infrastructure, database, payment, and tooling cost tiers across the project.'
    : 'Maps each selected technology to its architectural responsibility in the stack.'
  const ariaLabel = isCost
    ? 'Explain project cost breakdown layers'
    : 'Explain tech stack breakdown layers'

  const iconSizeClass = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
  const Icon = isCost ? Coins : Cpu

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className={`inline-flex items-center justify-center rounded-sm text-accent transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 cursor-help shrink-0 ${className}`.trim()}
          >
            <Icon className={iconSizeClass} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align={align}
            sideOffset={8}
            collisionPadding={12}
            className="z-50 w-72 sm:w-80 rounded-xl border border-line-medium bg-surface p-3.5 text-left shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-line-hairline">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                {title}
              </p>
              {normalized.length > 0 && (
                <span className="text-[10px] font-mono text-muted tabular-nums">
                  {normalized.length} {normalized.length === 1 ? 'layer' : 'layers'}
                </span>
              )}
            </div>

            {normalized.length > 0 ? (
              <ul className="mt-2.5 space-y-2 max-h-64 overflow-y-auto pr-0.5">
                {normalized.map((item) => {
                  const definition =
                    definitions[item.layer] ??
                    (isCost
                      ? `Operational and hosting allocation for ${item.layer.toLowerCase()}.`
                      : `Architectural responsibility assigned to the ${item.layer.toLowerCase()} layer.`)
                  return (
                    <li key={item.layer} className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-ink">{item.layer}</span>
                        {item.context && (
                          <span className="text-[10px] font-mono text-muted truncate max-w-[9.5rem]">
                            {item.context}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-snug text-ink-secondary">{definition}</p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-ink-secondary">{fallbackSummary}</p>
            )}

            <Tooltip.Arrow className="fill-surface" width={10} height={5} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
