/**
 * CMS content health check.
 *
 * Validates the published CMS against src/lib/cms-schema.ts, so the check and
 * the public getters can never disagree about collection names, locked keys or
 * required fields. It also reports records that would otherwise be dropped
 * silently by a renderer.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npm run cms:check
 *   DATABASE_URL=... npm run cms:check -- --strict   (warnings also fail)
 *
 * Exit codes: 0 healthy (or warnings only), 1 invalid/missing required content,
 * 2 could not read the database.
 */
import { Client } from 'pg'
import { loadCmsSchema } from './load-cms-schema.mjs'

const strict = process.argv.includes('--strict')

function displayTarget(connectionString) {
  try {
    const url = new URL(connectionString)
    return `${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`
  } catch {
    return 'database'
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return value !== undefined && value !== null
}

function fieldProblem(field, value) {
  if (!hasValue(value)) return `${field.label} is empty`
  switch (field.type) {
    case 'array':
      return Array.isArray(value) ? null : `${field.label} must be a list`
    case 'object':
      return value && typeof value === 'object' && !Array.isArray(value)
        ? null
        : `${field.label} must be an object`
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        ? null
        : `${field.label} must be a number`
    case 'boolean':
      return typeof value === 'boolean' ? null : `${field.label} must be true or false`
    default:
      return typeof value === 'string' ? null : `${field.label} must be text`
  }
}

async function main() {
  const { CMS_SCHEMA } = await loadCmsSchema()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is required.')
    process.exit(2)
  }

  const client = new Client({ connectionString })
  try {
    await client.connect()
  } catch (error) {
    console.error(`Could not connect to ${displayTarget(connectionString)}: ${error.message}`)
    process.exit(2)
  }

  let rows
  try {
    const result = await client.query(
      `select "collection", "title", "slug", "payload", "status" from "cmsContent"`,
    )
    rows = result.rows
  } catch (error) {
    console.error(`Could not read cmsContent: ${error.message}`)
    await client.end()
    process.exit(2)
  }
  await client.end()

  const published = rows.filter((row) => row.status === 'published')
  const byCollection = (collection) => published.filter((row) => row.collection === collection)
  const problems = []
  const warnings = []
  const lines = []
  const addProblem = (message) => problems.push(message)
  const addWarning = (message) => warnings.push(message)

  // --- Keyed collections ----------------------------------------------------
  for (const [schemaKey, definition] of Object.entries(CMS_SCHEMA.collections)) {
    if (!definition.keyed) continue
    const records = byCollection(definition.name)
    const expected = Object.entries(definition.records ?? {})
    const byKey = new Map()

    for (const record of records) {
      const payload = record.payload && typeof record.payload === 'object' ? record.payload : {}
      const key = typeof payload.key === 'string' ? payload.key.trim().toLowerCase() : ''
      if (!key) {
        addProblem(
          `${definition.name}: "${record.title}" has no payload.key, so the site cannot find it.`,
        )
        continue
      }
      if (byKey.has(key)) {
        addProblem(
          `${definition.name}: duplicate key "${key}" ("${byKey.get(key).title}" and "${record.title}").`,
        )
        continue
      }
      byKey.set(key, record)

      const known = expected.some(([, recordDefinition]) => recordDefinition.key === key)
      if (!known) {
        addWarning(`${definition.name}: unknown key "${key}" on "${record.title}" is not used.`)
      }

      const recordDefinition = expected.find(([, entry]) => entry.key === key)?.[1]
      if (!recordDefinition) continue
      for (const field of recordDefinition.requiredFields) {
        const problem = fieldProblem(field, payload[field.key])
        if (problem) addProblem(`${definition.name} "${record.title}": ${problem}.`)
      }
      for (const field of recordDefinition.optionalFields) {
        if (!hasValue(payload[field.key])) continue
        const problem = fieldProblem(field, payload[field.key])
        if (problem) addProblem(`${definition.name} "${record.title}": ${problem}.`)
      }
    }

    for (const [, recordDefinition] of expected) {
      if (recordDefinition.required === false) continue
      if (!byKey.has(recordDefinition.key)) {
        addProblem(
          `${definition.name}: required record "${recordDefinition.label}" (key "${recordDefinition.key}") is missing or unpublished.`,
        )
      }
    }

    const total = expected.length
    const found = expected.filter(([, entry]) => byKey.has(entry.key)).length
    lines.push(
      found === total
        ? `✓ ${definition.label.padEnd(17)} ${found}/${total} keyed records published`
        : `✗ ${definition.label.padEnd(17)} ${found}/${total} keyed records published`,
    )
  }

  // --- Records in content collections --------------------------------------
  for (const [, definition] of Object.entries(CMS_SCHEMA.collections)) {
    if (definition.keyed) continue
    const records = byCollection(definition.name)
    for (const record of records) {
      const payload = record.payload && typeof record.payload === 'object' ? record.payload : {}
      for (const field of definition.requiredFields ?? []) {
        const problem = fieldProblem(field, payload[field.key])
        if (problem) addProblem(`${definition.name} "${record.title}": ${problem}.`)
      }
      for (const field of definition.optionalFields ?? []) {
        if (!hasValue(payload[field.key])) continue
        const problem = fieldProblem(field, payload[field.key])
        if (problem) addProblem(`${definition.name} "${record.title}": ${problem}.`)
      }
    }
    if (records.length === 0) {
      addWarning(`${definition.name} has no published records; its sections show an empty state.`)
    }
  }

  // --- Silent drops reported explicitly ------------------------------------
  const settings = byCollection(CMS_SCHEMA.collections.siteSettings.name)
  const settingsByKey = new Map(
    settings.map((record) => [String(record.payload?.key ?? '').toLowerCase(), record]),
  )
  const navigation = settingsByKey.get(
    CMS_SCHEMA.collections.siteSettings.records.navigation.key,
  )
  if (navigation) {
    for (const group of ['primary', 'footer', 'collections']) {
      const links = Array.isArray(navigation.payload?.[group]) ? navigation.payload[group] : []
      links.forEach((link, index) => {
        if (!hasText(link?.label)) {
          addProblem(`Navigation ${group}[${index}] has no label and is dropped from the site.`)
        }
        if (!hasText(link?.href)) {
          addProblem(`Navigation ${group}[${index}] has no href and is dropped from the site.`)
        }
      })
    }
    const socials = Array.isArray(navigation.payload?.socials) ? navigation.payload.socials : []
    socials.forEach((social, index) => {
      if (!hasText(social?.label)) {
        addProblem(`Navigation socials[${index}] has no label and is dropped from the footer.`)
      }
      if (!hasText(social?.href)) {
        addProblem(`Navigation socials[${index}] has no href and is dropped from the footer.`)
      }
    })
  }

  const mediaCollections = byCollection(CMS_SCHEMA.collections.mediaCollections.name)
  for (const record of mediaCollections) {
    if (!hasText(record.payload?.href)) {
      addProblem(
        `Media Collections "${record.title}" has no href, so its View all card has no destination.`,
      )
    }
    if (!hasText(record.payload?.label)) {
      addProblem(`Media Collections "${record.title}" has no label, so its section title is blank.`)
    }
  }

  const projects = byCollection(CMS_SCHEMA.collections.projects.name)
  for (const record of projects) {
    const phases = Array.isArray(record.payload?.phases) ? record.payload.phases : []
    phases.forEach((phase, index) => {
      if (!hasText(phase?.name)) {
        addProblem(
          `Projects "${record.title}" phase ${index + 1} has no name and is dropped from the case study.`,
        )
      }
    })
  }

  const homepage = settingsByKey.get(
    CMS_SCHEMA.collections.siteSettings.records.homepageSections.key,
  )
  if (homepage) {
    const order = Array.isArray(homepage.payload?.order) ? homepage.payload.order : []
    const knownSections = new Set([
      ...Object.keys(CMS_SCHEMA.sections.home),
      ...Object.keys(CMS_SCHEMA.sections.pages),
    ])
    for (const section of order) {
      if (!knownSections.has(section)) {
        addWarning(`Homepage order contains "${section}", which no longer renders.`)
      }
    }
  }

  const draftOnly = Object.values(CMS_SCHEMA.collections).filter(
    (definition) =>
      byCollection(definition.name).length === 0 &&
      rows.some((row) => row.collection === definition.name && row.status !== 'published'),
  )
  for (const definition of draftOnly) {
    addWarning(`${definition.name} has records but none are published.`)
  }

  // --- Report --------------------------------------------------------------
  console.log(`CMS content health — ${displayTarget(connectionString)}\n`)
  console.log(lines.join('\n'))

  if (warnings.length) {
    console.log('\nWarnings')
    for (const warning of warnings) console.log(`  ! ${warning}`)
  }

  if (problems.length) {
    console.log(`\n${problems.length} blocking problem${problems.length === 1 ? '' : 's'}:`)
    for (const problem of problems) console.log(`  ✗ ${problem}`)
  }

  if (!problems.length && !warnings.length) {
    console.log('\nAll required CMS content is present and valid.')
  }

  const failed = problems.length > 0 || (strict && warnings.length > 0)
  if (failed && warnings.length && !problems.length) {
    console.log('\nWarnings treated as failures because --strict was passed.')
  }

  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
