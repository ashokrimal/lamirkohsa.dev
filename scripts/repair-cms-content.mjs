/**
 * Repairs keyed CMS records without replacing editorial content.
 *
 * This is a dry run by default. It:
 * - backfills missing payload.key values on keyed records,
 * - fills only blank top-level fields from the seed defaults,
 * - creates keyed seed records whose key is completely missing,
 * - normalises the legacy timezone/image/challenge field names and the old
 *   films media key,
 * - reports duplicate keys, slug conflicts and records it cannot key.
 * - produces a read-only dedupe plan for duplicate published records with
 *   --dedupe-plan (also available as `pnpm cms:dedupe`),
 * - unpublishes only the safe dedupe actions with --apply-dedupe, optionally
 *   restricted to a saved plan with --plan <path>,
 * - republishes the records recorded by an apply with --restore-dedupe.
 *
 * Existing non-blank values are never overwritten, and no rows are deleted.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs
 *   DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --dedupe-plan
 *   DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --apply-dedupe --plan plan.json
 *   DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --restore-dedupe backup.json
 *   DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --apply
 *
 * Apply safety:
 *   --backup <path>   choose the JSON backup file
 *   --no-backup       skip the backup (not recommended)
 *   --allow-partial   write safe repairs even when duplicates, slug conflicts
 *                     or unkeyable records remain
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { Client } from 'pg'
import { loadCmsSchema } from './load-cms-schema.mjs'
import {
  buildSeedRecords,
  keyFromRecord,
  normalizePayload,
} from './migrate-site-content.mjs'

const options = {
  apply: false,
  json: false,
  help: false,
  backup: null,
  noBackup: false,
  allowPartial: false,
  dedupePlan: false,
  applyDedupe: false,
  restoreDedupe: false,
  restoreFile: null,
  planFile: null,
  output: null,
}

for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index]
  if (argument === '--apply') options.apply = true
  else if (argument === '--json') options.json = true
  else if (argument === '--help' || argument === '-h') options.help = true
  else if (argument === '--no-backup') options.noBackup = true
  else if (argument === '--allow-partial') options.allowPartial = true
  else if (argument === '--dedupe-plan') options.dedupePlan = true
  else if (argument === '--apply-dedupe') options.applyDedupe = true
  else if (argument === '--restore-dedupe') {
    options.restoreDedupe = true
    const next = process.argv[index + 1]
    if (next && !next.startsWith('--')) {
      options.restoreFile = next
      index += 1
    }
  } else if (argument.startsWith('--restore-dedupe=')) {
    options.restoreDedupe = true
    options.restoreFile = argument.slice('--restore-dedupe='.length)
    if (!options.restoreFile) throw new Error('--restore-dedupe needs a backup file')
  } else if (argument === '--plan') {
    options.planFile = process.argv[index + 1]
    if (!options.planFile) throw new Error('--plan needs a file path')
    index += 1
  } else if (argument.startsWith('--plan=')) {
    options.planFile = argument.slice('--plan='.length)
    if (!options.planFile) throw new Error('--plan needs a file path')
  } else if (argument === '--output') {
    options.output = process.argv[index + 1]
    if (!options.output) throw new Error('--output needs a file path')
    index += 1
  } else if (argument.startsWith('--output=')) {
    options.output = argument.slice('--output='.length)
    if (!options.output) throw new Error('--output needs a file path')
  } else if (argument === '--backup') {
    options.backup = process.argv[index + 1]
    if (!options.backup) throw new Error('--backup needs a file path')
    index += 1
  } else if (argument.startsWith('--backup=')) {
    options.backup = argument.slice('--backup='.length)
    if (!options.backup) throw new Error('--backup needs a file path')
  } else {
    throw new Error(`Unknown argument: ${argument}`)
  }
}

if (options.help) {
  console.log(`Repair keyed CMS records without overwriting content.

  DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs           # dry run
  DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --dedupe-plan
  DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --apply-dedupe --plan plan.json
  DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --restore-dedupe backup.json
  DATABASE_URL=postgres://... node scripts/repair-cms-content.mjs --apply

Options:
  --apply              Write the safe repairs. Default is a dry run.
  --backup <path>      Backup file. Repair defaults to cms-repair-<timestamp>;
                       dedupe apply defaults to cms-dedupe-<timestamp>.
  --no-backup          Skip the backup.
  --allow-partial      Apply safe repairs even when duplicate keys, slug
                       conflicts or unkeyable records remain.
  --dedupe-plan        Read-only plan for duplicate published records.
  --output <path>      Save the dedupe plan as JSON. Implies --dedupe-plan.
  --apply-dedupe       Unpublish only the safe duplicates from a fresh plan.
  --plan <path>        Apply only the safe actions in a previously saved plan.
  --restore-dedupe [backup]
                       Republish the records listed in a cms-dedupe backup.
  --json               Print a machine-readable report.
  --help               Show this help.

Existing non-blank fields are never overwritten. No records are deleted.
`)
  process.exit(0)
}

if (options.output) options.dedupePlan = true
if (options.restoreDedupe && (options.apply || options.applyDedupe || options.dedupePlan || options.planFile)) {
  throw new Error('--restore-dedupe cannot be combined with repair or dedupe apply modes.')
}
if (options.applyDedupe && (options.apply || options.dedupePlan)) {
  throw new Error('--apply-dedupe cannot be combined with --apply, --dedupe-plan or --output.')
}
if (options.dedupePlan && options.apply) {
  throw new Error('--dedupe-plan is read-only; do not combine it with --apply.')
}
if (options.planFile && !options.applyDedupe) {
  throw new Error('--plan requires --apply-dedupe.')
}
if (options.restoreDedupe && !options.restoreFile) options.restoreFile = options.backup
if (options.restoreDedupe && !options.restoreFile) {
  throw new Error('--restore-dedupe needs a cms-dedupe backup file.')
}

const { CMS_COLLECTIONS, CMS_SCHEMA } = await loadCmsSchema()
const KEYED_COLLECTIONS = new Set(
  Object.values(CMS_SCHEMA.collections)
    .filter((definition) => definition.keyed)
    .map((definition) => definition.name),
)

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeKey(value) {
  const key = clean(value).toLowerCase()
  return key === 'films' ? 'movies' : key
}

function isBlank(value) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/** Key-order-independent comparison for JSONB payloads. */
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function samePayload(left, right) {
  return stableStringify(left) === stableStringify(right)
}

function filledCount(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return 0
  return Object.values(payload).filter((value) => !isBlank(value)).length
}

/**
 * Adds seed values only where the current value is blank. It deliberately does
 * not deep-merge arrays or objects: a non-empty value is editorial content.
 */
function mergeMissing(current, defaults) {
  const next = { ...current }
  const filled = []
  for (const [key, value] of Object.entries(defaults)) {
    if (isBlank(next[key]) && !isBlank(value)) {
      next[key] = value
      filled.push(key)
    }
  }
  return { payload: next, filled }
}

function keyFromRow(row) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {}
  const existing = normalizeKey(payload.key)
  if (existing) return existing

  const slug = clean(row.slug).toLowerCase()
  const title = clean(row.title).toLowerCase()
  const bySlug = seedBySlug.get(`${row.collection}\u0000${slug}`)
  if (bySlug) return bySlug
  const byTitle = seedByTitle.get(`${row.collection}\u0000${title}`)
  if (byTitle) return byTitle

  if (row.collection === CMS_COLLECTIONS.pageCopy && slug.startsWith('page-')) {
    return normalizeKey(slug.slice('page-'.length))
  }
  if (
    row.collection === CMS_COLLECTIONS.mediaCollections &&
    slug.startsWith('media-collection-')
  ) {
    return normalizeKey(slug.slice('media-collection-'.length))
  }
  return normalizeKey(slug || title)
}

const seedRecords = buildSeedRecords().map((record) => {
  const payload = normalizePayload(record, record.payload ?? {})
  const key = normalizeKey(payload.key || keyFromRecord({ ...record, payload }))
  return { ...record, payload, key }
})

const seedBySlug = new Map()
const seedByTitle = new Map()
for (const seed of seedRecords) {
  seedBySlug.set(`${seed.collection}\u0000${clean(seed.slug).toLowerCase()}`, seed.key)
  seedByTitle.set(`${seed.collection}\u0000${clean(seed.title).toLowerCase()}`, seed.key)
}

function displayTarget(connectionString) {
  try {
    const url = new URL(connectionString)
    return `${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`
  } catch {
    return 'database'
  }
}

async function writeBackup(rows, plans, connectionString, prefix = 'cms-repair') {
  const target =
    options.backup ??
    path.join('backups', `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  const absolute = path.resolve(target)
  await fs.mkdir(path.dirname(absolute), { recursive: true, mode: 0o700 })
  try {
    await fs.access(absolute)
    throw new Error(`Backup already exists: ${absolute}. Choose another --backup path.`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const backup = {
    createdAt: new Date().toISOString(),
    database: displayTarget(connectionString),
    rows,
    plans,
  }
  await fs.writeFile(absolute, `${JSON.stringify(backup, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
    flag: 'wx',
  })
  return absolute
}

function chooseCanonical(candidates) {
  return [...candidates].sort((left, right) => {
    const leftHasKey = normalizeKey(left.payload?.key) ? 1 : 0
    const rightHasKey = normalizeKey(right.payload?.key) ? 1 : 0
    if (leftHasKey !== rightHasKey) return rightHasKey - leftHasKey
    const filled = filledCount(right.payload) - filledCount(left.payload)
    if (filled !== 0) return filled
    const order = Number(left.sortOrder ?? 0) - Number(right.sortOrder ?? 0)
    if (order !== 0) return order
    return Number(left.id) - Number(right.id)
  })[0]
}

function summarizeRow(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    filledFields: filledCount(row.payload),
    payload: row.payload,
  }
}

function fieldDiff(canonical, duplicate) {
  const uniqueFields = []
  const conflictingFields = []
  for (const [key, value] of Object.entries(duplicate.payload ?? {})) {
    if (isBlank(value)) continue
    const current = canonical.payload?.[key]
    if (isBlank(current)) uniqueFields.push(key)
    else if (!samePayload(current, value)) conflictingFields.push(key)
  }
  return { uniqueFields, conflictingFields }
}

function buildDedupePlan(rows) {
  const published = rows.filter((row) => row.status === 'published')
  const groups = []
  const seenRowSets = new Set()

  function addGroup(match, collection, value, candidates, reason) {
    if (candidates.length < 2) return
    const ids = candidates
      .map((row) => row.id)
      .sort((left, right) => Number(left) - Number(right))
      .join(',')
    if (seenRowSets.has(ids)) return
    seenRowSets.add(ids)

    const canonical = chooseCanonical(candidates)
    const duplicates = candidates
      .filter((row) => row.id !== canonical.id)
      .map((row) => ({
        ...summarizeRow(row),
        ...fieldDiff(canonical, row),
      }))
    const hasUniqueContent = duplicates.some(
      (row) => row.uniqueFields.length > 0 || row.conflictingFields.length > 0,
    )
    const recommendation =
      reason === 'duplicate-title'
        ? 'review-possible-duplicate'
        : hasUniqueContent
          ? 'review-merge'
          : 'unpublish-duplicates'
    const actions =
      recommendation === 'unpublish-duplicates'
        ? duplicates.map((row) => ({
            type: 'unpublish',
            id: row.id,
            title: row.title,
            slug: row.slug,
          }))
        : []

    groups.push({
      match,
      collection,
      value,
      reason,
      canonical: summarizeRow(canonical),
      duplicates,
      recommendation,
      actions,
    })
  }

  for (const collection of KEYED_COLLECTIONS) {
    const byKey = new Map()
    for (const row of published) {
      if (row.collection !== collection) continue
      const key = keyFromRow(row)
      if (!key) continue
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key).push(row)
    }
    for (const [key, candidates] of byKey) {
      addGroup('key', collection, key, candidates, 'duplicate-key')
    }
  }

  const bySlug = new Map()
  for (const row of published) {
    const slug = clean(row.slug).toLowerCase()
    if (!slug) continue
    const groupKey = `${row.collection}\u0000${slug}`
    if (!bySlug.has(groupKey)) bySlug.set(groupKey, [])
    bySlug.get(groupKey).push(row)
  }
  for (const [groupKey, candidates] of bySlug) {
    const [collection, slug] = groupKey.split('\u0000')
    addGroup('slug', collection, slug, candidates, 'duplicate-slug')
  }

  const byTitle = new Map()
  for (const row of published) {
    if (KEYED_COLLECTIONS.has(row.collection)) continue
    const title = clean(row.title).toLowerCase()
    if (!title) continue
    const groupKey = `${row.collection}\u0000${title}`
    if (!byTitle.has(groupKey)) byTitle.set(groupKey, [])
    byTitle.get(groupKey).push(row)
  }
  for (const [groupKey, candidates] of byTitle) {
    const [collection, title] = groupKey.split('\u0000')
    addGroup('title', collection, title, candidates, 'duplicate-title')
  }

  const groupsNeedingReview = groups.filter(
    (group) => group.recommendation !== 'unpublish-duplicates',
  )
  return {
    generatedAt: new Date().toISOString(),
    groups,
    totals: {
      groups: groups.length,
      duplicateRecords: groups.reduce((total, group) => total + group.duplicates.length, 0),
      safeUnpublishes: groups.reduce((total, group) => total + group.actions.length, 0),
      groupsNeedingReview: groupsNeedingReview.length,
    },
  }
}

async function writePlan(plan) {
  const absolute = path.resolve(options.output)
  await fs.mkdir(path.dirname(absolute), { recursive: true, mode: 0o700 })
  try {
    await fs.access(absolute)
    throw new Error(`Plan file already exists: ${absolute}. Choose another --output path.`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await fs.writeFile(absolute, `${JSON.stringify(plan, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
    flag: 'wx',
  })
  return absolute
}

function actionIdKey(id) {
  return String(id)
}

function safeDedupeActions(plan) {
  const actions = []
  const seen = new Set()
  for (const group of plan.groups) {
    if (group.recommendation !== 'unpublish-duplicates') continue
    for (const action of group.actions) {
      const key = actionIdKey(action.id)
      if (seen.has(key)) {
        throw new Error(
          `Record ${action.id} appears in overlapping duplicate groups. Resolve that overlap manually.`,
        )
      }
      seen.add(key)
      const duplicate = group.duplicates.find(
        (candidate) => actionIdKey(candidate.id) === actionIdKey(action.id),
      )
      if (!duplicate) {
        throw new Error(`Dedupe plan action ${action.id} has no matching duplicate record.`)
      }
      if (duplicate.uniqueFields.length > 0 || duplicate.conflictingFields.length > 0) {
        throw new Error(`Dedupe plan action ${action.id} still contains unique or conflicting content.`)
      }
      actions.push({
        ...action,
        canonicalId: group.canonical.id,
        collection: group.collection,
        match: group.match,
        value: group.value,
      })
    }
  }
  return actions
}

async function readReviewedPlan(file) {
  const absolute = path.resolve(file)
  let plan
  try {
    plan = JSON.parse(await fs.readFile(absolute, 'utf8'))
  } catch (error) {
    throw new Error(`Could not read dedupe plan ${absolute}: ${error.message}`)
  }
  if (!plan || !Array.isArray(plan.groups)) {
    throw new Error(`Dedupe plan ${absolute} has no groups array.`)
  }

  const actions = []
  const seen = new Set()
  for (const group of plan.groups) {
    if (group.recommendation !== 'unpublish-duplicates') continue
    if (!group.canonical || group.canonical.id === undefined || group.canonical.id === null) {
      throw new Error(`Dedupe plan group "${group.collection} / ${group.value}" has no canonical record.`)
    }
    if (!Array.isArray(group.actions) || !Array.isArray(group.duplicates)) {
      throw new Error(`Dedupe plan group "${group.collection} / ${group.value}" is incomplete.`)
    }
    for (const action of group.actions) {
      if (
        action.type !== 'unpublish' ||
        action.id === undefined ||
        action.id === null ||
        typeof action.title !== 'string' ||
        typeof action.slug !== 'string'
      ) {
        throw new Error(`Dedupe plan has an invalid action in "${group.collection} / ${group.value}".`)
      }
      const key = actionIdKey(action.id)
      if (seen.has(key)) {
        throw new Error(`Dedupe plan contains duplicate action for record ${action.id}.`)
      }
      const duplicate = group.duplicates.find(
        (candidate) => actionIdKey(candidate.id) === key,
      )
      if (!duplicate) {
        throw new Error(`Dedupe plan action ${action.id} has no duplicate details.`)
      }
      if (
        !Array.isArray(duplicate.uniqueFields) ||
        !Array.isArray(duplicate.conflictingFields) ||
        !duplicate.payload ||
        typeof duplicate.payload !== 'object' ||
        Array.isArray(duplicate.payload)
      ) {
        throw new Error(`Dedupe plan action ${action.id} has no field comparison details.`)
      }
      if (duplicate.uniqueFields.length > 0 || duplicate.conflictingFields.length > 0) {
        throw new Error(`Dedupe plan action ${action.id} is not safe to unpublish.`)
      }
      seen.add(key)
      actions.push({
        id: action.id,
        title: action.title,
        slug: action.slug,
        payload: duplicate.payload,
        canonicalId: group.canonical.id,
        collection: group.collection,
        match: group.match,
        value: group.value,
      })
    }
  }
  return { absolute, database: plan.database ?? null, actions }
}

async function readDedupeBackup(file) {
  const absolute = path.resolve(file)
  let backup
  try {
    backup = JSON.parse(await fs.readFile(absolute, 'utf8'))
  } catch (error) {
    throw new Error(`Could not read cms-dedupe backup ${absolute}: ${error.message}`)
  }
  if (!backup || !Array.isArray(backup.rows)) {
    throw new Error(`Backup ${absolute} has no CMS rows.`)
  }
  if (!backup.plans || backup.plans.type !== 'dedupe') {
    throw new Error(`Backup ${absolute} was not written by cms:dedupe:apply.`)
  }
  if (!Array.isArray(backup.plans.actions) || backup.plans.actions.length === 0) {
    throw new Error(`Backup ${absolute} has no applied dedupe actions.`)
  }

  const seen = new Set()
  for (const action of backup.plans.actions) {
    if (
      action.id === undefined ||
      action.id === null ||
      typeof action.title !== 'string' ||
      typeof action.slug !== 'string'
    ) {
      throw new Error(`Backup ${absolute} has an invalid dedupe action.`)
    }
    const key = actionIdKey(action.id)
    if (seen.has(key)) {
      throw new Error(`Backup ${absolute} contains duplicate actions for record ${action.id}.`)
    }
    seen.add(key)
  }

  return { absolute, backup }
}

async function restoreDedupeBackup(client, connectionString, rows, source) {
  if (
    source.backup.database &&
    source.backup.database !== displayTarget(connectionString)
  ) {
    throw new Error(
      `Backup was created for ${source.backup.database}, not ${displayTarget(connectionString)}. No changes were made.`,
    )
  }

  const currentById = new Map(rows.map((row) => [actionIdKey(row.id), row]))
  const backupById = new Map(
    source.backup.rows.map((row) => [actionIdKey(row.id), row]),
  )
  const targets = []
  const alreadyRestored = []

  for (const action of source.backup.plans.actions) {
    const key = actionIdKey(action.id)
    const saved = backupById.get(key)
    if (!saved) {
      throw new Error(`Backup has no saved row for record ${action.id}. No changes were made.`)
    }
    if (saved.status !== 'published') {
      throw new Error(
        `Backup record ${action.id} was not published when the backup was written. No changes were made.`,
      )
    }
    if (
      saved.title !== action.title ||
      saved.slug !== action.slug ||
      (action.collection && saved.collection !== action.collection)
    ) {
      throw new Error(`Backup record ${action.id} does not match its action. No changes were made.`)
    }

    const current = currentById.get(key)
    if (!current) {
      throw new Error(`Record ${action.id} no longer exists. No changes were made.`)
    }
    if (
      current.collection !== saved.collection ||
      current.title !== saved.title ||
      current.slug !== saved.slug
    ) {
      throw new Error(
        `Record ${action.id} changed since the backup was written. No changes were made.`,
      )
    }
    if (current.status === 'published') {
      alreadyRestored.push(action)
      continue
    }
    if (current.status !== 'draft') {
      throw new Error(
        `Record ${action.id} is ${current.status}, not draft. No changes were made.`,
      )
    }
    targets.push({ action, expected: current })
  }

  if (targets.length === 0) return { republished: [], alreadyRestored }

  const targetIds = targets.map((target) => actionIdKey(target.action.id))
  await client.query('begin')
  try {
    await client.query("set local lock_timeout = '15s'")
    await client.query('lock table "cmsContent" in share row exclusive mode')

    const locked = await client.query(
      `select "id", "collection", "title", "slug", "payload", "status", "sortOrder"
         from "cmsContent"
        where "id" = any($1::int[])
        for update`,
      [targetIds.map(Number)],
    )
    const lockedById = new Map(locked.rows.map((row) => [actionIdKey(row.id), row]))
    for (const target of targets) {
      const current = lockedById.get(actionIdKey(target.action.id))
      if (!current || !sameStoredRow(current, target.expected)) {
        throw new Error(
          `Record ${target.action.id} changed before restore. No rows were written.`,
        )
      }
    }

    for (const target of targets) {
      const updated = await client.query(
        `update "cmsContent" set "status" = 'published'
          where "id" = $1 and "status" = 'draft'
          returning "status"`,
        [target.action.id],
      )
      if (updated.rowCount !== 1 || updated.rows[0].status !== 'published') {
        throw new Error(`Verification failed while restoring record ${target.action.id}. No rows were written.`)
      }
    }

    const verified = await client.query(
      `select "id", "status" from "cmsContent" where "id" = any($1::int[])`,
      [targetIds.map(Number)],
    )
    const verifiedById = new Map(verified.rows.map((row) => [actionIdKey(row.id), row]))
    for (const target of targets) {
      if (verifiedById.get(actionIdKey(target.action.id))?.status !== 'published') {
        throw new Error(`Verification failed for restored record ${target.action.id}. No rows were written.`)
      }
    }

    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  }

  return { republished: targets.map((target) => target.action), alreadyRestored }
}

function sameStoredRow(left, right) {
  return (
    actionIdKey(left.id) === actionIdKey(right.id) &&
    left.collection === right.collection &&
    left.title === right.title &&
    left.slug === right.slug &&
    left.status === right.status &&
    Number(left.sortOrder) === Number(right.sortOrder) &&
    samePayload(left.payload, right.payload)
  )
}

async function applyDedupe(client, connectionString, rows, plan, reviewedPlan) {
  if (
    reviewedPlan?.database &&
    reviewedPlan.database !== displayTarget(connectionString)
  ) {
    throw new Error(
      `Dedupe plan was created for ${reviewedPlan.database}, not ${displayTarget(connectionString)}. No changes were made.`,
    )
  }
  const rowsById = new Map(rows.map((row) => [actionIdKey(row.id), row]))
  const currentActions = safeDedupeActions(plan)
  const currentById = new Map(
    currentActions.map((action) => [actionIdKey(action.id), action]),
  )
  let actions = currentActions
  let alreadyApplied = []

  if (reviewedPlan) {
    const reviewedById = new Map(
      reviewedPlan.actions.map((action) => [actionIdKey(action.id), action]),
    )
    for (const reviewed of reviewedPlan.actions) {
      const key = actionIdKey(reviewed.id)
      const row = rowsById.get(key)
      if (!row) {
        throw new Error(`Reviewed record ${reviewed.id} no longer exists. No changes were made.`)
      }
      if (
        row.title !== reviewed.title ||
        row.slug !== reviewed.slug ||
        !samePayload(row.payload, reviewed.payload)
      ) {
        throw new Error(
          `Record ${reviewed.id} changed after the plan was made. No changes were made.`,
        )
      }
      if (row.status === 'draft') {
        const canonical = rowsById.get(actionIdKey(reviewed.canonicalId))
        if (!canonical || canonical.status !== 'published') {
          throw new Error(
            `Kept record ${reviewed.canonicalId} for ${reviewed.id} is not published. No changes were made.`,
          )
        }
        alreadyApplied.push(reviewed)
        continue
      }
      if (row.status !== 'published') {
        throw new Error(
          `Record ${reviewed.id} is ${row.status}, not published. No changes were made.`,
        )
      }
      const current = currentById.get(key)
      if (!current) {
        throw new Error(
          `Record ${reviewed.id} is no longer a safe duplicate. Regenerate the dedupe plan. No changes were made.`,
        )
      }
      if (actionIdKey(current.canonicalId) !== actionIdKey(reviewed.canonicalId)) {
        throw new Error(
          `The kept record for ${reviewed.id} changed after the plan was made. No changes were made.`,
        )
      }
    }

    for (const current of currentActions) {
      if (!reviewedById.has(actionIdKey(current.id))) {
        throw new Error(
          `New safe duplicate ${current.id} appeared after the plan was made. Regenerate the dedupe plan. No changes were made.`,
        )
      }
    }
    actions = reviewedPlan.actions
      .filter((action) => !alreadyApplied.some((applied) => actionIdKey(applied.id) === actionIdKey(action.id)))
      .map((action) => currentById.get(actionIdKey(action.id)))
  }

  const canonicalIds = new Set(plan.groups.map((group) => actionIdKey(group.canonical.id)))
  for (const action of actions) {
    if (canonicalIds.has(actionIdKey(action.id))) {
      throw new Error(
        `Record ${action.id} is both a duplicate and a kept record in another group. Resolve that overlap manually. No changes were made.`,
      )
    }
  }

  const skippedGroups = plan.groups.filter(
    (group) => group.recommendation !== 'unpublish-duplicates',
  )
  if (actions.length === 0) {
    return { actions, alreadyApplied, skippedGroups, backupPath: null }
  }

  let backupPath = null
  if (!options.noBackup) {
    backupPath = await writeBackup(
      rows,
      {
        type: 'dedupe',
        reviewedPlanPath: reviewedPlan?.absolute ?? null,
        currentPlan: plan,
        actions,
        alreadyApplied,
      },
      connectionString,
      'cms-dedupe',
    )
  }

  const targetIds = [
    ...new Set([
      ...actions.map((action) => actionIdKey(action.id)),
      ...actions.map((action) => actionIdKey(action.canonicalId)),
    ]),
  ]
  const expectedRows = targetIds.map((id) => {
    const row = rowsById.get(id)
    if (!row) throw new Error(`Record ${id} disappeared after planning. No changes were made.`)
    return row
  })

  await client.query('begin')
  try {
    await client.query("set local lock_timeout = '15s'")
    await client.query('lock table "cmsContent" in share row exclusive mode')

    const locked = await client.query(
      `select "id", "collection", "title", "slug", "payload", "status", "sortOrder"
         from "cmsContent"
        where "id" = any($1::int[])
        for update`,
      [targetIds.map(Number)],
    )
    const lockedById = new Map(locked.rows.map((row) => [actionIdKey(row.id), row]))
    for (const expected of expectedRows) {
      const current = lockedById.get(actionIdKey(expected.id))
      if (!current || !sameStoredRow(current, expected)) {
        throw new Error(
          `Record ${expected.id} (${expected.collection} / ${expected.title}) changed after planning. No rows were written.`,
        )
      }
      if (current.status !== 'published') {
        throw new Error(`Record ${expected.id} is no longer published. No rows were written.`)
      }
    }

    for (const action of actions) {
      const updated = await client.query(
        `update "cmsContent" set "status" = 'draft'
          where "id" = $1 and "status" = 'published'
          returning "status"`,
        [action.id],
      )
      if (updated.rowCount !== 1 || updated.rows[0].status !== 'draft') {
        throw new Error(`Verification failed while unpublishing record ${action.id}. No rows were written.`)
      }
    }

    const verified = await client.query(
      `select "id", "status" from "cmsContent" where "id" = any($1::int[])`,
      [targetIds.map(Number)],
    )
    const verifiedById = new Map(verified.rows.map((row) => [actionIdKey(row.id), row]))
    for (const action of actions) {
      if (verifiedById.get(actionIdKey(action.id))?.status !== 'draft') {
        throw new Error(`Verification failed for unpublished record ${action.id}. No rows were written.`)
      }
      if (verifiedById.get(actionIdKey(action.canonicalId))?.status !== 'published') {
        throw new Error(`Verification failed for kept record ${action.canonicalId}. No rows were written.`)
      }
    }

    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  }

  return { actions, alreadyApplied, skippedGroups, backupPath }
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required.')

  const client = new Client({ connectionString })
  await client.connect()

  try {
    const ownerResult = await client.query(
      `select "userId", count(*) as total from "cmsContent" group by 1 order by total desc limit 1`,
    )
    const userId = ownerResult.rows[0]?.userId
    if (!userId) throw new Error('No CMS records found; sign in and save a record first.')

    const allRowsResult = await client.query(
      `select "id", "userId", "collection", "title", "slug", "payload", "status", "sortOrder"
         from "cmsContent"
        order by "collection", "sortOrder", "id"`,
    )
    const rows = allRowsResult.rows.map((row) => ({
      ...row,
      payload: row.payload && typeof row.payload === 'object' ? row.payload : {},
    }))

    const rowsByCollection = new Map()
    for (const row of rows) {
      if (!rowsByCollection.has(row.collection)) rowsByCollection.set(row.collection, [])
      rowsByCollection.get(row.collection).push(row)
    }

    if (options.restoreDedupe) {
      const source = await readDedupeBackup(options.restoreFile)
      const result = await restoreDedupeBackup(client, connectionString, rows, source)

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              mode: 'dedupe-restore',
              database: displayTarget(connectionString),
              sourceBackup: source.absolute,
              republished: result.republished,
              alreadyRestored: result.alreadyRestored,
            },
            null,
            2,
          ),
        )
        return
      }

      console.log(`CMS dedupe restore — ${displayTarget(connectionString)}`)
      console.log(`Source backup: ${source.absolute}`)
      if (result.republished.length > 0) {
        console.log(`Republished ${result.republished.length} record(s):`)
        for (const action of result.republished) {
          console.log(
            `  #${action.id} "${action.title}" (${action.collection} / ${action.slug})`,
          )
        }
      } else {
        console.log('No draft records needed republishing.')
      }
      if (result.alreadyRestored.length > 0) {
        console.log(`Already published: ${result.alreadyRestored.length} record(s).`)
      }
      console.log('Run pnpm cms:check after restoring.')
      return
    }

    if (options.applyDedupe) {
      const plan = {
        database: displayTarget(connectionString),
        ...buildDedupePlan(rows),
      }
      const reviewedPlan = options.planFile ? await readReviewedPlan(options.planFile) : null
      const result = await applyDedupe(client, connectionString, rows, plan, reviewedPlan)

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              mode: 'dedupe-apply',
              database: displayTarget(connectionString),
              reviewedPlanPath: reviewedPlan?.absolute ?? null,
              unpublished: result.actions,
              alreadyApplied: result.alreadyApplied,
              skippedGroups: result.skippedGroups,
              backupPath: result.backupPath,
            },
            null,
            2,
          ),
        )
        return
      }

      console.log(`CMS dedupe apply — ${displayTarget(connectionString)}`)
      if (result.actions.length > 0) {
        console.log(`Unpublished ${result.actions.length} safe duplicate record(s):`)
        for (const action of result.actions) {
          console.log(
            `  #${action.id} "${action.title}" (${action.collection} / ${action.slug})`,
          )
        }
      } else if (result.alreadyApplied.length > 0) {
        console.log(`Already applied for ${result.alreadyApplied.length} record(s); no changes made.`)
      } else {
        console.log('No safe duplicate records to unpublish.')
      }
      if (result.alreadyApplied.length > 0 && result.actions.length > 0) {
        console.log(`Already unpublish(ed): ${result.alreadyApplied.length} record(s).`)
      }
      if (result.backupPath) console.log(`Backup: ${result.backupPath}`)
      if (options.noBackup && result.actions.length > 0) {
        console.log('Warning: --no-backup was used; no restore file was written.')
      }
      if (result.skippedGroups.length > 0) {
        console.log(`\nSkipped ${result.skippedGroups.length} group(s) needing review:`)
        for (const group of result.skippedGroups) {
          console.log(
            `  ! [${group.recommendation}] ${group.collection} / ${group.value} (keep #${group.canonical.id} "${group.canonical.title}")`,
          )
        }
        console.log('Resolve these groups manually, then rerun the plan.')
      } else if (result.actions.length === 0 && result.alreadyApplied.length === 0) {
        console.log('No duplicate published records found.')
      }
      console.log('Run pnpm cms:check after resolving any remaining groups.')
      return
    }

    if (options.dedupePlan) {
      const plan = {
        database: displayTarget(connectionString),
        ...buildDedupePlan(rows),
      }
      const planPath = options.output ? await writePlan(plan) : null

      if (options.json) {
        console.log(JSON.stringify({ mode: 'dedupe-plan', ...plan }, null, 2))
        return
      }

      console.log(`CMS duplicate plan — ${displayTarget(connectionString)}`)
      if (plan.groups.length === 0) {
        console.log('No duplicate published records found.')
      } else {
        console.log(
          `${plan.totals.groups} duplicate group(s), ${plan.totals.duplicateRecords} duplicate record(s).`,
        )
        for (const group of plan.groups) {
          const matchLabel = group.match === 'key' ? 'key' : group.match
          console.log(`\n[${matchLabel}] ${group.collection} / ${group.value}`)
          console.log(
            `  keep #${group.canonical.id} "${group.canonical.title}" (${group.canonical.slug}, ${group.canonical.filledFields} fields)`,
          )
          for (const duplicate of group.duplicates) {
            const notes = []
            if (duplicate.uniqueFields.length > 0) {
              notes.push(`unique: ${duplicate.uniqueFields.join(', ')}`)
            }
            if (duplicate.conflictingFields.length > 0) {
              notes.push(`conflicts: ${duplicate.conflictingFields.join(', ')}`)
            }
            console.log(
              `  ${group.actions.some((action) => action.id === duplicate.id) ? 'unpublish' : 'review'} #${duplicate.id} "${duplicate.title}" (${duplicate.slug}, ${duplicate.filledFields} fields)${notes.length ? ` — ${notes.join('; ')}` : ''}`,
            )
          }
          if (group.recommendation === 'review-merge') {
            console.log('  Recommendation: move the unique fields into the kept record first; do not unpublish yet.')
          } else if (group.recommendation === 'review-possible-duplicate') {
            console.log('  Recommendation: titles match but slugs differ; review whether these are the same item.')
          } else {
            console.log('  Recommendation: the duplicate adds no unique content; safe to unpublish.')
          }
        }
        console.log(
          `\n${plan.totals.safeUnpublishes} safe unpublish action(s), ${plan.totals.groupsNeedingReview} group(s) needing review.`,
        )
      }
      if (planPath) console.log(`Plan written to: ${planPath}`)
      console.log('No changes made; this command is read-only.')
      return
    }

    const plans = []
    const conflicts = []
    const unkeyable = []
    const claimed = new Set()

    for (const seed of seedRecords) {
      const collectionRows = rowsByCollection.get(seed.collection) ?? []
      const candidates = collectionRows.filter((row) => keyFromRow(row) === seed.key)
      for (const candidate of candidates) claimed.add(candidate.id)

      if (candidates.length === 0) {
        const slugConflict = collectionRows.find(
          (row) => clean(row.slug).toLowerCase() === clean(seed.slug).toLowerCase(),
        )
        if (slugConflict) {
          conflicts.push({
            collection: seed.collection,
            key: seed.key,
            slug: seed.slug,
            reason: `slug is already used by "${slugConflict.title}" with key "${keyFromRow(slugConflict) || '(none)'}"`,
          })
          continue
        }

        plans.push({
          type: 'insert',
          collection: seed.collection,
          title: seed.title,
          slug: seed.slug,
          status: seed.status,
          sortOrder: seed.sortOrder,
          key: seed.key,
          payload: seed.payload,
          fieldFills: Object.keys(seed.payload),
          keyBackfilled: true,
        })
        continue
      }

      const canonical = chooseCanonical(candidates)
      const current = canonical.payload
      const normalized = normalizePayload(canonical, current)
      const merged = mergeMissing(normalized, seed.payload)
      const next = { ...merged.payload }
      if (!normalizeKey(next.key)) next.key = seed.key

      if (!samePayload(current, next)) {
        plans.push({
          type: 'update',
          id: canonical.id,
          collection: canonical.collection,
          title: canonical.title,
          slug: canonical.slug,
          key: seed.key,
          before: current,
          after: next,
          fieldFills: merged.filled,
          keyBackfilled: !normalizeKey(current.key),
        })
      }
    }

    // Fix keys and legacy field names on keyed records that have no seed.
    for (const row of rows) {
      if (!KEYED_COLLECTIONS.has(row.collection) || claimed.has(row.id)) continue

      const derivedKey = keyFromRow(row)
      if (!derivedKey) {
        unkeyable.push({
          id: row.id,
          collection: row.collection,
          title: row.title,
          reason: 'record has no payload.key, slug or title to derive one from',
        })
        continue
      }

      const normalized = normalizePayload(row, row.payload)
      const next = { ...normalized }
      if (!normalizeKey(next.key)) next.key = derivedKey

      if (!samePayload(row.payload, next)) {
        plans.push({
          type: 'update',
          id: row.id,
          collection: row.collection,
          title: row.title,
          slug: row.slug,
          key: derivedKey,
          before: row.payload,
          after: next,
          fieldFills: [],
          keyBackfilled: !normalizeKey(row.payload.key),
        })
      }
    }

    // Duplicate keys are not safe to rewrite automatically: the repair cannot
    // know which record the editor intended. Report them and let a human decide.
    const duplicateGroups = new Map()
    for (const row of rows) {
      if (!KEYED_COLLECTIONS.has(row.collection)) continue
      const key = keyFromRow(row)
      if (!key) continue
      const groupKey = `${row.collection}\u0000${key}`
      if (!duplicateGroups.has(groupKey)) duplicateGroups.set(groupKey, [])
      duplicateGroups.get(groupKey).push(row)
    }
    const duplicates = [...duplicateGroups.values()]
      .filter((group) => group.length > 1)
      .map((group) => ({
        collection: group[0].collection,
        key: keyFromRow(group[0]),
        titles: group.map((row) => row.title),
      }))

    const unsafe = duplicates.length > 0 || conflicts.length > 0 || unkeyable.length > 0
    if (options.apply && unsafe && !options.allowPartial) {
      throw new Error(
        `Refusing --apply: ${duplicates.length} duplicate key group(s), ${conflicts.length} slug conflict(s) and ${unkeyable.length} unkeyable record(s). Resolve them, or pass --allow-partial to write only the safe repairs. No rows were written.`,
      )
    }

    const inserts = plans.filter((plan) => plan.type === 'insert').length
    const updates = plans.length - inserts
    const keyBackfills = plans.filter((plan) => plan.keyBackfilled).length
    const fieldFills = plans.reduce((total, plan) => total + plan.fieldFills.length, 0)

    let backupPath = null
    if (options.apply && plans.length > 0) {
      if (!options.noBackup) {
        backupPath = await writeBackup(rows, plans, connectionString)
      }
      await client.query('begin')
      try {
        await client.query("set local lock_timeout = '15s'")
        await client.query('lock table "cmsContent" in share row exclusive mode')

        for (const plan of plans) {
          if (plan.type === 'update') {
            const current = await client.query(
              `select "payload" from "cmsContent" where "id" = $1 for update`,
              [plan.id],
            )
            if (!current.rowCount) throw new Error(`Record ${plan.id} disappeared during repair.`)
            if (!samePayload(current.rows[0].payload, plan.before)) {
              throw new Error(
                `Record ${plan.id} (${plan.collection} / ${plan.title}) changed after planning. No rows were written.`,
              )
            }

            await client.query(`update "cmsContent" set "payload" = $1::jsonb where "id" = $2`, [
              JSON.stringify(plan.after),
              plan.id,
            ])

            const written = await client.query(
              `select "payload" from "cmsContent" where "id" = $1`,
              [plan.id],
            )
            if (!written.rowCount || !samePayload(written.rows[0].payload, plan.after)) {
              throw new Error(`Verification failed for record ${plan.id}. No rows were written.`)
            }
          } else {
            const existing = await client.query(
              `select "id" from "cmsContent" where "collection" = $1 and "slug" = $2 limit 1`,
              [plan.collection, plan.slug],
            )
            if (existing.rowCount) {
              throw new Error(
                `Record "${plan.slug}" in ${plan.collection} was created after planning. No rows were written.`,
              )
            }

            const inserted = await client.query(
              `insert into "cmsContent" ("userId", "collection", "title", "slug", "payload", "status", "sortOrder")
               values ($1, $2, $3, $4, $5::jsonb, $6, $7)
               returning "id"`,
              [
                userId,
                plan.collection,
                plan.title,
                plan.slug,
                JSON.stringify(plan.payload),
                plan.status,
                plan.sortOrder,
              ],
            )
            const written = await client.query(
              `select "payload" from "cmsContent" where "id" = $1`,
              [inserted.rows[0].id],
            )
            if (!written.rowCount || !samePayload(written.rows[0].payload, plan.payload)) {
              throw new Error(
                `Verification failed for inserted record "${plan.slug}". No rows were written.`,
              )
            }
          }
        }

        await client.query('commit')
      } catch (error) {
        await client.query('rollback')
        throw error
      }
    }

    const result = {
      mode: options.apply ? 'apply' : 'dry-run',
      database: displayTarget(connectionString),
      inserts,
      updates,
      keyBackfills,
      fieldFills,
      duplicates,
      conflicts,
      unkeyable,
      backupPath,
    }

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    console.log(`CMS repair — ${options.apply ? 'apply' : 'dry run'} — ${result.database}`)
    console.log(
      `${plans.length} planned repair(s): ${inserts} insert(s), ${updates} update(s); ${keyBackfills} key backfill(s), ${fieldFills} blank field(s) filled.`,
    )
    if (backupPath) console.log(`Backup: ${backupPath}`)
    if (options.apply && options.noBackup && plans.length > 0) {
      console.log('Warning: --no-backup was used; no restore file was written.')
    }

    if (duplicates.length > 0) {
      console.log('\nDuplicate keys (resolve before a clean health check):')
      for (const duplicate of duplicates) {
        console.log(
          `  ! ${duplicate.collection} / ${duplicate.key}: ${duplicate.titles.join(' | ')}`,
        )
      }
    }
    if (conflicts.length > 0) {
      console.log('\nSlug conflicts (repair skipped the insert):')
      for (const conflict of conflicts) {
        console.log(`  ! ${conflict.collection} / ${conflict.slug}: ${conflict.reason}`)
      }
    }
    if (unkeyable.length > 0) {
      console.log('\nUnkeyable records (repair skipped the update):')
      for (const record of unkeyable) {
        console.log(`  ! ${record.collection} / "${record.title}": ${record.reason}`)
      }
    }

    if (!options.apply && plans.length > 0) {
      console.log('\nRun again with --apply to write these repairs.')
    }
    if (plans.length === 0 && !unsafe) console.log('No safe repairs needed.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
