import {
  CMS_BACKUP_COLLECTIONS,
  CMS_BACKUP_FORMAT,
  CMS_BACKUP_VERSION,
  countCmsBackup,
  planCmsRestore,
  type CmsBackupFile,
  type CmsBackupPage,
  type CmsBackupPageSection,
  type CmsBackupProject,
  type CmsBackupRecord,
  type CmsBackupRestoreMode,
  type CmsBackupSiteSettings,
  type CmsExistingRecord,
} from '@/lib/cms-backup'

/**
 * Reads and writes the content tables behind a CMS backup.
 *
 * The functions take a checked-out `pg` client instead of reaching for the
 * shared pool, so a restore always runs inside one transaction: a validation or
 * connection failure half-way through cannot leave the site with half of an old
 * backup and half of the current content.
 *
 * Deliberately excluded: `adminCredential`, the better-auth user/session/account
 * tables, `inboxMessage` and newsletter subscribers. A content backup must not
 * be able to hand anyone a password or copy private mail around.
 */

export interface BackupQueryClient {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: Array<Record<string, any>>; rowCount: number | null }>
}

export interface CmsRestoreSummary {
  mode: CmsBackupRestoreMode
  cmsContent: { inserted: number; updated: number; removed: number }
  pages: { inserted: number; updated: number }
  pageSections: number
  projects: { inserted: number; updated: number }
  siteSettings: boolean
}

const STUDIO_TABLES = ['pages', 'page_sections', 'projects', 'site_settings'] as const

function isMissingRelation(error: unknown) {
  return Boolean(
    error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '42P01',
  )
}

/** Returns `null` when the table has never been created, rather than throwing. */
async function queryIfPresent(
  client: BackupQueryClient,
  text: string,
): Promise<Array<Record<string, any>> | null> {
  try {
    const result = await client.query(text)
    return result.rows
  } catch (error) {
    if (isMissingRelation(error)) return null
    throw error
  }
}

function mapRecord(row: Record<string, any>): CmsBackupRecord {
  const payload =
    row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
      ? (row.payload as Record<string, unknown>)
      : {}
  return {
    collection: String(row.collection ?? ''),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    payload,
    status: String(row.status ?? 'draft'),
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  }
}

function toIso(value: unknown): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function readPages(client: BackupQueryClient): Promise<CmsBackupPage[]> {
  const pageRows = await queryIfPresent(
    client,
    `select "id","slug","title","meta_description","is_published" from "pages" order by "slug"`,
  )
  if (!pageRows) return []

  const sectionRows =
    (await queryIfPresent(
      client,
      `select "page_id","section_key","sort_order","is_enabled","content_json"
         from "page_sections" order by "sort_order", "id"`,
    )) ?? []

  const sectionsByPage = new Map<number, CmsBackupPageSection[]>()
  for (const row of sectionRows) {
    const pageId = Number(row.page_id)
    const list = sectionsByPage.get(pageId) ?? []
    const content =
      row.content_json && typeof row.content_json === 'object' && !Array.isArray(row.content_json)
        ? (row.content_json as Record<string, unknown>)
        : {}
    list.push({
      sectionKey: String(row.section_key ?? ''),
      sortOrder: Number(row.sort_order ?? 0),
      isEnabled: row.is_enabled !== false,
      content,
    })
    sectionsByPage.set(pageId, list)
  }

  return pageRows.map((row) => ({
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    metaDescription: String(row.meta_description ?? ''),
    isPublished: row.is_published !== false,
    sections: sectionsByPage.get(Number(row.id)) ?? [],
  }))
}

async function readProjects(client: BackupQueryClient): Promise<CmsBackupProject[]> {
  const rows = await queryIfPresent(
    client,
    `select "slug","title","category","summary","problem","solution","tech_stack",
            "cover_media_url","live_url","repo_url","featured_order","status","is_published"
       from "projects" order by "featured_order" nulls last, "title"`,
  )
  if (!rows) return []

  return rows.map((row) => ({
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    category: row.category ?? null,
    summary: row.summary ?? null,
    problem: row.problem ?? null,
    solution: row.solution ?? null,
    techStack: Array.isArray(row.tech_stack) ? row.tech_stack.map((item: unknown) => String(item)) : [],
    coverMediaUrl: row.cover_media_url ?? null,
    liveUrl: row.live_url ?? null,
    repoUrl: row.repo_url ?? null,
    featuredOrder: row.featured_order === null || row.featured_order === undefined ? null : Number(row.featured_order),
    status: String(row.status ?? 'Active'),
    isPublished: row.is_published !== false,
  }))
}

async function readSiteSettings(client: BackupQueryClient): Promise<CmsBackupSiteSettings | null> {
  const rows = await queryIfPresent(
    client,
    `select "contact_email","availability_status","social_links" from "site_settings" where "id" = 1`,
  )
  const row = rows?.[0]
  if (!row) return null
  return {
    contactEmail: row.contact_email ?? null,
    availabilityStatus: row.availability_status ?? null,
    socialLinks: Array.isArray(row.social_links) ? row.social_links : [],
  }
}

/**
 * The complete content snapshot. Reads every content row, not just published
 * ones: a backup that quietly dropped drafts would lose work that is only
 * visible in the studio.
 */
export async function readCmsBackup(
  client: BackupQueryClient,
  source = 'admin-download',
): Promise<CmsBackupFile> {
  const recordsResult = await client.query(
    `select "collection","title","slug","payload","status","sortOrder","createdAt","updatedAt"
       from "cmsContent"
      order by lower("collection"), "sortOrder", "id"`,
  )

  const cmsContent = recordsResult.rows.map(mapRecord)
  const [pages, projects, siteSettings] = await Promise.all([
    readPages(client),
    readProjects(client),
    readSiteSettings(client),
  ])

  const studio = { pages, projects, siteSettings }
  const collections = [...CMS_BACKUP_COLLECTIONS].sort()
  return {
    format: CMS_BACKUP_FORMAT,
    version: CMS_BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    source,
    // The export is the whole CMS, so it is authoritative for every collection,
    // including ones that currently hold no records.
    collections,
    counts: countCmsBackup({ cmsContent, studio }),
    cmsContent,
    studio,
  }
}

function chunks<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size))
  }
  return batches
}

async function assertStudioTables(client: BackupQueryClient, backup: CmsBackupFile) {
  const needsStudioData =
    backup.studio.pages.length > 0 ||
    backup.studio.projects.length > 0 ||
    backup.studio.siteSettings !== null
  if (!needsStudioData) return

  const rows = await client.query(
    `select ${STUDIO_TABLES.map((table) => `to_regclass('${table}') as "${table}"`).join(', ')}`,
  )
  const missing = STUDIO_TABLES.filter((table) => !rows.rows[0]?.[table])
  if (missing.length) {
    throw new Error(
      `The studio tables (${missing.join(', ')}) do not exist yet, so this backup cannot be restored in full. ` +
        'Create them with the studio seed once, then restore again — nothing was written.',
    )
  }
}

async function insertCmsRecords(
  client: BackupQueryClient,
  actorId: string,
  records: CmsBackupRecord[],
): Promise<number> {
  let inserted = 0
  for (const batch of chunks(records, 100)) {
    const values: unknown[] = [actorId]
    const placeholders: string[] = []
    for (const record of batch) {
      const offset = values.length
      placeholders.push(
        `($1, $${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}::jsonb, $${offset + 5}, $${offset + 6}, coalesce($${offset + 7}::timestamptz, now()), coalesce($${offset + 8}::timestamptz, now()))`,
      )
      values.push(
        record.collection,
        record.title,
        record.slug,
        JSON.stringify(record.payload ?? {}),
        record.status,
        record.sortOrder,
        record.createdAt,
        record.updatedAt,
      )
    }
    await client.query(
      `insert into "cmsContent"
         ("userId","collection","title","slug","payload","status","sortOrder","createdAt","updatedAt")
       values ${placeholders.join(', ')}`,
      values,
    )
    inserted += batch.length
  }
  return inserted
}

async function restorePages(
  client: BackupQueryClient,
  pages: CmsBackupPage[],
): Promise<CmsRestoreSummary['pages']> {
  const existing = await client.query(`select "id","slug" from "pages"`)
  const idBySlug = new Map<string, number>(
    existing.rows.map((row) => [String(row.slug), Number(row.id)]),
  )
  const summary = { inserted: 0, updated: 0 }

  for (const page of pages) {
    let pageId = idBySlug.get(page.slug)
    if (pageId) {
      await client.query(
        `update "pages" set "title" = $2, "meta_description" = $3, "is_published" = $4, "updated_at" = now()
          where "id" = $1`,
        [pageId, page.title, page.metaDescription || null, page.isPublished],
      )
      await client.query(`delete from "page_sections" where "page_id" = $1`, [pageId])
      summary.updated += 1
    } else {
      const created = await client.query(
        `insert into "pages" ("slug","title","meta_description","is_published")
         values ($1,$2,$3,$4) returning "id"`,
        [page.slug, page.title, page.metaDescription || null, page.isPublished],
      )
      pageId = Number(created.rows[0]?.id)
      summary.inserted += 1
    }

    for (const [index, section] of page.sections.entries()) {
      await client.query(
        `insert into "page_sections"
           ("page_id","section_key","sort_order","is_enabled","content_json")
         values ($1,$2,$3,$4,$5::jsonb)`,
        [
          pageId,
          section.sectionKey,
          Number.isFinite(section.sortOrder) ? section.sortOrder : index,
          section.isEnabled,
          JSON.stringify(section.content ?? {}),
        ],
      )
    }
  }

  return summary
}

async function restoreProjects(
  client: BackupQueryClient,
  projects: CmsBackupProject[],
): Promise<CmsRestoreSummary['projects']> {
  const existing = await client.query(`select "slug" from "projects"`)
  const known = new Set(existing.rows.map((row) => String(row.slug)))
  const summary = { inserted: 0, updated: 0 }

  for (const project of projects) {
    const params = [
      project.slug,
      project.title,
      project.category,
      project.summary,
      project.problem,
      project.solution,
      JSON.stringify(project.techStack ?? []),
      project.coverMediaUrl,
      project.liveUrl,
      project.repoUrl,
      project.featuredOrder,
      project.status,
      project.isPublished,
    ]
    if (known.has(project.slug)) {
      await client.query(
        `update "projects" set
           "title" = $2, "category" = $3, "summary" = $4, "problem" = $5, "solution" = $6,
           "tech_stack" = $7::jsonb, "cover_media_url" = $8, "live_url" = $9, "repo_url" = $10,
           "featured_order" = $11, "status" = $12, "is_published" = $13, "updated_at" = now()
         where "slug" = $1`,
        params,
      )
      summary.updated += 1
    } else {
      await client.query(
        `insert into "projects"
           ("slug","title","category","summary","problem","solution","tech_stack",
            "cover_media_url","live_url","repo_url","featured_order","status","is_published")
         values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13)`,
        params,
      )
      summary.inserted += 1
    }
  }

  return summary
}

async function restoreSiteSettings(
  client: BackupQueryClient,
  settings: CmsBackupSiteSettings,
): Promise<boolean> {
  await client.query(
    `insert into "site_settings" ("id","contact_email","availability_status","social_links","updated_at")
     values (1,$1,$2,$3::jsonb,now())
     on conflict ("id") do update set
       "contact_email" = excluded."contact_email",
       "availability_status" = excluded."availability_status",
       "social_links" = excluded."social_links",
       "updated_at" = now()`,
    [settings.contactEmail, settings.availabilityStatus, JSON.stringify(settings.socialLinks ?? [])],
  )
  return true
}

/**
 * Writes a validated backup back into the content tables.
 *
 * The caller owns the transaction (begin/commit around this call), so a thrown
 * error leaves the database untouched.
 */
export async function applyCmsBackup(
  client: BackupQueryClient,
  backup: CmsBackupFile,
  { actorId, mode }: { actorId: string; mode: CmsBackupRestoreMode },
): Promise<CmsRestoreSummary> {
  await assertStudioTables(client, backup)

  const existingRows = await client.query(`select "id","collection","slug","payload" from "cmsContent"`)
  const existing: CmsExistingRecord[] = existingRows.rows.map((row) => ({
    id: Number(row.id),
    collection: String(row.collection ?? ''),
    slug: String(row.slug ?? ''),
    payload:
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {},
  }))

  const plan = planCmsRestore(existing, backup.cmsContent, mode, backup.collections)

  for (const record of plan.remove) {
    await client.query(`delete from "cmsContent" where "id" = $1`, [record.id])
  }

  for (const { record, existing: current } of plan.update) {
    await client.query(
      `update "cmsContent" set
         "title" = $2, "slug" = $3, "payload" = $4::jsonb, "status" = $5, "sortOrder" = $6,
         "updatedAt" = coalesce($7::timestamptz, now())
       where "id" = $1`,
      [
        current.id,
        record.title,
        record.slug,
        JSON.stringify(record.payload ?? {}),
        record.status,
        record.sortOrder,
        record.updatedAt,
      ],
    )
  }

  const inserted = await insertCmsRecords(client, actorId, plan.insert)
  const pages = await restorePages(client, backup.studio.pages)
  const projects = await restoreProjects(client, backup.studio.projects)
  const siteSettings = backup.studio.siteSettings
    ? await restoreSiteSettings(client, backup.studio.siteSettings)
    : false

  return {
    mode,
    cmsContent: { inserted, updated: plan.update.length, removed: plan.remove.length },
    pages,
    pageSections: backup.studio.pages.reduce((total, page) => total + page.sections.length, 0),
    projects,
    siteSettings,
  }
}
