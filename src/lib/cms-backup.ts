/**
 * The CMS backup contract.
 *
 * A backup is one JSON file holding the site's authored content: every
 * `cmsContent` record, the studio pages with their ordered sections, the
 * case-study projects and the single-row site settings. Account credentials,
 * sessions, the contact inbox and newsletter subscribers are deliberately left
 * out — a content backup is not a credential dump, and restoring one must never
 * be able to reset a password.
 *
 * This module is pure on purpose: the admin route, the restore action and the
 * tests all validate against the same rules, and nothing here touches the
 * database or Next.js.
 */

export const CMS_BACKUP_FORMAT = 'lamirkohsa-cms-backup'
export const CMS_BACKUP_VERSION = 1
export const CMS_BACKUP_MAX_RECORDS = 20_000
export const CMS_BACKUP_MAX_BYTES = 25 * 1024 * 1024

/**
 * Collection names a backup may contain. Kept here rather than imported from
 * `cms-schema` so this module stays dependency-free; `tests/cms-backup.test.ts`
 * asserts the list still matches `CMS_COLLECTIONS`, so a new collection cannot
 * be added without appearing here.
 */
export const CMS_BACKUP_COLLECTIONS = [
  'Site Settings',
  'Page Copy',
  'UI Copy',
  'Media Collections',
  'Profile',
  'Projects',
  'Gallery',
  'Experience',
  'Education',
  'Skills',
  'Certificates',
  'Social Links',
  'Interests',
  'Blogs',
  'Music',
  'Movies',
  'Anime',
  'Manga',
] as const

export type CmsBackupRestoreMode = 'merge' | 'replace'

export interface CmsBackupRecord {
  collection: string
  title: string
  slug: string
  payload: Record<string, unknown>
  status: string
  sortOrder: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CmsBackupPageSection {
  sectionKey: string
  sortOrder: number
  isEnabled: boolean
  content: Record<string, unknown>
}

export interface CmsBackupPage {
  slug: string
  title: string
  metaDescription: string
  isPublished: boolean
  sections: CmsBackupPageSection[]
}

export interface CmsBackupProject {
  slug: string
  title: string
  category: string | null
  summary: string | null
  problem: string | null
  solution: string | null
  techStack: string[]
  coverMediaUrl: string | null
  liveUrl: string | null
  repoUrl: string | null
  featuredOrder: number | null
  status: string
  isPublished: boolean
}

export interface CmsBackupSocialLink {
  id?: string
  platform?: string
  label?: string
  url?: string
  is_visible?: boolean
  sort_order?: number
}

export interface CmsBackupSiteSettings {
  contactEmail: string | null
  availabilityStatus: string | null
  socialLinks: CmsBackupSocialLink[]
}

export interface CmsBackupStudio {
  pages: CmsBackupPage[]
  projects: CmsBackupProject[]
  siteSettings: CmsBackupSiteSettings | null
}

export interface CmsBackupCounts {
  cmsContent: number
  pages: number
  pageSections: number
  projects: number
  siteSettings: number
  total: number
}

export interface CmsBackupFile {
  format: typeof CMS_BACKUP_FORMAT
  version: number
  createdAt: string
  /** Where the snapshot was taken from, kept for provenance only. */
  source: string
  /**
   * Every collection this snapshot is authoritative for. Exports always list
   * all of them, so a replace restore of an empty collection can still clear
   * it; a hand-written file defaults to the collections its records mention.
   */
  collections: string[]
  counts: CmsBackupCounts
  cmsContent: CmsBackupRecord[]
  studio: CmsBackupStudio
}

export type CmsBackupParseResult =
  | { ok: true; backup: CmsBackupFile }
  | { ok: false; error: string }

export interface CmsExistingRecord {
  id: number
  collection: string
  slug: string
  payload: Record<string, unknown> | null
}

export interface CmsRestorePlan {
  insert: CmsBackupRecord[]
  update: Array<{ record: CmsBackupRecord; existing: CmsExistingRecord }>
  remove: CmsExistingRecord[]
}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

/**
 * A record's identity is its locked key when it has one, otherwise its slug.
 * Titles are editable and never identify anything, so a backup can restore a
 * renamed record onto itself.
 */
export function cmsRecordIdentity(
  collection: string,
  slug: string,
  payload: Record<string, unknown> | null | undefined,
): string {
  const scope = collection.trim().toLowerCase()
  const key = typeof payload?.key === 'string' ? payload.key.trim().toLowerCase() : ''
  if (key) return `${scope}::key:${key}`
  return `${scope}::slug:${slug.trim().toLowerCase()}`
}

export function countCmsBackup(backup: Pick<CmsBackupFile, 'cmsContent' | 'studio'>): CmsBackupCounts {
  const pages = backup.studio.pages.length
  const pageSections = backup.studio.pages.reduce((total, page) => total + page.sections.length, 0)
  const projects = backup.studio.projects.length
  const siteSettings = backup.studio.siteSettings ? 1 : 0
  return {
    cmsContent: backup.cmsContent.length,
    pages,
    pageSections,
    projects,
    siteSettings,
    total: backup.cmsContent.length + pages + pageSections + projects + siteSettings,
  }
}

/** `cms-backup-2026-11-22-07-30.json` — sortable and safe on every filesystem. */
export function cmsBackupFileName(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, '-')
  return `cms-backup-${stamp}.json`
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

class BackupFormatError extends Error {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(message: string): never {
  throw new BackupFormatError(message)
}

function readString(
  value: unknown,
  label: string,
  maxLength: number,
  { allowEmpty = false }: { allowEmpty?: boolean } = {},
): string {
  if (typeof value !== 'string') fail(`${label} must be text.`)
  const trimmed = value.trim()
  if (!trimmed && !allowEmpty) fail(`${label} is empty.`)
  if (trimmed.length > maxLength) fail(`${label} is longer than ${maxLength} characters.`)
  return trimmed
}

function readInteger(value: unknown, label: string, fallback = 0): number {
  if (value === undefined || value === null || value === '') return fallback
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) fail(`${label} must be a number.`)
  return Math.trunc(numeric)
}

function readOptionalDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function readOptionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') fail(`${label} must be text.`)
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > maxLength) fail(`${label} is longer than ${maxLength} characters.`)
  return trimmed
}

function readCollection(value: unknown, label: string): string {
  if (typeof value !== 'string') fail(`${label} must be text.`)
  const match = CMS_BACKUP_COLLECTIONS.find(
    (collection) => collection.toLowerCase() === value.trim().toLowerCase(),
  )
  if (!match) fail(`${label} "${value}" is not a CMS collection this build knows.`)
  return match
}

function readPayload(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainObject(value)) fail(`${label} must be a JSON object.`)
  return value
}

function parseRecord(raw: unknown, index: number): CmsBackupRecord {
  const label = `cmsContent[${index}]`
  if (!isPlainObject(raw)) fail(`${label} is not an object.`)
  const payload = readPayload(raw.payload ?? {}, `${label}.payload`)
  const collection = readCollection(raw.collection, `${label}.collection`)
  const slug = readString(raw.slug ?? '', `${label}.slug`, 300, { allowEmpty: true })
  if (!slug && typeof payload.key !== 'string') {
    fail(`${label} has neither a slug nor a payload key, so it cannot be restored onto itself.`)
  }
  const status = readString(raw.status ?? 'draft', `${label}.status`, 40).toLowerCase()
  if (status !== 'published' && status !== 'draft') {
    fail(`${label}.status must be "published" or "draft".`)
  }
  return {
    collection,
    title: readString(raw.title, `${label}.title`, 500),
    slug,
    payload,
    status,
    sortOrder: readInteger(raw.sortOrder, `${label}.sortOrder`),
    createdAt: readOptionalDate(raw.createdAt),
    updatedAt: readOptionalDate(raw.updatedAt),
  }
}

function parsePageSection(raw: unknown, label: string): CmsBackupPageSection {
  if (!isPlainObject(raw)) fail(`${label} is not an object.`)
  return {
    sectionKey: readString(raw.sectionKey, `${label}.sectionKey`, 120),
    sortOrder: readInteger(raw.sortOrder, `${label}.sortOrder`),
    isEnabled: raw.isEnabled === undefined ? true : Boolean(raw.isEnabled),
    content: readPayload(raw.content ?? {}, `${label}.content`),
  }
}

function parsePage(raw: unknown, index: number): CmsBackupPage {
  const label = `studio.pages[${index}]`
  if (!isPlainObject(raw)) fail(`${label} is not an object.`)
  const sections = raw.sections ?? []
  if (!Array.isArray(sections)) fail(`${label}.sections must be a list.`)
  if (sections.length > 500) fail(`${label} has more than 500 sections.`)
  return {
    slug: readString(raw.slug, `${label}.slug`, 300),
    title: readString(raw.title, `${label}.title`, 500),
    metaDescription: readOptionalText(raw.metaDescription, `${label}.metaDescription`, 4000) ?? '',
    isPublished: raw.isPublished === undefined ? true : Boolean(raw.isPublished),
    sections: sections.map((section, sectionIndex) =>
      parsePageSection(section, `${label}.sections[${sectionIndex}]`),
    ),
  }
}

function parseProject(raw: unknown, index: number): CmsBackupProject {
  const label = `studio.projects[${index}]`
  if (!isPlainObject(raw)) fail(`${label} is not an object.`)
  const techStack = raw.techStack ?? []
  if (!Array.isArray(techStack)) fail(`${label}.techStack must be a list.`)
  const featuredOrder =
    raw.featuredOrder === undefined || raw.featuredOrder === null
      ? null
      : readInteger(raw.featuredOrder, `${label}.featuredOrder`)
  return {
    slug: readString(raw.slug, `${label}.slug`, 300),
    title: readString(raw.title, `${label}.title`, 500),
    category: readOptionalText(raw.category, `${label}.category`, 200),
    summary: readOptionalText(raw.summary, `${label}.summary`, 8000),
    problem: readOptionalText(raw.problem, `${label}.problem`, 40000),
    solution: readOptionalText(raw.solution, `${label}.solution`, 40000),
    techStack: techStack.map((item, itemIndex) =>
      readString(item, `${label}.techStack[${itemIndex}]`, 120),
    ),
    coverMediaUrl: readOptionalText(raw.coverMediaUrl, `${label}.coverMediaUrl`, 2000),
    liveUrl: readOptionalText(raw.liveUrl, `${label}.liveUrl`, 2000),
    repoUrl: readOptionalText(raw.repoUrl, `${label}.repoUrl`, 2000),
    featuredOrder,
    status: readOptionalText(raw.status, `${label}.status`, 60) ?? 'Active',
    isPublished: raw.isPublished === undefined ? true : Boolean(raw.isPublished),
  }
}

function parseSiteSettings(raw: unknown): CmsBackupSiteSettings | null {
  if (raw === undefined || raw === null) return null
  if (!isPlainObject(raw)) fail('studio.siteSettings must be an object.')
  const socialLinks = raw.socialLinks ?? []
  if (!Array.isArray(socialLinks)) fail('studio.siteSettings.socialLinks must be a list.')
  if (socialLinks.length > 200) fail('studio.siteSettings.socialLinks has too many entries.')
  return {
    contactEmail: readOptionalText(raw.contactEmail, 'studio.siteSettings.contactEmail', 320),
    availabilityStatus: readOptionalText(
      raw.availabilityStatus,
      'studio.siteSettings.availabilityStatus',
      500,
    ),
    socialLinks: socialLinks.map((link, index) => {
      if (!isPlainObject(link)) fail(`studio.siteSettings.socialLinks[${index}] is not an object.`)
      return {
        ...(link.id === undefined ? {} : { id: String(link.id) }),
        ...(link.platform === undefined ? {} : { platform: String(link.platform) }),
        ...(link.label === undefined ? {} : { label: String(link.label) }),
        ...(link.url === undefined ? {} : { url: String(link.url) }),
        ...(link.is_visible === undefined ? {} : { is_visible: Boolean(link.is_visible) }),
        ...(link.sort_order === undefined
          ? {}
          : { sort_order: readInteger(link.sort_order, `studio.siteSettings.socialLinks[${index}].sort_order`) }),
      }
    }),
  }
}

function parseCollections(raw: unknown, records: CmsBackupRecord[]): string[] {
  const declared = new Set<string>()
  if (raw !== undefined && raw !== null) {
    if (!Array.isArray(raw)) fail('The backup collections list must be a list.')
    if (raw.length > CMS_BACKUP_COLLECTIONS.length) {
      fail('The backup collections list names more collections than this build knows.')
    }
    for (const [index, entry] of raw.entries()) {
      declared.add(readCollection(entry, `collections[${index}]`))
    }
  }
  // A record always makes its collection part of the snapshot, even when an
  // older or hand-edited file forgot to declare it.
  for (const record of records) declared.add(record.collection)
  return [...declared].sort()
}

function parseStudio(raw: unknown): CmsBackupStudio {
  if (raw === undefined || raw === null) {
    return { pages: [], projects: [], siteSettings: null }
  }
  if (!isPlainObject(raw)) fail('The backup studio section must be an object.')

  const pages = raw.pages ?? []
  if (!Array.isArray(pages)) fail('studio.pages must be a list.')
  if (pages.length > 5000) fail('The backup has too many pages.')

  const projects = raw.projects ?? []
  if (!Array.isArray(projects)) fail('studio.projects must be a list.')
  if (projects.length > 5000) fail('The backup has too many projects.')

  const parsedPages = pages.map(parsePage)
  const seenPages = new Set<string>()
  for (const page of parsedPages) {
    const key = page.slug.toLowerCase()
    if (seenPages.has(key)) fail(`The backup contains two pages for ${page.slug}.`)
    seenPages.add(key)
  }

  const parsedProjects = projects.map(parseProject)
  const seenProjects = new Set<string>()
  for (const project of parsedProjects) {
    const key = project.slug.toLowerCase()
    if (seenProjects.has(key)) fail(`The backup contains two case studies for ${project.slug}.`)
    seenProjects.add(key)
  }

  return {
    pages: parsedPages,
    projects: parsedProjects,
    siteSettings: parseSiteSettings(raw.siteSettings),
  }
}

/**
 * Validates and normalises a parsed JSON file. The first problem found is
 * reported in plain language: the admin shows that message verbatim, so it has
 * to explain what to fix rather than name an exception.
 */
export function parseCmsBackup(input: unknown): CmsBackupParseResult {
  try {
    if (!isPlainObject(input)) fail('That file is not a CMS backup.')
    if (input.format !== CMS_BACKUP_FORMAT) {
      fail('That file is not a portfolio CMS backup.')
    }
    if (input.version !== CMS_BACKUP_VERSION) {
      fail(
        `This build reads backup version ${CMS_BACKUP_VERSION}; the file reports version ${String(
          input.version,
        )}.`,
      )
    }

    const rawRecords = input.cmsContent
    if (!Array.isArray(rawRecords)) fail('The backup is missing its cmsContent list.')
    if (rawRecords.length > CMS_BACKUP_MAX_RECORDS) {
      fail(`The backup has more than ${CMS_BACKUP_MAX_RECORDS} CMS records.`)
    }

    const cmsContent = rawRecords.map(parseRecord)
    const seen = new Set<string>()
    for (const record of cmsContent) {
      const identity = cmsRecordIdentity(record.collection, record.slug, record.payload)
      if (seen.has(identity)) {
        fail(
          `The backup contains two records for ${record.collection} "${
            typeof record.payload.key === 'string' ? record.payload.key : record.slug
          }".`,
        )
      }
      seen.add(identity)
    }

    const studio = parseStudio(input.studio)
    const backup: CmsBackupFile = {
      format: CMS_BACKUP_FORMAT,
      version: CMS_BACKUP_VERSION,
      createdAt: readOptionalDate(input.createdAt) ?? new Date(0).toISOString(),
      source: typeof input.source === 'string' ? input.source.slice(0, 80) : 'unknown',
      collections: parseCollections(input.collections, cmsContent),
      counts: countCmsBackup({ cmsContent, studio }),
      cmsContent,
      studio,
    }
    return { ok: true, backup }
  } catch (error) {
    if (error instanceof BackupFormatError) return { ok: false, error: error.message }
    throw error
  }
}

/* ------------------------------------------------------------------ */
/* Restore planning                                                    */
/* ------------------------------------------------------------------ */

/**
 * Works out what a restore would change before anything is written.
 *
 * `merge` only inserts and updates. `replace` also removes records that the
 * file does not mention, but only inside collections the file covers — a backup
 * of the blogs can never delete projects.
 */
export function planCmsRestore(
  existing: CmsExistingRecord[],
  incoming: CmsBackupRecord[],
  mode: CmsBackupRestoreMode,
  coveredCollections?: readonly string[],
): CmsRestorePlan {
  const existingByIdentity = new Map<string, CmsExistingRecord>()
  for (const record of existing) {
    existingByIdentity.set(
      cmsRecordIdentity(record.collection, record.slug, record.payload),
      record,
    )
  }

  const covered = new Set(
    (coveredCollections ?? incoming.map((record) => record.collection)).map((collection) =>
      collection.trim().toLowerCase(),
    ),
  )
  const incomingIdentities = new Set(
    incoming.map((record) => cmsRecordIdentity(record.collection, record.slug, record.payload)),
  )

  const plan: CmsRestorePlan = { insert: [], update: [], remove: [] }

  for (const record of incoming) {
    const identity = cmsRecordIdentity(record.collection, record.slug, record.payload)
    const match = existingByIdentity.get(identity)
    if (match) plan.update.push({ record, existing: match })
    else plan.insert.push(record)
  }

  if (mode === 'replace') {
    for (const record of existing) {
      if (!covered.has(record.collection.toLowerCase())) continue
      const identity = cmsRecordIdentity(record.collection, record.slug, record.payload)
      if (!incomingIdentities.has(identity)) plan.remove.push(record)
    }
  }

  return plan
}
