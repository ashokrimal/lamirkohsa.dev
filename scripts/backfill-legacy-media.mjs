/**
 * Backfill the legacy media tables into the CMS collections the public site
 * now renders.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/backfill-legacy-media.mjs
 *   DATABASE_URL=postgres://... node scripts/backfill-legacy-media.mjs --apply
 *
 * Options:
 *   --apply              Write changes. Without it the script is a dry run.
 *   --backup <path>      Where to write the pre-apply JSON backup. Defaults to
 *                        backups/legacy-media-backfill-<timestamp>.json.
 *   --no-backup          Skip the backup. Not recommended for --apply.
 *   --allow-partial      Allow --apply when a legacy table is missing, a row
 *                        is skipped, or a required target field is empty.
 *   --adopt-existing     Allow matching an untagged CMS record by slug + title.
 *                        Without this, only records tagged with legacySource /
 *                        legacyId are updated.
 *   --owner <userId>     Only backfill rows for this owner. By default the
 *                        script uses the owner with the most CMS records, or
 *                        the only owner found in the legacy tables.
 *   --publish-catalogs   Publish anime/manga rows. They are migrated as drafts
 *                        by default because the old table had no published flag.
 *   --json               Print the full report as JSON.
 *   --verbose            Include per-record warnings and preserved fields.
 *
 * What it copies:
 *   galleryItem       -> Gallery
 *   portfolioProject  -> Projects
 *   musicTrack        -> Music
 *   animeMangaItem    -> Anime / Manga
 *
 * Idempotency and safety:
 *   - Legacy rows are matched to CMS records by payload.legacySource +
 *     payload.legacyId. Untagged CMS records are skipped unless
 *     --adopt-existing is passed.
 *   - Existing CMS values are never overwritten. The script only fills blank
 *     payload fields, preserves the CMS title, slug, status and sort order, and
 *     adds the legacy identity tags.
 *   - Re-running --apply after a successful run reports every record as
 *     unchanged.
 *   - --apply writes a backup before touching the database, locks the CMS table
 *     for the transaction, aborts if a record changed after planning, and
 *     verifies every written payload before committing.
 *   - --apply refuses to write when a legacy table is missing, a record would be
 *     skipped, or a required target field is empty. Use --allow-partial after
 *     reviewing the dry-run report to override that.
 *
 * Missing legacy tables are reported and skipped during a dry run.
 */
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Client } from 'pg'
import { loadCmsSchema } from './load-cms-schema.mjs'

const { CMS_COLLECTIONS } = await loadCmsSchema()

const LEGACY_SOURCE_FIELD = 'legacySource'
const LEGACY_ID_FIELD = 'legacyId'

const SOURCES = [
  {
    table: 'galleryItem',
    label: 'Gallery',
    target: CMS_COLLECTIONS.gallery,
    order: 'newest',
    expectedColumns: [
      'id',
      'userId',
      'title',
      'slug',
      'description',
      'imageUrl',
      'category',
      'featured',
      'published',
      'createdAt',
    ],
    targetFields: ['imageUrl', 'altText', 'category', 'description', 'location'],
    required: ['imageUrl'],
    unavailable: {
      altText: 'not present in galleryItem',
      location: 'not present in galleryItem',
    },
    unmapped: {
      featured: 'CMS Gallery has no featured field',
      createdAt: 'used to preserve public order, not copied as content',
      updatedAt: 'not copied',
      userId: 'owner is stored on the CMS row',
    },
    map: mapGallery,
  },
  {
    table: 'portfolioProject',
    label: 'Projects',
    target: CMS_COLLECTIONS.projects,
    order: 'newest',
    expectedColumns: [
      'id',
      'userId',
      'title',
      'slug',
      'summary',
      'description',
      'tech',
      'imageUrl',
      'liveUrl',
      'featured',
      'published',
      'createdAt',
    ],
    targetFields: [
      'summary',
      'description',
      'imageUrl',
      'techStack',
      'live',
      'featured',
      'github',
      'phases',
      'features',
      'solution',
      'period',
      'completionDate',
      'category',
      'altText',
      'status',
    ],
    required: ['summary', 'description', 'imageUrl'],
    unavailable: {
      github: 'not present in portfolioProject',
      phases: 'not present in portfolioProject',
      features: 'not present in portfolioProject',
      solution: 'not present in portfolioProject',
      period: 'not present in portfolioProject',
      completionDate: 'not present in portfolioProject',
      category: 'not present in portfolioProject',
      altText: 'not present in portfolioProject',
      'payload.status': 'not present in portfolioProject; record published state is copied separately',
    },
    unmapped: {
      createdAt: 'used to preserve public order, not copied as content',
      updatedAt: 'not copied',
      userId: 'owner is stored on the CMS row',
    },
    map: mapProject,
  },
  {
    table: 'musicTrack',
    label: 'Music',
    target: CMS_COLLECTIONS.music,
    order: 'music',
    expectedColumns: [
      'id',
      'userId',
      'title',
      'artist',
      'audioUrl',
      'coverUrl',
      'album',
      'published',
      'sortOrder',
      'createdAt',
    ],
    targetFields: ['artist', 'subtitle', 'coverUrl', 'externalUrl'],
    required: [],
    unavailable: {
      creator: 'not present in musicTrack',
      description: 'not present in musicTrack',
      imageUrl: 'not present in musicTrack',
      rating: 'not present in musicTrack',
    },
    unmapped: {
      audioUrl: 'mapped to externalUrl when it is a web URL; Spotify track URIs are converted',
      album: 'mapped to subtitle',
      published: 'mapped to the CMS record status',
      sortOrder: 'used to preserve public order, then reassigned sequentially',
      userId: 'owner is stored on the CMS row',
      createdAt: 'used to preserve public order, not copied as content',
    },
    map: mapMusic,
  },
  {
    table: 'animeMangaItem',
    label: 'Anime / Manga',
    target: null, // Anime or Manga, decided per row.
    order: 'newest',
    expectedColumns: [
      'id',
      'userId',
      'kind',
      'externalId',
      'title',
      'status',
      'score',
      'progress',
      'imageUrl',
      'synopsis',
      'source',
      'rawData',
      'createdAt',
    ],
    targetFields: ['status', 'rating', 'imageUrl', 'description'],
    required: [],
    unavailable: {
      progress: 'CMS media schema has no progress field',
      creator: 'no reliable legacy source',
      subtitle: 'no reliable legacy source',
      coverUrl: 'only imageUrl is present',
      externalUrl: 'externalId is an API id, not a web URL',
    },
    unmapped: {
      externalId: 'not a web URL; retained in the legacy table only',
      source: 'import origin, not display content',
      rawData: 'not copied: provider payloads can be large and may contain private fields',
      createdAt: 'used to preserve public order, not copied as content',
      updatedAt: 'not copied',
      userId: 'owner is stored on the CMS row',
    },
    map: mapCatalog,
  },
]

const options = parseArgs(process.argv.slice(2))

if (options.help) {
  printHelp()
  process.exit(0)
}

const report = {
  mode: options.apply ? 'apply' : 'dry-run',
  generatedAt: new Date().toISOString(),
  owner: null,
  ownerSource: null,
  backupPath: null,
  sources: [],
  records: [],
  totals: {
    sourceRows: 0,
    eligible: 0,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    incomplete: 0,
    otherOwner: 0,
    missingTables: 0,
  },
  warnings: [],
  fieldSummary: {},
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is required.')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  let transaction = false
  try {
    const cmsExists = await tableExists(client, 'cmsContent')
    if (!cmsExists) {
      throw new Error('The cmsContent table does not exist. Run the CMS migration first.')
    }

    const loadedSources = []
    for (const definition of SOURCES) {
      const exists = await tableExists(client, definition.table)
      if (!exists) {
        report.totals.missingTables += 1
        report.warnings.push(`Missing legacy table "${definition.table}" — skipped.`)
        report.sources.push({
          source: definition.table,
          target: definition.label,
          missingTable: true,
          sourceRows: 0,
          eligible: 0,
          otherOwner: 0,
          inserted: 0,
          updated: 0,
          unchanged: 0,
          skipped: 0,
        })
        continue
      }

      const columns = await columnsFor(client, definition.table)
      const missingColumns = definition.expectedColumns.filter((column) => !columns.includes(column))
      if (missingColumns.length > 0) {
        report.warnings.push(
          `${definition.table} is missing expected column(s): ${missingColumns.join(', ')}. Missing values are reported per record.`,
        )
      }

      const result = await client.query(`select * from "${definition.table}"`)
      loadedSources.push({ definition, rows: result.rows, missingColumns })
    }

    const owner = await resolveOwner(client, loadedSources)
    if (!owner.userId) {
      printReport(report)
      return
    }
    report.owner = owner.userId
    report.ownerSource = owner.source
    report.warnings.push(...owner.warnings)

    const targetCollections = Array.from(
      new Set(
        loadedSources
          .flatMap(({ definition }) => [definition.target, CMS_COLLECTIONS.anime, CMS_COLLECTIONS.manga])
          .filter(Boolean),
      ),
    )
    const existingRows = await client.query(
      `select "id", "collection", "title", "slug", "payload", "status", "sortOrder"
         from "cmsContent"
        where "collection" = any($1)`,
      [targetCollections],
    )

    const byLegacyKey = new Map()
    const bySlug = new Map()
    const usedSlugs = new Set()
    for (const row of existingRows.rows) {
      const payload = objectPayload(row.payload)
      const legacySource = clean(payload[LEGACY_SOURCE_FIELD])
      const legacyId = clean(payload[LEGACY_ID_FIELD])
      if (legacySource && legacyId) {
        byLegacyKey.set(legacyKey(row.collection, legacySource, legacyId), row)
      }
      bySlug.set(slugKey(row.collection, row.slug), row)
      usedSlugs.add(slugKey(row.collection, row.slug))
    }

    const plans = []
    for (const { definition, rows, missingColumns } of loadedSources) {
      const sorted = sortRows(rows, definition.order)
      const sourceReport = {
        source: definition.table,
        target: definition.label,
        missingTable: false,
        missingColumns,
        sourceRows: sorted.length,
        eligible: 0,
        otherOwner: 0,
        inserted: 0,
        updated: 0,
        unchanged: 0,
        skipped: 0,
        incomplete: 0,
        mapped: {},
        skippedFields: {},
      }
      report.sources.push(sourceReport)

      sorted.forEach((row, index) => {
        report.totals.sourceRows += 1

        if (clean(row.userId) && clean(row.userId) !== owner.userId) {
          sourceReport.otherOwner += 1
          report.totals.otherOwner += 1
          return
        }

        sourceReport.eligible += 1
        report.totals.eligible += 1

        const plan = buildPlan({
          definition,
          row,
          index,
          ownerId: owner.userId,
          existingByLegacy: byLegacyKey,
          existingBySlug: bySlug,
          usedSlugs,
        })
        finalizePlan(plan)

        if (!plan.skipRecord) {
          const missingRequired = (definition.required ?? []).filter((field) =>
            isBlank(plan.payload[field]),
          )
          if (missingRequired.length > 0) {
            plan.incomplete = true
            plan.missingRequired = missingRequired
            plan.warnings.push(`missing required CMS field(s): ${missingRequired.join(', ')}`)
            sourceReport.incomplete += 1
            report.totals.incomplete += 1
          }
        }

        sourceReport.mapped = mergeCounts(sourceReport.mapped, plan.mappedCounts)
        sourceReport.skippedFields = mergeCounts(sourceReport.skippedFields, plan.skippedCounts)
        report.fieldSummary[definition.label] = {
          mapped: sourceReport.mapped,
          skipped: sourceReport.skippedFields,
          unavailable: definition.unavailable,
          unmappedLegacy: definition.unmapped,
        }

        if (plan.skipRecord) {
          sourceReport.skipped += 1
          report.totals.skipped += 1
          report.records.push({ ...plan, action: 'skipped' })
          return
        }

        if (plan.existing) {
          if (plan.changed) {
            sourceReport.updated += 1
            report.totals.updated += 1
            plan.action = 'updated'
          } else {
            sourceReport.unchanged += 1
            report.totals.unchanged += 1
            plan.action = 'unchanged'
          }
        } else {
          sourceReport.inserted += 1
          report.totals.inserted += 1
          plan.action = 'inserted'
          usedSlugs.add(slugKey(plan.collection, plan.slug))
        }

        report.records.push(plan)
        plans.push(plan)
      })
    }

    const writablePlans = plans.filter(
      (plan) => plan.action === 'inserted' || plan.action === 'updated',
    )

    if (options.apply && writablePlans.length > 0) {
      assertApplySafe(report)
      await writeBackup(report, writablePlans)

      await client.query('begin')
      transaction = true
      await client.query("set local lock_timeout = '15s'")
      // Block CMS edits while the migration runs. Reads remain available.
      await client.query('lock table "cmsContent" in share row exclusive mode')

      for (const plan of writablePlans) {
        if (plan.action === 'inserted') {
          const clash = await client.query(
            `select "id" from "cmsContent" where "collection" = $1 and "slug" = $2 limit 1`,
            [plan.collection, plan.slug],
          )
          if (clash.rowCount > 0) {
            throw new Error(
              `CMS slug "${plan.collection}/${plan.slug}" appeared after planning. Aborting without changes.`,
            )
          }

          const result = await client.query(
            `insert into "cmsContent"
               ("userId", "collection", "title", "slug", "payload", "status", "sortOrder")
             values ($1, $2, $3, $4, $5::jsonb, $6, $7)
             returning "id"`,
            [
              plan.ownerId,
              plan.collection,
              plan.title,
              plan.slug,
              JSON.stringify(plan.payload),
              plan.status,
              plan.sortOrder,
            ],
          )
          plan.cmsId = result.rows[0].id
        } else if (plan.action === 'updated') {
          const locked = await client.query(
            `select "payload" from "cmsContent" where "id" = $1 for update`,
            [plan.existing.id],
          )
          if (!locked.rowCount) {
            throw new Error(`CMS record #${plan.existing.id} disappeared after planning. Aborting.`)
          }
          const currentPayload = objectPayload(locked.rows[0].payload)
          if (JSON.stringify(currentPayload) !== plan.existing.payloadHash) {
            throw new Error(
              `CMS record #${plan.existing.id} changed after planning. Aborting without changes.`,
            )
          }

          await client.query(
            `update "cmsContent"
                set "payload" = $1::jsonb, "updatedAt" = now()
              where "id" = $2`,
            [JSON.stringify(plan.payload), plan.existing.id],
          )
          plan.cmsId = plan.existing.id
        }
      }

      await verifyApplied(client, writablePlans)
      await client.query('commit')
      transaction = false
    }

    printReport(report)
  } catch (error) {
    if (transaction) await client.query('rollback')
    throw error
  } finally {
    await client.end()
  }
}

function parseArgs(argv) {
  const parsed = {
    apply: false,
    json: false,
    verbose: false,
    publishCatalogs: false,
    owner: null,
    backup: null,
    noBackup: false,
    allowPartial: false,
    adoptExisting: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    else if (argument === '--apply') parsed.apply = true
    else if (argument === '--json') parsed.json = true
    else if (argument === '--verbose') parsed.verbose = true
    else if (argument === '--publish-catalogs') parsed.publishCatalogs = true
    else if (argument === '--allow-partial') parsed.allowPartial = true
    else if (argument === '--adopt-existing') parsed.adoptExisting = true
    else if (argument === '--no-backup') parsed.noBackup = true
    else if (argument === '--backup') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new Error('--backup requires a file path')
      parsed.backup = value
      index += 1
    } else if (argument === '--owner') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new Error('--owner requires a user id')
      parsed.owner = value
      index += 1
    } else if (argument === '--help' || argument === '-h') parsed.help = true
    else throw new Error(`Unknown option: ${argument}`)
  }

  return parsed
}

function printHelp() {
  console.log(`Backfill legacy media tables into the CMS.

Usage:
  DATABASE_URL=postgres://... node scripts/backfill-legacy-media.mjs [options]

Options:
  --apply              Write changes (default: dry run)
  --backup <path>      Pre-apply backup path (default: backups/legacy-media-backfill-<time>.json)
  --no-backup          Skip the pre-apply backup (not recommended)
  --allow-partial      Allow apply with missing tables, skipped rows or empty required fields
  --adopt-existing     Merge an untagged CMS record when slug and title match
  --owner <userId>     Restrict the backfill to one owner
  --publish-catalogs   Publish anime/manga rows (default: draft)
  --json               Print the full report as JSON
  --verbose            Include per-record warnings and preserved fields
  --help, -h           Show this help

Examples:
  pnpm cms:backfill
  pnpm cms:backfill -- --apply
  DATABASE_URL=... node scripts/backfill-legacy-media.mjs --owner user_123 --json`)
}

async function tableExists(client, table) {
  const result = await client.query('select to_regclass($1) as name', [`public."${table}"`])
  return Boolean(result.rows[0]?.name)
}

async function columnsFor(client, table) {
  const result = await client.query(
    `select column_name from information_schema.columns
      where table_schema = 'public' and table_name = $1`,
    [table],
  )
  return result.rows.map((row) => row.column_name)
}

async function resolveOwner(client, loadedSources) {
  if (options.owner) {
    return { userId: options.owner, source: '--owner', warnings: [] }
  }

  const owners = await client.query(
    `select "userId", count(*)::int as total
       from "cmsContent"
      group by "userId"
      order by total desc, "userId" asc`,
  )

  if (owners.rows.length > 0) {
    const warnings = []
    if (owners.rows.length > 1) {
      warnings.push(
        `Found ${owners.rows.length} CMS owners; using ${owners.rows[0].userId} (${owners.rows[0].total} records). Pass --owner to choose another.`,
      )
    }
    return { userId: owners.rows[0].userId, source: 'largest CMS owner', warnings }
  }

  const legacyOwners = new Set()
  for (const { rows } of loadedSources) {
    for (const row of rows) {
      const id = clean(row.userId)
      if (id) legacyOwners.add(id)
    }
  }

  if (legacyOwners.size === 0) {
    return { userId: null, source: null, warnings: ['No CMS or legacy rows found. Nothing to backfill.'] }
  }

  if (legacyOwners.size > 1) {
    throw new Error(
      `The CMS is empty and the legacy tables contain ${legacyOwners.size} owners (${Array.from(legacyOwners).join(', ')}). Pass --owner to choose one.`,
    )
  }

  return { userId: Array.from(legacyOwners)[0], source: 'only legacy owner', warnings: [] }
}

function sortRows(rows, order) {
  return [...rows].sort((left, right) => {
    if (order === 'music') {
      const leftOrder = numberOrZero(left.sortOrder)
      const rightOrder = numberOrZero(right.sortOrder)
      if (leftOrder !== rightOrder) return leftOrder - rightOrder
      return compareNewest(left, right)
    }
    return compareNewest(left, right)
  })
}

function compareNewest(left, right) {
  const leftTime = timestamp(left.createdAt)
  const rightTime = timestamp(right.createdAt)
  if (leftTime !== rightTime) return rightTime - leftTime
  return numberOrZero(right.id) - numberOrZero(left.id)
}

function buildPlan(context) {
  const { definition, row, index, ownerId, existingByLegacy, existingBySlug, usedSlugs } = context
  const sourceId = row.id == null ? `row-${index}` : String(row.id)
  const plan = {
    source: definition.table,
    sourceId: row.id ?? null,
    collection: definition.target,
    title: '',
    slug: '',
    status: 'draft',
    sortOrder: index,
    payload: {},
    ownerId,
    existing: null,
    changed: false,
    incomplete: false,
    missingRequired: [],
    skipRecord: null,
    warnings: [],
    mapped: [],
    mappedCounts: {},
    skippedFields: [],
    skippedCounts: {},
    preserved: [],
    cmsId: null,
  }

  const mappedPayload = definition.map(row, plan)
  plan.payload = mappedPayload

  if (!plan.collection) {
    plan.skipRecord = 'unknown media kind'
    plan.skippedFields.push({ field: 'kind', reason: 'not anime or manga' })
    return plan
  }

  const legacyKeyValue = legacyKey(plan.collection, definition.table, sourceId)
  let existing = existingByLegacy.get(legacyKeyValue)

  if (!existing) {
    const slugCandidate = candidateSlug(row, plan)
    const slugMatch = existingBySlug.get(slugKey(plan.collection, slugCandidate))
    if (slugMatch) {
      const existingPayload = objectPayload(slugMatch.payload)
      const existingSource = clean(existingPayload[LEGACY_SOURCE_FIELD])
      const existingId = clean(existingPayload[LEGACY_ID_FIELD])

      if (existingSource && existingId) {
        if (existingSource !== definition.table || existingId !== sourceId) {
          plan.skipRecord = 'slug already belongs to a different legacy record'
          plan.skippedFields.push({
            field: 'slug',
            reason: `CMS slug "${slugCandidate}" is already used by ${existingSource}#${existingId}`,
          })
          return plan
        }
      } else if (!options.adoptExisting) {
        plan.skipRecord = 'slug already belongs to an untagged CMS record'
        plan.skippedFields.push({
          field: 'slug',
          reason: `CMS slug "${slugCandidate}" already exists without legacy tags; pass --adopt-existing to merge it`,
        })
        return plan
      } else if (normalizeTitle(slugMatch.title) !== normalizeTitle(plan.title)) {
        plan.skipRecord = 'slug already belongs to an unrelated CMS record'
        plan.skippedFields.push({
          field: 'slug',
          reason: `CMS slug "${slugCandidate}" exists with a different title`,
        })
        return plan
      } else {
        plan.warnings.push(
          `Adopted existing CMS record "${slugMatch.title}" by matching slug and title. Only blank fields will be filled.`,
        )
        existing = slugMatch
      }
    }
  }

  if (existing) {
    const existingPayload = objectPayload(existing.payload)
    plan.existing = {
      id: existing.id,
      title: existing.title,
      slug: existing.slug,
      status: existing.status,
      payload: existingPayload,
      payloadHash: JSON.stringify(existingPayload),
    }
    plan.collection = existing.collection
    plan.title = existing.title
    plan.slug = existing.slug
    plan.status = existing.status
    plan.sortOrder = existing.sortOrder
    mergeExisting(plan, existing)
  } else {
    plan.slug = uniqueSlug(plan.collection, candidateSlug(row, plan), sourceId, usedSlugs)
    addMetadata(plan)
    plan.changed = true
  }

  return plan
}

function mapGallery(row, plan) {
  const title = clean(row.title)
  plan.title = title || 'Gallery photo'
  if (!title) plan.warnings.push('title is empty; using "Gallery photo"')

  const payload = {}
  put(payload, 'imageUrl', clean(row.imageUrl), plan, true)
  put(payload, 'category', clean(row.category), plan)
  put(payload, 'description', clean(row.description), plan)

  plan.status = row.published === false ? 'draft' : 'published'
  plan.mapped.unshift('title', 'slug', 'status', 'sortOrder')

  skipField(plan, 'altText', 'not present in galleryItem')
  skipField(plan, 'location', 'not present in galleryItem')
  skipField(plan, 'featured', 'CMS Gallery has no featured field')
  skipField(plan, 'published', 'mapped to the CMS record status')
  skipField(plan, 'createdAt', 'used to preserve public order')
  skipField(plan, 'updatedAt', 'not copied')
  skipField(plan, 'userId', 'owner is stored on the CMS row')

  if (!clean(row.imageUrl)) plan.skipRecord = 'imageUrl is required by the CMS Gallery'
  return payload
}

function mapProject(row, plan) {
  const title = clean(row.title)
  plan.title = title
  if (!title) plan.skipRecord = 'title is empty'

  const payload = {}
  put(payload, 'summary', clean(row.summary), plan, true)
  put(payload, 'description', clean(row.description), plan)
  put(payload, 'imageUrl', clean(row.imageUrl), plan, true)
  put(payload, 'techStack', cleanArray(row.tech), plan)
  put(payload, 'live', clean(row.liveUrl), plan)
  if (row.featured === true) put(payload, 'featured', true, plan)

  plan.status = row.published === false ? 'draft' : 'published'
  plan.mapped.unshift('title', 'slug', 'status', 'sortOrder')

  for (const [field, reason] of Object.entries({
    github: 'not present in portfolioProject',
    phases: 'not present in portfolioProject',
    features: 'not present in portfolioProject',
    solution: 'not present in portfolioProject',
    period: 'not present in portfolioProject',
    completionDate: 'not present in portfolioProject',
    category: 'not present in portfolioProject',
    altText: 'not present in portfolioProject',
    'payload.status': 'not present in portfolioProject',
  })) {
    skipField(plan, field, reason)
  }
  skipField(plan, 'published', 'mapped to the CMS record status')
  skipField(plan, 'createdAt', 'used to preserve public order')
  skipField(plan, 'updatedAt', 'not copied')
  skipField(plan, 'userId', 'owner is stored on the CMS row')

  if (!clean(row.summary)) plan.warnings.push('summary is empty; the CMS health check will flag it')
  if (!clean(row.imageUrl)) plan.warnings.push('imageUrl is empty; the CMS health check will flag it')
  return payload
}

function mapMusic(row, plan) {
  const title = clean(row.title)
  const artist = clean(row.artist)
  plan.title = title
  if (!title) plan.skipRecord = 'title is empty'
  if (!artist) plan.skipRecord = 'artist is empty'

  const payload = {}
  put(payload, 'artist', artist, plan, true)
  put(payload, 'subtitle', clean(row.album), plan)
  put(payload, 'coverUrl', clean(row.coverUrl), plan)

  const externalUrl = webUrl(row.audioUrl)
  if (externalUrl) {
    put(payload, 'externalUrl', externalUrl, plan)
    if (externalUrl !== clean(row.audioUrl)) {
      plan.warnings.push(`audioUrl converted to ${externalUrl}`)
    }
  } else {
    skipField(plan, 'externalUrl', 'audioUrl is empty or not a web URL / Spotify track URI')
  }

  plan.status = row.published === false ? 'draft' : 'published'
  plan.mapped.unshift('title', 'slug', 'status', 'sortOrder')

  skipField(plan, 'creator', 'not present in musicTrack')
  skipField(plan, 'description', 'not present in musicTrack')
  skipField(plan, 'imageUrl', 'not present in musicTrack')
  skipField(plan, 'rating', 'not present in musicTrack')
  skipField(plan, 'album', 'mapped to subtitle')
  skipField(plan, 'audioUrl', 'mapped to externalUrl when valid')
  skipField(plan, 'published', 'mapped to the CMS record status')
  skipField(plan, 'sortOrder', 'legacy sort order preserved as the new sequential sortOrder')
  skipField(plan, 'createdAt', 'used to preserve public order')
  skipField(plan, 'userId', 'owner is stored on the CMS row')
  return payload
}

function mapCatalog(row, plan) {
  const kind = clean(row.kind).toLowerCase()
  if (kind === 'anime') plan.collection = CMS_COLLECTIONS.anime
  else if (kind === 'manga') plan.collection = CMS_COLLECTIONS.manga
  else {
    plan.collection = null
    return {}
  }

  const title = clean(row.title)
  plan.title = title
  if (!title) plan.skipRecord = 'title is empty'

  const payload = {}
  put(payload, 'status', clean(row.status), plan)
  put(payload, 'rating', clean(row.score), plan)
  put(payload, 'imageUrl', clean(row.imageUrl), plan)
  put(payload, 'description', clean(row.synopsis), plan)

  plan.status = options.publishCatalogs ? 'published' : 'draft'
  plan.mapped.unshift('title', 'slug', 'status', 'sortOrder')

  skipField(plan, 'progress', 'CMS media schema has no progress field')
  skipField(plan, 'externalId', 'API id, not a web URL')
  skipField(plan, 'source', 'import origin, not display content')
  skipField(plan, 'rawData', 'not copied: provider payload can be large or private')
  skipField(plan, 'creator', 'no reliable legacy source')
  skipField(plan, 'subtitle', 'no reliable legacy source')
  skipField(plan, 'coverUrl', 'only imageUrl is present')
  skipField(plan, 'externalUrl', 'externalId is not a web URL')
  skipField(plan, 'createdAt', 'used to preserve public order')
  skipField(plan, 'updatedAt', 'not copied')
  skipField(plan, 'userId', 'owner is stored on the CMS row')
  if (!options.publishCatalogs) {
    plan.warnings.push('migrated as draft because animeMangaItem has no published flag; use --publish-catalogs to publish')
  }
  return payload
}

function mergeExisting(plan, existing) {
  const current = objectPayload(existing.payload)
  const next = { ...current }
  const before = JSON.stringify(current)
  plan.mapped = []

  for (const [field, value] of Object.entries(plan.payload)) {
    if (isBlank(current[field])) {
      next[field] = value
      plan.mapped.push(`payload.${field}`)
    } else if (JSON.stringify(current[field]) !== JSON.stringify(value)) {
      skipField(plan, field, 'existing CMS value preserved')
    }
  }

  const hadSource = clean(current[LEGACY_SOURCE_FIELD])
  const hadId = clean(current[LEGACY_ID_FIELD])
  addMetadataToPayload(next, plan.source, plan.sourceId)
  if (!hadSource) plan.mapped.push(LEGACY_SOURCE_FIELD)
  if (!hadId) plan.mapped.push(LEGACY_ID_FIELD)
  plan.payload = next
  plan.changed = JSON.stringify(next) !== before

  if (existing.status !== plan.status) {
    plan.preserved.push(`status=${existing.status} (legacy would be ${plan.status})`)
  }
  if (existing.title !== plan.title) {
    plan.preserved.push(`title=${existing.title}`)
  }
  if (existing.slug !== plan.slug) {
    plan.preserved.push(`slug=${existing.slug}`)
  }

  if (!plan.changed) {
    plan.warnings.push('already backfilled; nothing to change')
  }
}

function addMetadata(plan) {
  addMetadataToPayload(plan.payload, plan.source, plan.sourceId)
}

function addMetadataToPayload(payload, source, sourceId) {
  if (!clean(payload[LEGACY_SOURCE_FIELD])) payload[LEGACY_SOURCE_FIELD] = source
  if (!clean(payload[LEGACY_ID_FIELD])) payload[LEGACY_ID_FIELD] = String(sourceId)
}

function candidateSlug(row, plan) {
  const explicit = clean(row.slug)
  if (explicit) return slugify(explicit) || `legacy-${plan.source}-${plan.sourceId}`
  return slugify(plan.title) || `legacy-${plan.source}-${plan.sourceId}`
}

function uniqueSlug(collection, desired, sourceId, usedSlugs) {
  let slug = desired
  let attempt = 0
  while (usedSlugs.has(slugKey(collection, slug))) {
    attempt += 1
    slug = `${desired}-${sourceId}${attempt > 1 ? `-${attempt}` : ''}`
  }
  return slug
}

function put(payload, field, value, plan, required = false) {
  if (isBlank(value)) {
    if (required) {
      plan.skippedFields.push({ field, reason: 'required value is empty in the legacy row' })
    }
    return false
  }
  payload[field] = value
  plan.mapped.push(field)
  return true
}

function skipField(plan, field, reason) {
  const alreadyMapped = plan.mapped.includes(field) || plan.mapped.includes(`payload.${field}`)
  if (alreadyMapped) return
  plan.skippedFields.push({ field, reason })
}

function finalizePlan(plan) {
  plan.mapped = Array.from(new Set(plan.mapped))
  const seenSkipped = new Set()
  plan.skippedFields = plan.skippedFields.filter((entry) => {
    const key = `${entry.field}::${entry.reason}`
    if (seenSkipped.has(key)) return false
    seenSkipped.add(key)
    return true
  })

  plan.mappedCounts = {}
  for (const field of plan.mapped) {
    plan.mappedCounts[field] = (plan.mappedCounts[field] ?? 0) + 1
  }

  plan.skippedCounts = {}
  for (const entry of plan.skippedFields) {
    const key = `${entry.field}: ${entry.reason}`
    plan.skippedCounts[key] = (plan.skippedCounts[key] ?? 0) + 1
  }
}

function mergeCounts(target, source) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value
  }
  return target
}

function objectPayload(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function cleanArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => clean(item)).filter(Boolean)
}

function isBlank(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

function slugify(value) {
  return clean(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeTitle(value) {
  return clean(value).toLowerCase().replace(/\s+/g, ' ')
}

function webUrl(value) {
  const text = clean(value)
  if (!text) return null
  if (/^https?:\/\//i.test(text)) return text
  const spotify = text.match(/^spotify:track:([A-Za-z0-9]+)$/)
  if (spotify) return `https://open.spotify.com/track/${spotify[1]}`
  return null
}

function timestamp(value) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function numberOrZero(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function legacyKey(collection, source, id) {
  return `${collection}::${source}::${id}`
}

function slugKey(collection, slug) {
  return `${collection}::${clean(slug).toLowerCase()}`
}

function assertApplySafe(data) {
  if (options.allowPartial) return

  const problems = []
  if (data.totals.missingTables > 0) {
    problems.push(`${data.totals.missingTables} legacy table(s) are missing`)
  }
  if (data.totals.skipped > 0) {
    problems.push(`${data.totals.skipped} record(s) would be skipped`)
  }
  if (data.totals.incomplete > 0) {
    problems.push(`${data.totals.incomplete} record(s) are missing required CMS fields`)
  }
  if (problems.length === 0) return

  throw new Error(
    `Refusing --apply: ${problems.join('; ')}. Review the dry-run report and fix the source data, or pass --allow-partial to migrate what is safe. No rows were written.`,
  )
}

async function writeBackup(data, plans) {
  if (options.noBackup) {
    data.warnings.push('Pre-apply backup skipped because --no-backup was passed.')
    return
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.resolve(
    options.backup ?? path.join('backups', `legacy-media-backfill-${stamp}.json`),
  )

  try {
    await access(file)
    throw new Error(`Backup file already exists: ${file}. Choose a new --backup path.`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
  const backup = {
    generatedAt: data.generatedAt,
    owner: data.owner,
    ownerSource: data.ownerSource,
    mode: data.mode,
    totals: data.totals,
    sources: data.sources,
    records: plans.map((plan) => ({
      source: plan.source,
      sourceId: plan.sourceId,
      collection: plan.collection,
      title: plan.title,
      slug: plan.slug,
      action: plan.action,
      before: plan.existing
        ? {
            id: plan.existing.id,
            title: plan.existing.title,
            slug: plan.existing.slug,
            status: plan.existing.status,
            payload: plan.existing.payload,
          }
        : null,
      after: {
        status: plan.status,
        sortOrder: plan.sortOrder,
        payload: plan.payload,
      },
    })),
  }

  await writeFile(file, `${JSON.stringify(backup, null, 2)}\n`, { mode: 0o600 })
  data.backupPath = file
}

async function verifyApplied(client, plans) {
  for (const plan of plans) {
    const result = await client.query(
      `select "payload" from "cmsContent" where "id" = $1`,
      [plan.cmsId],
    )
    if (!result.rowCount) {
      throw new Error(`Verification failed: CMS record #${plan.cmsId} is missing.`)
    }

    const payload = objectPayload(result.rows[0].payload)
    for (const [field, value] of Object.entries(plan.payload)) {
      if (JSON.stringify(payload[field]) !== JSON.stringify(value)) {
        throw new Error(
          `Verification failed for ${plan.source}#${plan.sourceId}: field "${field}" did not persist. Rolling back.`,
        )
      }
    }
  }
}

function printReport(data) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2))
    return
  }

  console.log(`Legacy media backfill — ${data.mode.toUpperCase()}`)
  console.log(`Owner: ${data.owner ?? '(none)'}${data.ownerSource ? ` (${data.ownerSource})` : ''}`)
  if (data.backupPath) console.log(`Backup: ${data.backupPath}`)
  console.log('')

  for (const source of data.sources) {
    if (source.missingTable) {
      console.log(`${source.source}: table missing — skipped`)
      continue
    }
    console.log(
      `${source.source} → ${source.target}: ${source.sourceRows} source row(s), ${source.eligible} eligible, ` +
        `${source.inserted} insert, ${source.updated} update, ${source.unchanged} unchanged, ` +
        `${source.skipped} skipped, ${source.incomplete} incomplete, ${source.otherOwner} other owner`,
    )
    if (source.missingColumns?.length) {
      console.log(`  missing expected column(s): ${source.missingColumns.join(', ')}`)
    }
  }

  if (data.records.length > 0) {
    console.log('\nRecords:')
    for (const record of data.records) {
      const label = `${record.source}#${record.sourceId ?? '?'} → ${record.collection ?? '(none)'} "${record.title || '(untitled)'}"`
      console.log(`  [${record.action}] ${label}`)
      if (record.mapped.length > 0) {
        console.log(`    mapped: ${record.mapped.join(', ')}`)
      }
      if (record.skippedFields.length > 0) {
        const shown = options.verbose
          ? record.skippedFields.map((entry) => `${entry.field} (${entry.reason})`)
          : summarizeSkipped(record.skippedFields)
        console.log(`    skipped fields: ${shown.join('; ')}`)
      }
      if (record.missingRequired?.length > 0) {
        console.log(`    missing required: ${record.missingRequired.join(', ')}`)
      }
      if (options.verbose && record.preserved?.length > 0) {
        console.log(`    preserved: ${record.preserved.join('; ')}`)
      }
      if (record.warnings.length > 0) {
        console.log(`    warnings: ${record.warnings.join('; ')}`)
      }
    }
  }

  console.log('\nTotals:')
  console.log(
    `  ${data.totals.sourceRows} source row(s), ${data.totals.eligible} eligible, ` +
      `${data.totals.inserted} insert, ${data.totals.updated} update, ` +
      `${data.totals.unchanged} unchanged, ${data.totals.skipped} skipped, ` +
      `${data.totals.incomplete} incomplete, ${data.totals.otherOwner} other owner, ` +
      `${data.totals.missingTables} missing table(s)`,
  )

  const warnings = data.warnings ?? []
  if (warnings.length > 0) {
    console.log('\nWarnings:')
    for (const warning of warnings) console.log(`  - ${warning}`)
  }

  console.log('\nField coverage:')
  for (const [label, coverage] of Object.entries(data.fieldSummary)) {
    const mapped = Object.entries(coverage.mapped)
      .map(([field, count]) => `${field} (${count})`)
      .join(', ')
    const skipped = Object.entries(coverage.skipped)
      .map(([field, count]) => `${field} (${count})`)
      .join(', ')
    console.log(`  ${label}:`)
    console.log(`    mapped: ${mapped || '(none)'}`)
    console.log(`    skipped: ${skipped || '(none)'}`)
    const unavailable = Object.entries(coverage.unavailable ?? {})
    if (unavailable.length > 0) {
      console.log(`    no legacy source: ${unavailable.map(([field, reason]) => `${field} (${reason})`).join('; ')}`)
    }
    const unmapped = Object.entries(coverage.unmappedLegacy ?? {})
    if (unmapped.length > 0) {
      console.log(`    legacy fields not copied: ${unmapped.map(([field, reason]) => `${field} (${reason})`).join('; ')}`)
    }
  }

  if (!options.apply) {
    console.log('\nDry run: no rows were written. Re-run with --apply to write these changes.')
  } else {
    console.log(`\nApply complete.${data.backupPath ? ` Backup: ${data.backupPath}` : ''}`)
  }
}

function summarizeSkipped(entries) {
  const counts = new Map()
  for (const entry of entries) {
    const key = `${entry.field} (${entry.reason})`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([key, count]) => (count > 1 ? `${key} ×${count}` : key))
}
