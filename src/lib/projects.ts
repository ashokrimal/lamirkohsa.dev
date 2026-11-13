import { getPublishedCmsContentResult, type CmsRecord } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS, type CmsResult } from '@/lib/cms-schema'
import { toSlug } from '@/lib/slug'

export interface ProjectPhase {
  phase?: string
  name: string
  period?: string
  description?: string
  completed?: boolean
}

export interface ProjectEntry {
  id: number
  slug: string
  title: string
  category?: string
  image?: string
  altText?: string
  completionDate?: string
  period?: string
  status?: string
  summary?: string
  description?: string
  challenge?: string
  solution?: string
  model?: string
  duration?: string
  cost?: string
  caseStudyPlan?: string
  documentation?: string
  srsDoc?: string
  architectureDoc?: string
  apiDoc?: string
  readmeDoc?: string
  testPlanDoc?: string
  runbookDoc?: string
  userManualDoc?: string
  phases: ProjectPhase[]
  features: string[]
  techStack: string[]
  featured: boolean
  github?: string
  live?: string
}

export interface ProjectFilterTag {
  label: string
  normalized: string
  count: number
}

export interface TechStackDetail {
  name: string
  layer: string
  role: string
}

export interface CostBreakdownItem {
  layer: string
  provider: string
  cost: string
}

export type DocumentationTrack = 'process' | 'product'

export type DocumentationCategory =
  | 'Planning'
  | 'Architecture'
  | 'Development'
  | 'Testing'
  | 'Operations'
  | 'End-User'
  | 'Custom'

export interface DocKeyValuePair {
  label: string
  value: string
  note?: string
}

export interface DocContentBlock {
  type: 'paragraph' | 'list' | 'ordered' | 'code' | 'subheading' | 'table' | 'kv'
  text?: string
  language?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
  pairs?: DocKeyValuePair[]
}

export interface DocumentationSection {
  id: string
  number: string
  title: string
  category: DocumentationCategory
  track: DocumentationTrack
  purpose: string
  source: 'cms' | 'structured'
  blocks: DocContentBlock[]
}

export interface DocumentationWorkflowStep {
  step: string
  title: string
  summary: string
  practices: string[]
  linkedDocId: string
  linkedDocLabel: string
}

export interface DocumentationToolGroup {
  domain: string
  tools: string
  usage: string
}

export interface ProjectDossier {
  challengeText?: string
  solutionText?: string
  caseStudyPlanText?: string
  duration: {
    headline: string
    period?: string
    completionDate?: string
    detail: string
  }
  model: {
    name: string
    cadence: string
    rationale: string
  }
  cost: {
    headline: string
    summary: string
    breakdown: CostBreakdownItem[]
  }
  techDetails: TechStackDetail[]
  hasCustomDocumentation: boolean
  documentationSections: DocumentationSection[]
  workflowSteps: DocumentationWorkflowStep[]
  recommendedTools: DocumentationToolGroup[]
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function dedupeTags(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of values) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/**
 * Maps a CMS project record to the view model. Missing fields stay missing —
 * the UI omits or enriches them cleanly rather than inventing placeholder copy.
 */
export function mapProjectRecord(record: CmsRecord): ProjectEntry {
  const payload = record.payload ?? {}
  const techStack = dedupeTags([
    ...stringArray(payload.techStack),
    ...stringArray(payload.tags),
  ])

  return {
    id: record.id,
    slug: record.slug || toSlug(record.title),
    title: record.title,
    category: optionalString(payload.category),
    image: optionalString(payload.imageUrl),
    altText: optionalString(payload.altText),
    completionDate: optionalString(payload.completionDate),
    period: optionalString(payload.period),
    status: optionalString(payload.status),
    summary: optionalString(payload.summary),
    description: optionalString(payload.description),
    challenge:
      optionalString(payload.challenge) ??
      optionalString(payload.description) ??
      optionalString(payload.summary),
    solution: optionalString(payload.solution),
    model:
      optionalString(payload.model) ??
      optionalString(payload.methodology) ??
      optionalString(payload.developmentModel) ??
      optionalString(payload.processModel),
    duration: optionalString(payload.duration) ?? optionalString(payload.timeline),
    cost: optionalString(payload.cost) ?? optionalString(payload.budget),
    caseStudyPlan: optionalString(payload.caseStudyPlan) ?? optionalString(payload.plan),
    documentation: optionalString(payload.documentation) ?? optionalString(payload.docs),
    srsDoc: optionalString(payload.srsDoc) ?? optionalString(payload.srs),
    architectureDoc: optionalString(payload.architectureDoc) ?? optionalString(payload.architecture),
    apiDoc: optionalString(payload.apiDoc) ?? optionalString(payload.apiDocs),
    readmeDoc: optionalString(payload.readmeDoc) ?? optionalString(payload.readme),
    testPlanDoc: optionalString(payload.testPlanDoc) ?? optionalString(payload.testPlan),
    runbookDoc: optionalString(payload.runbookDoc) ?? optionalString(payload.runbook),
    userManualDoc: optionalString(payload.userManualDoc) ?? optionalString(payload.userManual),
    phases: Array.isArray(payload.phases)
      ? (payload.phases as ProjectPhase[]).filter((phase) => Boolean(phase?.name))
      : [],
    features: stringArray(payload.features),
    techStack,
    featured: payload.featured === true,
    github: optionalString(payload.github),
    live: optionalString(payload.live),
  }
}

export function mapProjectRecords(records: CmsRecord[]): ProjectEntry[] {
  return records.map(mapProjectRecord)
}

/** Extracts sorted technology stack tags and usage counts from CMS projects. */
export function extractProjectTechTags(projects: ProjectEntry[]): ProjectFilterTag[] {
  const counts = new Map<string, ProjectFilterTag>()

  for (const project of projects) {
    const seenInProject = new Set<string>()
    for (const raw of project.techStack) {
      const label = raw.trim()
      if (!label) continue
      const normalized = label.toLowerCase()
      if (seenInProject.has(normalized)) continue
      seenInProject.add(normalized)

      const existing = counts.get(normalized)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(normalized, { label, normalized, count: 1 })
      }
    }
  }

  return Array.from(counts.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.label.localeCompare(b.label)
  })
}

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

function parseShortDateToken(token: string, fallbackYear = 2024): Date | null {
  const cleaned = token.trim().replace(/,/g, '')
  const monthDayYear = cleaned.match(/^([A-Za-z]{3,})\s+(\d{1,2})(?:\s+(\d{4}))?$/)
  if (monthDayYear) {
    const monthKey = monthDayYear[1].slice(0, 3).toLowerCase()
    const month = MONTH_INDEX[monthKey]
    if (month === undefined) return null
    const day = Number(monthDayYear[2])
    const year = monthDayYear[3] ? Number(monthDayYear[3]) : fallbackYear
    return new Date(year, month, day)
  }
  const monthYear = cleaned.match(/^([A-Za-z]{3,})\s+(\d{4})$/)
  if (monthYear) {
    const monthKey = monthYear[1].slice(0, 3).toLowerCase()
    const month = MONTH_INDEX[monthKey]
    if (month === undefined) return null
    return new Date(Number(monthYear[2]), month, 1)
  }
  return null
}

function inferYear(project: ProjectEntry): number {
  const source = `${project.period ?? ''} ${project.completionDate ?? ''}`
  const match = source.match(/\b(20\d{2})\b/)
  return match ? Number(match[1]) : 2024
}

function inferDuration(project: ProjectEntry): ProjectDossier['duration'] {
  if (project.duration) {
    return {
      headline: project.duration,
      period: project.period,
      completionDate: project.completionDate,
      detail: project.period
        ? `Executed over ${project.period}${project.phases.length ? ` across ${project.phases.length} structured phases` : ''}.`
        : 'Explicit timeline recorded in CMS.',
    }
  }

  const year = inferYear(project)
  const phasePeriods = project.phases
    .map((p) => p.period?.trim())
    .filter((p): p is string => Boolean(p))

  if (phasePeriods.length > 0) {
    const firstParts = phasePeriods[0].split(/[–—-]/)
    const lastParts = phasePeriods[phasePeriods.length - 1].split(/[–—-]/)
    const startDate = parseShortDateToken(firstParts[0] || '', year)
    const endDate = parseShortDateToken(lastParts[lastParts.length - 1] || '', year)

    if (startDate && endDate && endDate.getTime() >= startDate.getTime()) {
      const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1)
      const weeks = Math.max(1, Math.round(days / 7))
      const headline = weeks >= 12 ? `${weeks} weeks (~${Math.round(weeks / 4.3)} months)` : `${weeks} weeks`
      return {
        headline,
        period: project.period,
        completionDate: project.completionDate,
        detail: `${days} calendar days across ${project.phases.length} milestone phases${project.period ? ` (${project.period})` : ''}.`,
      }
    }
  }

  if (project.period) {
    const parts = project.period.split(/[–—-]/).map((part) => part.trim())
    if (parts.length === 2) {
      const start = parseShortDateToken(parts[0], year)
      const end = parseShortDateToken(parts[1], year)
      if (start && end && end.getTime() >= start.getTime()) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
        const approxWeeks = months * 4
        return {
          headline: `${approxWeeks} weeks (${months} ${months === 1 ? 'month' : 'months'})`,
          period: project.period,
          completionDate: project.completionDate,
          detail: `Window spanning ${project.period}.`,
        }
      }
    }
    return {
      headline: project.period,
      period: project.period,
      completionDate: project.completionDate,
      detail: 'Delivery window recorded for this build.',
    }
  }

  const lowerStatus = project.status?.toLowerCase() ?? ''
  if (lowerStatus.includes('ongoing')) {
    return {
      headline: 'Ongoing iteration',
      completionDate: project.completionDate,
      detail: 'Active development cycle with continuous incremental releases.',
    }
  }

  return {
    headline: project.completionDate || 'Single-cycle build',
    completionDate: project.completionDate,
    detail: project.completionDate
      ? `Completed in ${project.completionDate}.`
      : 'Iterative sprint schedule.',
  }
}

const TECH_ROLE_MAP: Record<string, { layer: string; role: string; adrWhy: string }> = {
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
  'framer motion': {
    layer: 'Motion Layer',
    role: 'Physics-based state transitions and compositor-friendly micro-interactions',
    adrWhy: 'Provides GPU-composited transforms and built-in reduced-motion accessibility guards.',
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
  stripe: {
    layer: 'Payments & Webhooks',
    role: 'PCI-compliant checkout sessions and signed webhook order fulfillment pipelines',
    adrWhy: 'Offloads card handling to PCI-certified sessions verified via HMAC webhook signatures.',
  },
}

function describeTechStack(stack: string[]): TechStackDetail[] {
  return stack.map((name) => {
    const info = TECH_ROLE_MAP[name.trim().toLowerCase()]
    return {
      name,
      layer: info?.layer ?? 'Engineering Tooling',
      role: info?.role ?? `Core implementation dependency supporting ${name} workflows`,
    }
  })
}

function inferModel(project: ProjectEntry): ProjectDossier['model'] {
  if (project.model) {
    return {
      name: project.model,
      cadence: project.phases.length
        ? `${project.phases.length} planned phases · ${project.status || 'Documented'}`
        : project.status || 'Custom engineering workflow',
      rationale:
        project.caseStudyPlan ||
        'Process model explicitly documented in the project CMS record to align scope, validation, and release quality.',
    }
  }

  const lowerStatus = (project.status || '').toLowerCase()
  if (project.phases.length >= 4) {
    return {
      name: 'Iterative Phased Agile Model',
      cadence: `${project.phases.length} sequential phases · weekly milestone verification`,
      rationale:
        'Combined structured discovery and schema design up front with iterative feature sprints so architecture remained decoupled before UI polish and production deployment.',
    }
  }
  if (project.phases.length > 0) {
    return {
      name: 'Phased Incremental Delivery',
      cadence: `${project.phases.length} delivery stages`,
      rationale:
        'Each engineering milestone validated core data flow before advancing to the next layer.',
    }
  }
  if (lowerStatus.includes('prototype') || lowerStatus.includes('concept')) {
    return {
      name: 'Rapid Prototyping & Validation Model',
      cadence: 'Short exploration cycles',
      rationale:
        'Prioritized interactive proof-of-concept validation and core architecture feasibility prior to scaling infrastructure.',
    }
  }
  return {
    name: 'Incremental Feature Delivery',
    cadence: project.status || 'Continuous iteration',
    rationale:
      'Built through modular vertical slices covering schema, API contracts, and responsive UI.',
  }
}

function inferCost(project: ProjectEntry, stack: string[]): ProjectDossier['cost'] {
  if (project.cost) {
    return {
      headline: project.cost,
      summary: 'Recorded project budget & operational cost envelope.',
      breakdown: buildInfraBreakdown(project, stack),
    }
  }

  const hasStripe = stack.some((t) => t.toLowerCase().includes('stripe'))
  const breakdown = buildInfraBreakdown(project, stack)

  return {
    headline: hasStripe ? '$0 fixed infra · usage-based payments' : '$0 infrastructure (Free-tier stack)',
    summary: hasStripe
      ? 'Zero fixed monthly hosting overhead using free-tier cloud services; payment processing incurs standard per-transaction fees in live mode.'
      : 'Built and operated at zero recurring cloud cost by leveraging open-source frameworks and managed developer free tiers.',
    breakdown,
  }
}

function buildInfraBreakdown(project: ProjectEntry, stack: string[]): CostBreakdownItem[] {
  const lower = stack.map((t) => t.toLowerCase())
  const items: CostBreakdownItem[] = []

  const usesVercelOrNext =
    lower.some((t) => t.includes('next') || t.includes('react')) ||
    Boolean(project.live && project.live.includes('vercel.app'))
  if (usesVercelOrNext) {
    items.push({
      layer: 'Compute & Edge Hosting',
      provider: project.live?.includes('vercel') ? 'Vercel Hobby Tier' : 'Vercel / Static CDN',
      cost: '$0 / month',
    })
  } else if (lower.some((t) => t.includes('expo') || t.includes('react native'))) {
    items.push({
      layer: 'Mobile Build & OTA',
      provider: 'Expo Free Tier',
      cost: '$0 / month',
    })
  } else {
    items.push({
      layer: 'Application Runtime',
      provider: 'Standard Free-Tier Cloud / Local',
      cost: '$0 / month',
    })
  }

  if (lower.some((t) => t.includes('firebase'))) {
    items.push({
      layer: 'Database & Auth',
      provider: 'Firebase Spark Plan',
      cost: '$0 / month',
    })
  } else if (lower.some((t) => t.includes('mongo'))) {
    items.push({
      layer: 'Persistence',
      provider: 'MongoDB Atlas M0 Shared Tier',
      cost: '$0 / month',
    })
  } else if (lower.some((t) => t.includes('postgres'))) {
    items.push({
      layer: 'Relational Storage',
      provider: 'Managed Postgres Free Tier',
      cost: '$0 / month',
    })
  }

  if (lower.some((t) => t.includes('stripe'))) {
    items.push({
      layer: 'Payments Gateway',
      provider: 'Stripe Testnet / Standard Processing',
      cost: '$0 fixed (per-tx in live)',
    })
  }

  if (lower.some((t) => t.includes('socket'))) {
    items.push({
      layer: 'Realtime Messaging',
      provider: 'Socket.io (Self-hosted WebSockets)',
      cost: '$0 licensing',
    })
  }

  items.push({
    layer: 'UI, Tooling & Source Control',
    provider: 'Open-Source Ecosystem & GitHub',
    cost: '$0 (MIT / Apache)',
  })

  return items
}

function parseMarkdownBlocks(markdown: string): DocContentBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: DocContentBlock[] = []
  let paragraphBuf: string[] = []
  let listBuf: string[] = []
  let orderedBuf: string[] = []
  let inCode = false
  let codeLang = ''
  let codeBuf: string[] = []

  const flushParagraph = () => {
    if (paragraphBuf.length === 0) return
    blocks.push({ type: 'paragraph', text: paragraphBuf.join(' ').trim() })
    paragraphBuf = []
  }

  const flushLists = () => {
    if (listBuf.length > 0) {
      blocks.push({ type: 'list', items: [...listBuf] })
      listBuf = []
    }
    if (orderedBuf.length > 0) {
      blocks.push({ type: 'ordered', items: [...orderedBuf] })
      orderedBuf = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (!inCode) {
        flushParagraph()
        flushLists()
        inCode = true
        codeLang = trimmed.slice(3).trim()
        codeBuf = []
      } else {
        blocks.push({
          type: 'code',
          language: codeLang || undefined,
          text: codeBuf.join('\n'),
        })
        inCode = false
        codeLang = ''
        codeBuf = []
      }
      continue
    }

    if (inCode) {
      codeBuf.push(line)
      continue
    }

    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      flushLists()
      blocks.push({ type: 'subheading', text: headingMatch[1].trim() })
      continue
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/)
    if (ulMatch) {
      flushParagraph()
      if (orderedBuf.length) flushLists()
      listBuf.push(ulMatch[1].trim())
      continue
    }

    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (olMatch) {
      flushParagraph()
      if (listBuf.length) flushLists()
      orderedBuf.push(olMatch[1].trim())
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushLists()
      continue
    }

    flushLists()
    paragraphBuf.push(trimmed)
  }

  if (inCode && codeBuf.length) {
    blocks.push({
      type: 'code',
      language: codeLang || undefined,
      text: codeBuf.join('\n'),
    })
  }
  flushParagraph()
  flushLists()

  return blocks
}

function parseMarkdownDocumentation(markdown: string): DocumentationSection[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const sections: DocumentationSection[] = []
  let current: DocumentationSection | null = null
  let chunkLines: string[] = []

  const commitChunk = () => {
    if (!current) return
    const parsed = parseMarkdownBlocks(chunkLines.join('\n'))
    current.blocks.push(...parsed)
    chunkLines = []
  }

  const startSection = (title: string) => {
    commitChunk()
    const num = String(sections.length + 1).padStart(2, '0')
    const lower = title.toLowerCase()
    const isProcess =
      lower.includes('srs') ||
      lower.includes('prd') ||
      lower.includes('requirement') ||
      lower.includes('test') ||
      lower.includes('qa') ||
      lower.includes('runbook') ||
      lower.includes('deploy') ||
      lower.includes('process') ||
      lower.includes('operation')
    const category: DocumentationCategory =
      lower.includes('srs') || lower.includes('requirement')
        ? 'Planning'
        : lower.includes('architect') || lower.includes('design')
          ? 'Architecture'
          : lower.includes('api') || lower.includes('readme') || lower.includes('setup')
            ? 'Development'
            : lower.includes('test') || lower.includes('qa')
              ? 'Testing'
              : lower.includes('deploy') || lower.includes('runbook')
                ? 'Operations'
                : lower.includes('manual') || lower.includes('release')
                  ? 'End-User'
                  : 'Custom'

    current = {
      id: `doc-custom-${toSlug(title) || sections.length + 1}`,
      number: num,
      title: title.trim(),
      category,
      track: isProcess ? 'process' : 'product',
      purpose: 'Custom project documentation authored in the CMS record.',
      source: 'cms',
      blocks: [],
    }
    sections.push(current)
  }

  for (const line of lines) {
    const h2Match = line.trim().match(/^#{1,2}\s+(.+)$/)
    if (h2Match) {
      startSection(h2Match[1])
      continue
    }
    if (!current) {
      startSection('Author Documentation Notes')
    }
    chunkLines.push(line)
  }

  commitChunk()
  return sections.filter((section) => section.blocks.length > 0)
}

function buildUserStoriesRows(project: ProjectEntry): string[][] {
  const lowerCategory = (project.category || '').toLowerCase()
  const primaryRole = lowerCategory.includes('mobile')
    ? 'mobile user'
    : lowerCategory.includes('commerce') || lowerCategory.includes('marketplace')
      ? 'customer'
      : 'user'

  if (project.features.length > 0) {
    return project.features.map((feature, idx) => {
      const clean = feature.replace(/\.$/, '')
      const lowerFeature = clean.charAt(0).toLowerCase() + clean.slice(1)
      return [
        `US-${String(idx + 1).padStart(2, '0')}`,
        `As a ${primaryRole}, I want ${lowerFeature}, so that core workflows stay reliable and self-explanatory.`,
        clean,
      ]
    })
  }

  return [
    [
      'US-01',
      `As a ${primaryRole}, I want direct access to ${project.title}'s core workflow without unnecessary navigation friction.`,
      'Primary workflow completion',
    ],
    [
      'US-02',
      'As an administrator or maintainer, I want deterministic data persistence and clear error states so operations remain predictable.',
      'Validated state persistence & recovery',
    ],
  ]
}

function buildSystemDiagram(project: ProjectEntry, stack: string[]): string {
  const lower = stack.map((t) => t.toLowerCase())
  const clientLabel = lower.some((t) => t.includes('react native') || t.includes('expo'))
    ? `Mobile Client (${stack.filter((s) => /expo|react native|typescript/i.test(s)).join(' + ') || 'Expo / React Native'})`
    : `Web Client (${stack.filter((s) => /next|react|tailwind|typescript/i.test(s)).join(' + ') || 'Browser UI'})`

  const backendLayer = lower.some((t) => t.includes('express') || t.includes('node'))
    ? `Application / API Layer (${stack.filter((s) => /node|express|next/i.test(s)).join(' + ')})`
    : lower.some((t) => t.includes('next'))
      ? 'Next.js Server Actions & Route Handlers (/api/*)'
      : 'Application Service & Business Logic Layer'

  const integrations: string[] = []
  if (lower.some((t) => t.includes('firebase'))) integrations.push('Firebase Auth / Realtime Sync')
  if (lower.some((t) => t.includes('mongo'))) integrations.push('MongoDB Persistence Layer')
  if (lower.some((t) => t.includes('postgres'))) integrations.push('PostgreSQL Relational Store')
  if (lower.some((t) => t.includes('stripe'))) integrations.push('Stripe Checkout & Signed Webhooks')
  if (lower.some((t) => t.includes('socket'))) integrations.push('Socket.io Bi-Directional Channels')
  if (integrations.length === 0) integrations.push('Local / Managed Persistence & Static Configuration')

  return [
    `[ ${clientLabel} ]`,
    '          │',
    '          ▼  (HTTPS / Typed Payloads)',
    `[ ${backendLayer} ]`,
    '          │',
    ...integrations.map((item, idx) =>
      `${idx === integrations.length - 1 ? '          └──▶ ' : '          ├──▶ '}[ ${item} ]`,
    ),
  ].join('\n')
}

function buildEnvTemplate(project: ProjectEntry, stack: string[]): string {
  const lower = stack.map((t) => t.toLowerCase())
  const lines: string[] = [`# .env.example — ${project.title}`]

  if (lower.some((t) => t.includes('next'))) {
    lines.push('NEXT_PUBLIC_SITE_URL="http://localhost:3000"')
  } else {
    lines.push('PORT=3000')
    lines.push('NODE_ENV=development')
  }

  if (lower.some((t) => t.includes('postgres'))) {
    lines.push('DATABASE_URL="postgresql://user:password@localhost:5432/app_db"')
  }
  if (lower.some((t) => t.includes('mongo'))) {
    lines.push('MONGODB_URI="mongodb+srv://user:password@cluster.example.net/app_db"')
  }
  if (lower.some((t) => t.includes('firebase'))) {
    lines.push('NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"')
    lines.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"')
  }
  if (lower.some((t) => t.includes('stripe'))) {
    lines.push('STRIPE_SECRET_KEY="sk_test_..."')
    lines.push('STRIPE_WEBHOOK_SECRET="whsec_..."')
  }
  if (lower.some((t) => t.includes('socket'))) {
    lines.push('SOCKET_CORS_ORIGIN="http://localhost:3000"')
  }

  return lines.join('\n')
}

function buildApiRows(project: ProjectEntry, stack: string[]): string[][] {
  const lower = stack.map((t) => t.toLowerCase())
  const slugResource = project.slug.split('-')[0] || 'items'
  const rows: string[][] = [
    ['GET', '/api/health', 'Public', '200 OK { status, uptime } · 503 Unavailable'],
    ['GET', `/api/${slugResource}`, 'Public / Session', '200 JSON list · 400 Invalid query params'],
    ['POST', `/api/${slugResource}`, 'Authenticated Role', '201 Created · 401 Unauthorized · 422 Validation'],
    ['PATCH', `/api/${slugResource}/:id`, 'Owner / Admin', '200 Updated · 403 Forbidden · 404 Missing'],
  ]

  if (lower.some((t) => t.includes('stripe'))) {
    rows.push([
      'POST',
      '/api/webhooks/stripe',
      'HMAC Signature (Stripe-Signature)',
      '200 Ack · 400 Invalid signature',
    ])
  }
  if (lower.some((t) => t.includes('socket'))) {
    rows.push([
      'WSS',
      '/socket.io (room events)',
      'Session Handshake Token',
      'emit(state:sync) · ack timeout retry',
    ])
  }

  return rows
}

function buildTestCases(project: ProjectEntry, stack: string[]): string[][] {
  const lower = stack.map((t) => t.toLowerCase())
  const cases: string[][] = []

  if (project.features.length > 0) {
    project.features.slice(0, 3).forEach((feature, idx) => {
      cases.push([
        `QA-0${idx + 1}`,
        feature,
        'Valid primary user input & session',
        'Operation succeeds and persists deterministically',
        'E2E / Integration',
      ])
    })
  } else {
    cases.push([
      'QA-01',
      `${project.title} primary workflow`,
      'Standard valid payload submitted',
      'Expected domain state updates without console errors',
      'Integration',
    ])
  }

  cases.push([
    `QA-0${cases.length + 1}`,
    'Invalid input & empty-state guard',
    'Malformed fields or empty upstream record',
    '422/graceful UI message rendered; no crash',
    'Boundary / Unit',
  ])

  if (lower.some((t) => t.includes('stripe'))) {
    cases.push([
      `QA-0${cases.length + 1}`,
      'Webhook signature verification',
      'Tampered or missing Stripe-Signature header',
      '400 rejected before order mutation',
      'Security',
    ])
  }

  if (lower.some((t) => t.includes('socket'))) {
    cases.push([
      `QA-0${cases.length + 1}`,
      'Socket reconnection recovery',
      'Client drops network mid-session and reconnects',
      'Rejoins room & reconciles missed state cleanly',
      'Resilience',
    ])
  }

  return cases
}

function buildDocumentationSuite(
  project: ProjectEntry,
  parsedStack: string[],
  techDetails: TechStackDetail[],
  duration: ProjectDossier['duration'],
  model: ProjectDossier['model'],
  cost: ProjectDossier['cost'],
  challengeText?: string,
  solutionText?: string,
): {
  sections: DocumentationSection[]
  workflowSteps: DocumentationWorkflowStep[]
  recommendedTools: DocumentationToolGroup[]
} {
  const slug = project.slug || toSlug(project.title)
  const lowerStack = parsedStack.map((s) => s.toLowerCase())
  const isExpo = lowerStack.some((t) => t.includes('expo') || t.includes('react native'))
  const isNext = lowerStack.some((t) => t.includes('next'))

  const overrideOrBuild = (
    overrideMarkdown: string | undefined,
    meta: Omit<DocumentationSection, 'blocks' | 'source'>,
    defaultBlocks: DocContentBlock[],
  ): DocumentationSection => {
    if (overrideMarkdown) {
      return {
        ...meta,
        source: 'cms',
        blocks: parseMarkdownBlocks(overrideMarkdown),
      }
    }
    return {
      ...meta,
      source: 'structured',
      blocks: defaultBlocks,
    }
  }

  // --- PROCESS DOCUMENTATION (Manages how the software is built) ---

  const srsSection = overrideOrBuild(
    project.srsDoc,
    {
      id: 'doc-planning-srs',
      number: '01',
      title: 'Software Requirements Specification (SRS / PRD)',
      category: 'Planning',
      track: 'process',
      purpose: 'Defines user stories, functional features, and non-functional constraints like latency and security.',
    },
    [
      {
        type: 'subheading',
        text: '1.1 Stakeholder Scope & Problem Context',
      },
      {
        type: 'paragraph',
        text:
          challengeText ||
          `${project.title} addresses core workflow friction in the ${project.category || 'software'} domain by replacing fragmented manual steps with a single predictable interface.`,
      },
      ...(project.caseStudyPlan
        ? [
            {
              type: 'paragraph' as const,
              text: project.caseStudyPlan,
            },
          ]
        : []),
      {
        type: 'subheading',
        text: '1.2 Core User Stories ("As a [user], I want to [action], so that [benefit]")',
      },
      {
        type: 'table',
        headers: ['Story ID', 'User Story', 'Target Deliverable'],
        rows: buildUserStoriesRows(project),
      },
      {
        type: 'subheading',
        text: '1.3 Non-Functional Needs & Version 1.0 Boundaries',
      },
      {
        type: 'list',
        items: [
          `Performance & Availability: Fast initial load and responsive state updates across desktop and mobile viewports using ${parsedStack.slice(0, 3).join(', ') || 'the core application runtime'}.`,
          `Security & Access Control: Input validation on all mutations, environment-isolated secrets, and strict role guards where user data is persisted.`,
          'v1.0 Out-of-Scope Boundaries: Multi-tenant enterprise SSO, custom reporting exports, and speculative automation outside the core milestone checklist were explicitly deferred to prevent scope creep.',
          `Governance & Definition of Done: Process updates followed the ${model.name} cadence; documentation stayed tied to feature completion and quarterly audit reviews.`,
        ],
      },
    ],
  )

  const testingSection = overrideOrBuild(
    project.testPlanDoc,
    {
      id: 'doc-testing-qa',
      number: '02',
      title: 'Test Plan & QA Reports',
      category: 'Testing',
      track: 'process',
      purpose: 'Details repeatable test cases, edge cases, bug checks, and verification coverage.',
    },
    [
      {
        type: 'subheading',
        text: '2.1 Repeatable Acceptance Test Matrix',
      },
      {
        type: 'paragraph',
        text: `Every critical user workflow in ${project.title} has explicit pre-conditions, inputs, and expected outputs so regressions can be verified before each release.`,
      },
      {
        type: 'table',
        headers: ['Case ID', 'Scenario', 'Input / Condition', 'Expected Output', 'Coverage Layer'],
        rows: buildTestCases(project, parsedStack),
      },
      {
        type: 'subheading',
        text: '2.2 Quality Gates & Definition of Done',
      },
      {
        type: 'list',
        items: [
          'Static Type & Lint Verification: Zero TypeScript compiler errors and clean ESLint checks prior to merging changes.',
          'Boundary & Error Recovery Checks: Verified network timeouts, empty states, duplicate submissions, and responsive layout integrity across mobile and desktop breakpoints.',
          'Ticket Closure Rule: Feature work is incomplete until updated acceptance notes and affected documentation sections reflect the live code behavior.',
        ],
      },
    ],
  )

  const deployCommands = isExpo
    ? `# Build & Inspect Releases\nnpx expo-doctor\nnpx eas build --platform all --profile production\n\n# Inspect Runtime Logs & Rollback OTA Update\nnpx eas update --branch production --message "patch"\nnpx eas update:rollback --branch production`
    : `# Verify Build & Production Health\nnpm run lint && npm run build\n\n# Stream Logs & Emergency Rollback\nvercel logs ${slug} --follow\nvercel rollback ${slug}`

  const operationsSection = overrideOrBuild(
    project.runbookDoc,
    {
      id: 'doc-operations-runbook',
      number: '03',
      title: 'Deployment & Runbook Guide',
      category: 'Operations',
      track: 'process',
      purpose: 'Outlines CI/CD pipelines, environment setups, backups, and emergency rollback procedures.',
    },
    [
      {
        type: 'subheading',
        text: '3.1 Pipeline, Hosting & Operational Envelope',
      },
      {
        type: 'kv',
        pairs: [
          {
            label: 'Development Model',
            value: model.name,
            note: model.cadence,
          },
          {
            label: 'Timeline Window',
            value: duration.headline,
            note: duration.period || duration.completionDate || duration.detail,
          },
          {
            label: 'Cost Profile',
            value: cost.headline,
            note: cost.breakdown.map((b) => `${b.layer} (${b.provider})`).join(' · '),
          },
          {
            label: 'Release Status',
            value: project.status || 'Production Ready',
            note: project.live && project.live !== '#' ? project.live : 'Verified build target',
          },
        ],
      },
      {
        type: 'subheading',
        text: '3.2 Deployment, Log Triage & Disaster Rollback Commands',
      },
      {
        type: 'paragraph',
        text: 'Keep exact operational commands versioned next to the codebase so hotfixes, log inspection, and zero-downtime rollbacks never rely on memory during an incident.',
      },
      {
        type: 'code',
        language: 'bash',
        text: deployCommands,
      },
      {
        type: 'list',
        items: [
          'Backup Routine: Automated snapshots or schema migrations are tagged cleanly against Git release commits before production promotion.',
          'Quarterly Documentation Audit: Review deployment scripts, environment variable names, and deprecated endpoints every quarter to prune stale runbook steps.',
        ],
      },
    ],
  )

  // --- PRODUCT DOCUMENTATION (Explains how the software works & how to use it) ---

  const adrRows: string[][] = techDetails.slice(0, 5).map((tech, idx) => {
    const info = TECH_ROLE_MAP[tech.name.trim().toLowerCase()]
    return [
      `ADR-0${idx + 1}`,
      tech.name,
      tech.layer,
      info?.adrWhy || `Chosen for ${tech.role.toLowerCase()} with minimal operational complexity.`,
    ]
  })

  const architectureSection = overrideOrBuild(
    project.architectureDoc,
    {
      id: 'doc-architecture-design',
      number: '04',
      title: 'System Architecture & Design Document',
      category: 'Architecture',
      track: 'product',
      purpose: 'Maps databases, tech stacks, visual data flow diagrams, ADRs, and third-party integrations.',
    },
    [
      {
        type: 'subheading',
        text: '4.1 High-Level System Architecture',
      },
      {
        type: 'paragraph',
        text:
          solutionText ||
          `${project.title} separates UI presentation, domain validation, and storage adapters into discrete modules built with ${parsedStack.join(', ') || 'modular TypeScript boundaries'}.`,
      },
      {
        type: 'subheading',
        text: '4.2 Visual Data Flow & Boundary Diagram',
      },
      {
        type: 'code',
        language: 'diagram',
        text: buildSystemDiagram(project, parsedStack),
      },
      ...(adrRows.length > 0
        ? [
            {
              type: 'subheading' as const,
              text: '4.3 Architecture Decision Records (ADRs)',
            },
            {
              type: 'table' as const,
              headers: ['Record', 'Decision', 'Layer', 'Engineering Rationale'],
              rows: adrRows,
            },
          ]
        : []),
    ],
  )

  const slugEndpoint = (project.slug.split('-')[0] || 'records').replace(/[^a-z0-9]/gi, '')
  const apiSample = `// Request: POST /api/${slugEndpoint}\n{\n  "action": "execute",\n  "project": "${slug}",\n  "timestamp": "${new Date().toISOString().slice(0, 10)}"\n}\n\n// Response: 201 Created\n{\n  "ok": true,\n  "data": { "id": "${slug}-01", "status": "${project.status || 'active'}" }\n}`

  const apiSection = overrideOrBuild(
    project.apiDoc,
    {
      id: 'doc-development-api',
      number: '05',
      title: 'API Documentation & Interface Contracts',
      category: 'Development',
      track: 'product',
      purpose: 'Documents service endpoints, request/response schemas, authentication rules, and error codes.',
    },
    [
      {
        type: 'subheading',
        text: '5.1 Endpoint Registry & Authentication Rules',
      },
      {
        type: 'paragraph',
        text: `All service endpoints enforce explicit schema validation and predictable HTTP status codes so client views and automated consumers handle success and failure uniformly.`,
      },
      {
        type: 'table',
        headers: ['Method', 'Route / Channel', 'Auth Rule', 'Response & Error Codes'],
        rows: buildApiRows(project, parsedStack),
      },
      {
        type: 'subheading',
        text: '5.2 Sample Request & Response Contract',
      },
      {
        type: 'code',
        language: 'json',
        text: apiSample,
      },
    ],
  )

  const repoSetupCommands = `# 1. Clone repository & install pinned dependencies\ngit clone ${project.github && project.github !== '#' ? project.github : `https://github.com/ashokrimal/${slug}.git`}\ncd ${slug}\nnpm install\n\n# 2. Configure local environment variables\ncp .env.example .env.local\n\n# 3. Start local development runtime\n${isExpo ? 'npx expo start' : 'npm run dev'}`

  const readmeSection = overrideOrBuild(
    project.readmeDoc,
    {
      id: 'doc-development-readme',
      number: '06',
      title: 'Codebase README & Setup Guide (Docs-as-Code)',
      category: 'Development',
      track: 'product',
      purpose: 'Explains prerequisites, .env.example configuration, repository structure, and local startup commands.',
    },
    [
      {
        type: 'subheading',
        text: '6.1 Docs-as-Code Repository Conventions',
      },
      {
        type: 'list',
        items: [
          'Co-located Documentation: Markdown specs (.md), ADRs, and setup guides live alongside source files so docs ship inside the exact same pull request as feature changes.',
          `Prerequisites: Node.js 20 LTS+, npm/pnpm${isExpo ? ', Expo CLI & iOS/Android simulator' : ''}, plus configured values matching .env.example.`,
          isNext
            ? 'Core Directory Map: app/ (routes & API handlers), components/ (UI primitives), lib/ (domain logic & data schemas), docs/ (ADRs & runbooks).'
            : 'Core Directory Map: src/ (UI modules & screens), services/ (API & state handlers), docs/ (architecture notes & test plans).',
        ],
      },
      {
        type: 'subheading',
        text: '6.2 Environment Configuration (.env.example)',
      },
      {
        type: 'code',
        language: 'dotenv',
        text: buildEnvTemplate(project, parsedStack),
      },
      {
        type: 'subheading',
        text: '6.3 Local Startup Commands',
      },
      {
        type: 'code',
        language: 'bash',
        text: repoSetupCommands,
      },
    ],
  )

  const releaseRows: string[][] =
    project.phases.length > 0
      ? project.phases.map((phase, idx) => [
          `v0.${idx + 1}.0${idx === project.phases.length - 1 ? ' (v1.0)' : ''}`,
          phase.period || project.completionDate || 'Milestone',
          `${phase.name}${phase.description ? ` — ${phase.description}` : ''}`,
        ])
      : [
          [
            'v1.0.0',
            project.completionDate || project.period || 'Initial Release',
            `${project.title} production release covering ${project.features.slice(0, 3).join(', ') || 'core product workflows'}.`,
          ],
        ]

  const manualSteps =
    project.features.length > 0
      ? project.features.map(
          (feature, idx) =>
            `${feature}: Navigate to the corresponding workspace view and confirm feedback state after step ${idx + 1}.`,
        )
      : [
          `Open ${project.title} and start from the primary landing workspace.`,
          'Follow guided on-screen inputs with real-time validation.',
          'Review saved output or confirmation feedback before proceeding.',
        ]

  const userManualSection = overrideOrBuild(
    project.userManualDoc,
    {
      id: 'doc-enduser-manual',
      number: '07',
      title: 'User Manual & Release Notes',
      category: 'End-User',
      track: 'product',
      purpose: 'Provides step-by-step usage walkthroughs and versioned milestone release notes.',
    },
    [
      {
        type: 'subheading',
        text: '7.1 Step-by-Step Usage Guide',
      },
      {
        type: 'ordered',
        items: manualSteps,
      },
      {
        type: 'subheading',
        text: '7.2 Versioned Release Notes',
      },
      {
        type: 'table',
        headers: ['Version', 'Window', 'Delivered Changes'],
        rows: releaseRows,
      },
    ],
  )

  const sections: DocumentationSection[] = [
    srsSection,
    testingSection,
    operationsSection,
    architectureSection,
    apiSection,
    readmeSection,
    userManualSection,
  ]

  // Append any general CMS `project.documentation` Markdown notes cleanly as an extra section
  if (project.documentation) {
    const customSections = parseMarkdownDocumentation(project.documentation)
    customSections.forEach((custom, idx) => {
      sections.push({
        ...custom,
        number: String(sections.length + idx + 1).padStart(2, '0'),
      })
    })
  }

  const workflowSteps: DocumentationWorkflowStep[] = [
    {
      step: '01',
      title: 'Start With Requirements Before Coding',
      summary:
        'Lock down core user needs and version-one boundaries prior to implementation to prevent scope creep.',
      practices: [
        'Gather stakeholder and end-user inputs before writing application code.',
        'Frame features cleanly using "As a [user], I want to [action], so that [benefit]".',
        'Document explicit v1.0 non-goals alongside functional and security constraints.',
      ],
      linkedDocId: 'doc-planning-srs',
      linkedDocLabel: 'View SRS / PRD',
    },
    {
      step: '02',
      title: 'Map the Architecture Visually',
      summary:
        'Clarify system boundaries and why specific frameworks, databases, or cloud services were selected.',
      practices: [
        'Maintain clear data-flow diagrams and ERDs connecting client, API, and persistence.',
        'Record concise Architecture Decision Records (ADRs) for foundational stack choices.',
      ],
      linkedDocId: 'doc-architecture-design',
      linkedDocLabel: 'View Architecture & ADRs',
    },
    {
      step: '03',
      title: 'Document Inside the Codebase ("Docs-as-Code")',
      summary:
        'Treat documentation as first-class code so architectural notes and API specs never drift from releases.',
      practices: [
        'Store Markdown specs and setup guides directly inside Git alongside feature PRs.',
        'Maintain a verified .env.example template and explicit local startup commands.',
        'Keep endpoint contracts and error responses synced with request validators.',
      ],
      linkedDocId: 'doc-development-readme',
      linkedDocLabel: 'View README & API Docs',
    },
    {
      step: '04',
      title: 'Standardize Quality Assurance & Deployment',
      summary:
        'Keep repeatable test cases and disaster recovery steps immediately actionable under pressure.',
      practices: [
        'Log step-by-step test inputs and expected outputs for repeatable regression checks.',
        'Keep copyable deploy, log-tailing, and rollback CLI commands ready in the runbook.',
      ],
      linkedDocId: 'doc-operations-runbook',
      linkedDocLabel: 'View QA & Runbook',
    },
    {
      step: '05',
      title: 'Maintain and Review Regularly',
      summary:
        'Prevent documentation rot through team ownership and scheduled maintenance checkpoints.',
      practices: [
        'Make documentation updates part of every ticket Definition of Done.',
        'Run quarterly documentation audits to archive deprecated endpoints and update guides.',
      ],
      linkedDocId: 'doc-enduser-manual',
      linkedDocLabel: 'View Release Notes',
    },
  ]

  const recommendedTools: DocumentationToolGroup[] = [
    {
      domain: 'Internal Wikis & PRDs',
      tools: 'Notion · Confluence · Slite',
      usage: 'Product requirements, stakeholder briefs, and cross-functional planning notes.',
    },
    {
      domain: 'Technical & Code Docs',
      tools: 'GitHub/GitLab Markdown · Docusaurus · MkDocs',
      usage: 'Versioned README files, contributor onboarding, and Docs-as-Code guides.',
    },
    {
      domain: 'Diagrams & Wireframes',
      tools: 'Mermaid.js · Draw.io · Figma',
      usage: 'Text-to-diagram system flows, ERDs, and interactive UI specifications.',
    },
    {
      domain: 'API References',
      tools: 'Swagger UI · Redoc · Postman',
      usage: 'Interactive endpoint exploration, schema validation, and request collections.',
    },
  ]

  return { sections, workflowSteps, recommendedTools }
}

/** Builds the complete case study dossier for a single project detail page. */
export function buildProjectDossier(project: ProjectEntry): ProjectDossier {
  // Handle compact legacy records that pack lines into description
  let parsedStack = project.techStack
  let cleanedChallenge = project.challenge

  if (
    project.description &&
    project.description.includes('\n') &&
    !project.summary &&
    project.techStack.length === 0
  ) {
    const lines = project.description
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length >= 2) {
      cleanedChallenge = lines[1]
    }
    if (lines.length >= 3) {
      parsedStack = lines[2]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }

  const techDetails = describeTechStack(parsedStack)
  const duration = inferDuration(project)
  const model = inferModel(project)
  const cost = inferCost(project, parsedStack)
  const solutionText = project.solution

  const hasCustomDocumentation = Boolean(
    project.documentation?.trim() ||
      project.srsDoc ||
      project.architectureDoc ||
      project.apiDoc ||
      project.readmeDoc ||
      project.testPlanDoc ||
      project.runbookDoc ||
      project.userManualDoc,
  )

  const { sections, workflowSteps, recommendedTools } = buildDocumentationSuite(
    project,
    parsedStack,
    techDetails,
    duration,
    model,
    cost,
    cleanedChallenge,
    solutionText,
  )

  return {
    challengeText: cleanedChallenge,
    solutionText,
    caseStudyPlanText: project.caseStudyPlan,
    duration,
    model,
    cost,
    techDetails,
    hasCustomDocumentation,
    documentationSections: sections,
    workflowSteps,
    recommendedTools,
  }
}

/** Public project list with an explicit empty/error state. */
export async function getProjectsResult(): Promise<CmsResult<ProjectEntry[]>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.projects)
  if (result.status !== 'ok') return result
  return { status: 'ok', data: mapProjectRecords(result.data) }
}
