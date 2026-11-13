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
 *   DATABASE_URL=... npm run cms:check -- --duplicates-only
 *
 * Exit codes: 0 healthy (or warnings only), 1 invalid/missing required content,
 * 2 could not read the database.
 */
import { Client } from 'pg'
import { loadCmsSchema } from './load-cms-schema.mjs'

const strict = process.argv.includes('--strict')
const duplicatesOnly = process.argv.includes('--duplicates-only')

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

const STOCK_IMAGE_HOSTS = [
  'images.unsplash.com',
  'unsplash.com',
  'source.unsplash.com',
  'images.pexels.com',
  'pexels.com',
  'cdn.pixabay.com',
  'pixabay.com',
  'picsum.photos',
  'placehold.co',
  'via.placeholder.com',
  'placeholder.com',
  'loremflickr.com',
]

const IMAGE_FIELDS = new Set(['imageUrl', 'coverUrl', 'posterUrl', 'avatarUrl', 'ogImage', 'image'])

const REPOSITORY_HOSTS = new Set([
  'github.com',
  'www.github.com',
  'gitlab.com',
  'www.gitlab.com',
  'bitbucket.org',
  'www.bitbucket.org',
  'codeberg.org',
  'www.codeberg.org',
])

function hostOf(value) {
  if (!hasText(value)) return undefined
  try {
    return new URL(value.trim()).hostname.toLowerCase()
  } catch {
    return undefined
  }
}

function isStockImage(value) {
  const host = hostOf(value)
  if (!host) return false
  return STOCK_IMAGE_HOSTS.some((stockHost) => host === stockHost || host.endsWith(`.${stockHost}`))
}

function isRepositoryUrl(value) {
  if (!hasText(value)) return false
  try {
    const url = new URL(value.trim())
    if (!REPOSITORY_HOSTS.has(url.hostname.toLowerCase())) return false
    return url.pathname.split('/').filter(Boolean).length >= 2
  } catch {
    return false
  }
}

function collectImageFields(value, path, found) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectImageFields(entry, `${path}[${index}]`, found))
    return
  }
  for (const [key, entry] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key
    if (IMAGE_FIELDS.has(key) && typeof entry === 'string') found.push({ path: nextPath, url: entry })
    else collectImageFields(entry, nextPath, found)
  }
}

async function main() {
  const { CMS_SCHEMA, SECTIONS, NAV_ROUTES } = await loadCmsSchema()
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

  if (duplicatesOnly) {
    const duplicates = []
    for (const [, definition] of Object.entries(CMS_SCHEMA.collections)) {
      if (!definition.keyed) continue
      const byKey = new Map()
      for (const record of byCollection(definition.name)) {
        const payload = record.payload && typeof record.payload === 'object' ? record.payload : {}
        const key = typeof payload.key === 'string' ? payload.key.trim().toLowerCase() : ''
        if (!key) continue
        if (byKey.has(key)) {
          duplicates.push(
            `${definition.name}: duplicate key "${key}" ("${byKey.get(key).title}" and "${record.title}").`,
          )
          continue
        }
        byKey.set(key, record)
      }
    }

    console.log(`CMS duplicate key check — ${displayTarget(connectionString)}\n`)
    if (duplicates.length === 0) {
      console.log('✓ No duplicate published CMS keys found.')
      process.exit(0)
    }
    for (const duplicate of duplicates) console.log(`  ✗ ${duplicate}`)
    console.log(
      `\n${duplicates.length} duplicate published key${duplicates.length === 1 ? '' : 's'} found.`,
    )
    process.exit(1)
  }

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
          addWarning(
            `Navigation ${group}[${index}] has no label; its route label still comes from code.`,
          )
        }
        if (!hasText(link?.href)) {
          addProblem(`Navigation ${group}[${index}] has no href and is dropped from the site.`)
        } else if (!NAV_ROUTES.has(link.href.trim())) {
          addProblem(
            `Navigation ${group}[${index}] points at "${link.href}", which is not a route the site owns.`,
          )
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

    if (hasText(record.payload?.github) && !isRepositoryUrl(record.payload.github)) {
      addWarning(
        `Projects "${record.title}" links to "${record.payload.github}", which is a profile or invalid URL rather than a repository; the Code button is hidden.`,
      )
    }

    if (hasText(record.payload?.imageUrl) && !hasText(record.payload?.altText)) {
      addWarning(`Projects "${record.title}" has an image but no altText.`)
    }
  }

  const gallery = byCollection(CMS_SCHEMA.collections.gallery.name)
  for (const record of gallery) {
    if (hasText(record.payload?.imageUrl) && !hasText(record.payload?.altText)) {
      addWarning(`Gallery "${record.title}" has an image but no altText.`)
    }
  }

  // --- Images that are stock photography, not the owner's work --------------
  for (const record of published) {
    const found = []
    collectImageFields(record.payload, '', found)
    for (const image of found) {
      if (isStockImage(image.url)) {
        addWarning(
          `${record.collection} "${record.title}" ${image.path ? `(${image.path}) ` : ''}uses a stock image host (${hostOf(image.url)}) and is presented as personal work.`,
        )
      }
    }
  }

  const homepage = settingsByKey.get(
    CMS_SCHEMA.collections.siteSettings.records.homepageSections.key,
  )
  if (homepage) {
    const order = Array.isArray(homepage.payload?.order) ? homepage.payload.order : []
    const sectionIds = SECTIONS.map((section) => section.id)
    const knownSections = new Set(sectionIds)
    for (const section of order) {
      if (!knownSections.has(section)) {
        addWarning(`Homepage order contains "${section}", which no longer renders.`)
      }
    }
    if (order.length && order.join(',') !== sectionIds.join(',')) {
      addWarning(
        'Homepage section order is owned by the code SECTIONS registry; the CMS order is ignored.',
      )
    }
    const hidden = Object.entries(homepage.payload?.enabled ?? {})
      .filter(([, enabled]) => enabled === false)
      .map(([id]) => id)
    if (hidden.length) {
      addWarning(
        `Homepage visibility flags are ignored (${hidden.join(', ')}); every section in the code registry renders.`,
      )
    }
  }

  // --- Required sections have a renderer ------------------------------------
  for (const section of SECTIONS) {
    if (!section.component || !section.collection) {
      addProblem(`Homepage section "${section.id}" is missing its renderer or collection.`)
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
