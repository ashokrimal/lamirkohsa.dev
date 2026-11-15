export interface CmsTechDefinition {
  layer?: string
  description: string
}

export interface TechUsageMetadata {
  layer?: string
  description: string
  adrWhy?: string
  source: 'cms' | 'catalog' | 'fallback'
}

export interface TechCatalogEntry {
  layer: string
  role: string
  adrWhy: string
}

export const TECH_ROLE_CATALOG: Record<string, TechCatalogEntry> = {
  'next.js': {
    layer: 'Frontend & SSR',
    role: 'App Router architecture, server rendering, routing, and edge-ready optimization',
    adrWhy: 'Selected for co-located server rendering, file-system routing, and built-in API route boundaries.',
  },
  react: {
    layer: 'UI Runtime',
    role: 'Component-driven interactive user interface and declarative state orchestration',
    adrWhy: 'Selected for composable state isolation and deterministic UI updates across views.',
  },
  'react.js': {
    layer: 'UI Runtime',
    role: 'Component-driven interactive views, stateful forms, and keyboard navigation',
    adrWhy: 'Selected for declarative component boundaries and strong ecosystem compatibility.',
  },
  'react native': {
    layer: 'Mobile Runtime',
    role: 'Cross-platform iOS & Android UI components tuned for low-bandwidth devices',
    adrWhy: 'Selected to maintain a single TypeScript codebase across mobile targets without native duplication.',
  },
  expo: {
    layer: 'Mobile Platform',
    role: 'Managed native build pipeline, push notifications, and OTA deployment workflow',
    adrWhy: 'Selected to accelerate device previews, binary builds, and over-the-air patch releases.',
  },
  typescript: {
    layer: 'Type System',
    role: 'End-to-end compile-time type safety across domain models, actions, and UI props',
    adrWhy: 'Enforces strict request/response contracts across client and server layers prior to deploy.',
  },
  'tailwind css': {
    layer: 'Design System',
    role: 'Token-driven utility styling, responsive breakpoints, and accessible contrast scales',
    adrWhy: 'Keeps spacing, typography, and color tokens deterministic with zero unused stylesheet bloat.',
  },
  tailwind: {
    layer: 'Design System',
    role: 'Token-driven utility styling, responsive breakpoints, and accessible contrast scales',
    adrWhy: 'Keeps spacing, typography, and color tokens deterministic across themes.',
  },
  'framer motion': {
    layer: 'Motion Layer',
    role: 'Physics-based state transitions and compositor-friendly micro-interactions',
    adrWhy: 'Provides GPU-composited transforms and built-in reduced-motion accessibility guards.',
  },
  'three.js': {
    layer: '3D Graphics',
    role: 'Real-time WebGL scene graph, custom lighting, and spatial camera rendering',
    adrWhy: 'Enables interactive 3D visuals directly inside browser viewports with hardware acceleration.',
  },
  'react three fiber': {
    layer: '3D Scene Runtime',
    role: 'Declarative React bindings for Three.js WebGL scenes and frame loops',
    adrWhy: 'Integrates reactive UI state directly with 3D meshes and camera choreography.',
  },
  webgl: {
    layer: 'Graphics Pipeline',
    role: 'Hardware-accelerated GPU shader and canvas rendering inside the browser',
    adrWhy: 'Delivers smooth 60fps 3D geometry and post-processing without external plugins.',
  },
  glsl: {
    layer: 'Shaders',
    role: 'Custom vertex and fragment shaders for procedural lighting and surface effects',
    adrWhy: 'Executes per-pixel visual effects directly on the GPU.',
  },
  gsap: {
    layer: 'Motion Choreography',
    role: 'Scroll-synchronized timelines and precision camera/keyframe interpolation',
    adrWhy: 'Provides deterministic scroll scrubbing across multi-chapter experiences.',
  },
  'node.js': {
    layer: 'Backend Runtime',
    role: 'Server execution environment, API orchestration, and asynchronous job handling',
    adrWhy: 'Shares TypeScript/JavaScript language runtime between frontend validation and backend handlers.',
  },
  'express.js': {
    layer: 'API Server',
    role: 'REST endpoint routing, middleware validation, and request lifecycle handling',
    adrWhy: 'Chosen for lightweight, unopinionated HTTP middleware composition and predictable routing.',
  },
  express: {
    layer: 'API Server',
    role: 'HTTP routing, authentication guards, and service controller layer',
    adrWhy: 'Chosen for explicit middleware pipelines and low operational overhead.',
  },
  'socket.io': {
    layer: 'Realtime Transport',
    role: 'Bi-directional low-latency WebSocket event channels with automatic reconnection',
    adrWhy: 'Handles room-based pub/sub events with automatic transport fallback and exponential backoff.',
  },
  firebase: {
    layer: 'Realtime & Auth BaaS',
    role: 'Live document synchronization, role-scoped security rules, and authentication',
    adrWhy: 'Eliminates custom auth/socket boilerplate while enforcing document rules at the boundary.',
  },
  mongodb: {
    layer: 'Document Database',
    role: 'Flexible schema persistence for catalogs, inventory ledgers, and transactional records',
    adrWhy: 'Supports nested catalog/order attributes cleanly with indexed query aggregation.',
  },
  postgres: {
    layer: 'Relational Database',
    role: 'ACID-compliant structured data storage and relational queries',
    adrWhy: 'Guarantees transactional integrity, foreign-key invariants, and indexed queries.',
  },
  postgresql: {
    layer: 'Relational Database',
    role: 'ACID-compliant structured data storage and relational queries',
    adrWhy: 'Guarantees transactional integrity and schema-validated relational modeling.',
  },
  drizzle: {
    layer: 'Database ORM',
    role: 'Type-safe SQL query builder and schema migrations over PostgreSQL',
    adrWhy: 'Pairs zero-overhead SQL queries with compile-time schema verification.',
  },
  'drizzle orm': {
    layer: 'Database ORM',
    role: 'Type-safe SQL query builder and schema migrations over PostgreSQL',
    adrWhy: 'Pairs zero-overhead SQL queries with compile-time schema verification.',
  },
  prisma: {
    layer: 'Database ORM',
    role: 'Schema modeling, type-safe database client, and automated SQL migrations',
    adrWhy: 'Streamlines relational data access with generated TypeScript types.',
  },
  stripe: {
    layer: 'Payments & Webhooks',
    role: 'PCI-compliant checkout sessions and signed webhook order fulfillment pipelines',
    adrWhy: 'Offloads card handling to PCI-certified sessions verified via HMAC webhook signatures.',
  },
  'radix ui': {
    layer: 'Accessible UI Primitives',
    role: 'WAI-ARIA compliant headless primitives for dialogs, tooltips, and menus',
    adrWhy: 'Guarantees keyboard navigation, focus management, and screen-reader semantics.',
  },
  vercel: {
    layer: 'Edge & Hosting',
    role: 'Global CDN edge routing, ISR page caching, and serverless deployment pipeline',
    adrWhy: 'Delivers fast global TTFB with automatic preview and production builds.',
  },
  python: {
    layer: 'Backend & Automation',
    role: 'Data processing pipelines, scripting automation, and backend API services',
    adrWhy: 'Offers mature scientific, automation, and web service tooling.',
  },
}

const DEFINITION_KEYS = [
  'techDefinitions',
  'techDescriptions',
  'techRoles',
  'techMeta',
  'stackMeta',
  'stackDetails',
  'techDetails',
] as const

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readDefinitionRecord(raw: unknown): CmsTechDefinition | undefined {
  if (typeof raw === 'string') {
    const description = raw.trim()
    return description ? { description } : undefined
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const record = raw as Record<string, unknown>
  const description =
    asNonEmptyString(record.description) ??
    asNonEmptyString(record.role) ??
    asNonEmptyString(record.usage) ??
    asNonEmptyString(record.definition) ??
    asNonEmptyString(record.summary)
  if (!description) return undefined
  const layer =
    asNonEmptyString(record.layer) ??
    asNonEmptyString(record.category) ??
    asNonEmptyString(record.group)
  return layer ? { layer, description } : { description }
}

/**
 * Extracts optional per-technology definition metadata stored in a project CMS payload.
 * Supports object maps (`{ "Next.js": "..." | { description, role, layer } }`),
 * structured arrays (`[{ name, description, role, layer }]`), and object items inside `techStack`/`tags`.
 */
export function extractCmsTechDefinitions(
  payload: Record<string, unknown>,
): Record<string, CmsTechDefinition> | undefined {
  const result: Record<string, CmsTechDefinition> = {}

  const addEntry = (rawKey: unknown, rawValue: unknown) => {
    const key = asNonEmptyString(rawKey)?.toLowerCase()
    if (!key) return
    const parsed = readDefinitionRecord(rawValue)
    if (!parsed) return
    result[key] = parsed
  }

  for (const field of DEFINITION_KEYS) {
    const rawField = payload[field]
    if (!rawField) continue

    if (Array.isArray(rawField)) {
      for (const item of rawField) {
        if (!item || typeof item !== 'object') continue
        const obj = item as Record<string, unknown>
        addEntry(obj.name ?? obj.label ?? obj.tech ?? obj.technology ?? obj.title, obj)
      }
    } else if (typeof rawField === 'object') {
      for (const [key, value] of Object.entries(rawField as Record<string, unknown>)) {
        addEntry(key, value)
      }
    }
  }

  for (const listField of ['techStack', 'tags'] as const) {
    const rawList = payload[listField]
    if (!Array.isArray(rawList)) continue
    for (const item of rawList) {
      if (!item || typeof item !== 'object') continue
      const obj = item as Record<string, unknown>
      addEntry(obj.name ?? obj.label ?? obj.tech ?? obj.technology ?? obj.title, obj)
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Aggregates CMS-provided tech definitions across published project records
 * so shared technology tags can inherit CMS metadata even on entries without per-row overrides.
 */
export function mergeCmsTechDefinitions(
  projects: Array<{ techDefinitions?: Record<string, CmsTechDefinition> }>,
): Record<string, CmsTechDefinition> {
  const merged: Record<string, CmsTechDefinition> = {}
  for (const project of projects) {
    if (!project.techDefinitions) continue
    for (const [key, value] of Object.entries(project.techDefinitions)) {
      const normalized = key.trim().toLowerCase()
      if (!normalized || merged[normalized]) continue
      merged[normalized] = value
    }
  }
  return merged
}

/**
 * Resolves a technology tag's usage summary and architectural layer, checking:
 * 1) This project's CMS entry definition metadata
 * 2) Cross-project CMS entry definition metadata
 * 3) Curated architectural role catalog
 * 4) Project-contextual fallback description
 */
export function resolveTechUsageMetadata(
  techName: string,
  options?: {
    projectDefinitions?: Record<string, CmsTechDefinition>
    globalDefinitions?: Record<string, CmsTechDefinition>
    projectTitle?: string
    projectCategory?: string
  },
): TechUsageMetadata {
  const normalized = techName.trim().toLowerCase()
  const catalogEntry = TECH_ROLE_CATALOG[normalized]

  const projectCms = options?.projectDefinitions?.[normalized]
  if (projectCms?.description) {
    return {
      layer: projectCms.layer ?? catalogEntry?.layer,
      description: projectCms.description,
      adrWhy: catalogEntry?.adrWhy,
      source: 'cms',
    }
  }

  const globalCms = options?.globalDefinitions?.[normalized]
  if (globalCms?.description) {
    return {
      layer: globalCms.layer ?? catalogEntry?.layer,
      description: globalCms.description,
      adrWhy: catalogEntry?.adrWhy,
      source: 'cms',
    }
  }

  if (catalogEntry) {
    return {
      layer: catalogEntry.layer,
      description: catalogEntry.role,
      adrWhy: catalogEntry.adrWhy,
      source: 'catalog',
    }
  }

  const categoryHint = options?.projectCategory?.trim().toLowerCase()
  const fallbackDescription = categoryHint
    ? `Core ${techName} capability supporting ${categoryHint} workflows in this project.`
    : `Core ${techName} implementation dependency powering project workflows.`

  return {
    layer: 'Engineering Tooling',
    description: fallbackDescription,
    source: 'fallback',
  }
}
