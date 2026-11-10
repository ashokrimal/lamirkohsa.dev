/**
 * CMS content health check.
 *
 * Reports which CMS records the site needs but cannot currently render, so a
 * blank header, footer, hero or page section is obvious before anyone visits
 * the site.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/check-site-content.mjs
 *   DATABASE_URL=... npm run cms:check -- --strict   (warnings also fail)
 *
 * Exit codes: 0 healthy (or warnings only), 1 missing content,
 * 2 could not read the database.
 */
import { Client } from 'pg'

// Site Settings records looked up by title (see src/lib/site-content.ts).
const requiredSettings = [
  'Navigation',
  'Footer',
  'Brand',
  'Contact Details',
  'Hero Section',
  'Homepage Sections',
]

// Page copy keys read by the public pages.
const requiredPageCopy = [
  'about',
  'projects',
  'project-case-study',
  'media',
  'media-music',
  'media-anime',
  'media-manga',
  'media-github',
  'media-films',
  'journal',
  'gallery',
  'contact',
  'experience',
  'education',
  'skills',
  'certificates',
  'resume',
]

// Media library sections rendered from Media Collections records.
const requiredMediaCollections = ['music', 'anime', 'manga', 'films']

// Collections shown somewhere on the site. Reported when empty, not fatal.
const contentCollections = [
  'Profile',
  'Projects',
  'Experience',
  'Education',
  'Skills',
  'Certificates',
  'Gallery',
  'Blogs',
  'Music',
  'Movies',
  'Anime',
  'Manga',
]

const strict = process.argv.includes('--strict')

function displayTarget(connectionString) {
  try {
    const url = new URL(connectionString)
    return `${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`
  } catch {
    return 'database'
  }
}

function keyOf(record) {
  const payloadKey = record.payload && typeof record.payload === 'object' ? record.payload.key : undefined
  const raw = typeof payloadKey === 'string' && payloadKey.trim() ? payloadKey : record.slug || record.title
  return String(raw).trim().toLowerCase()
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

async function main() {
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

  // --- Site Settings -------------------------------------------------------
  const settings = byCollection('Site Settings')
  const settingsByTitle = new Map(settings.map((row) => [row.title.trim().toLowerCase(), row]))
  const missingSettings = requiredSettings.filter((title) => !settingsByTitle.has(title.toLowerCase()))
  if (missingSettings.length) {
    problems.push(`Site Settings records missing: ${missingSettings.join(', ')}`)
    lines.push(`✗ Site Settings     missing ${missingSettings.length}/${requiredSettings.length}: ${missingSettings.join(', ')}`)
  } else {
    lines.push(`✓ Site Settings     ${requiredSettings.length}/${requiredSettings.length} published`)
  }

  const navigation = settingsByTitle.get('navigation')
  if (navigation) {
    const payload = navigation.payload || {}
    if (!Array.isArray(payload.primary) || payload.primary.length === 0) {
      warnings.push('Navigation has no primary links, so the header menu is empty.')
    }
    if (!Array.isArray(payload.collections) || payload.collections.length === 0) {
      warnings.push('Navigation has no collection links, so the footer collections column is empty.')
    }
    if (!Array.isArray(payload.socials) || payload.socials.length === 0) {
      warnings.push('Navigation has no socials, so the footer shows no social icons.')
    }
  }

  const contact = settingsByTitle.get('contact details')
  if (contact) {
    const payload = contact.payload || {}
    if (!hasText(payload.email)) warnings.push('Contact Details has no email, so the copy-email pill is hidden.')
    if (!hasText(payload.location)) warnings.push('Contact Details has no location, so the coordinates card is hidden.')
    if (!hasText(payload.timeZone)) warnings.push('Contact Details has no timeZone, so the local clock is hidden.')
  }

  const hero = settingsByTitle.get('hero section')
  if (hero) {
    const payload = hero.payload || {}
    if (!hasText(payload.heading)) warnings.push('Hero Section has no heading, so the homepage headline is blank.')
  }

  const homepage = settingsByTitle.get('homepage sections')
  if (homepage) {
    const payload = homepage.payload || {}
    const order = Array.isArray(payload.order) ? payload.order : []
    if (order.length === 0) {
      problems.push('Homepage Sections has an empty order, so the homepage shows only the hero.')
      lines.push('✗ Homepage Sections empty order — no sections render below the hero')
    }
    const sectionMeta = payload.sectionMeta && typeof payload.sectionMeta === 'object' ? payload.sectionMeta : {}
    const missingMeta = order.filter((key) => !sectionMeta[key] || !hasText(sectionMeta[key].title))
    if (missingMeta.length) {
      warnings.push(`Homepage sections without a title: ${missingMeta.join(', ')}.`)
    }
  }

  // --- Page Copy -----------------------------------------------------------
  // The case study page takes its heading from the project itself, not from this copy.
  const titleOptional = new Set(['project-case-study'])

  const pageCopy = byCollection('Page Copy')
  const copyByKey = new Map()
  for (const record of pageCopy) {
    const key = keyOf(record)
    copyByKey.set(key, [...(copyByKey.get(key) || []), record])
  }

  const missingCopy = requiredPageCopy.filter((key) => !copyByKey.has(key))
  if (missingCopy.length) {
    problems.push(`Page Copy keys missing: ${missingCopy.join(', ')}`)
    lines.push(`✗ Page Copy        missing ${missingCopy.length}/${requiredPageCopy.length}: ${missingCopy.join(', ')}`)
  } else {
    lines.push(`✓ Page Copy        ${requiredPageCopy.length}/${requiredPageCopy.length} published`)
  }

  for (const key of requiredPageCopy) {
    const records = copyByKey.get(key)
    if (!records) continue
    if (records.length > 1) {
      warnings.push(`Page Copy has ${records.length} published records for "${key}"; the last one wins.`)
    }
    const payload = records[records.length - 1].payload || {}
    if (!titleOptional.has(key) && !hasText(payload.title)) {
      warnings.push(`Page Copy "${key}" has no title, so its page heading is blank.`)
    }
  }

  // --- Media Collections ---------------------------------------------------
  const mediaCollections = byCollection('Media Collections')
  const mediaByKey = new Map()
  for (const record of mediaCollections) {
    const key = keyOf(record)
    mediaByKey.set(key, [...(mediaByKey.get(key) || []), record])
  }

  const missingMedia = requiredMediaCollections.filter((key) => !mediaByKey.has(key))
  if (missingMedia.length) {
    problems.push(`Media Collections missing: ${missingMedia.join(', ')}`)
    lines.push(`✗ Media Collections missing ${missingMedia.length}/${requiredMediaCollections.length}: ${missingMedia.join(', ')}`)
  } else {
    lines.push(`✓ Media Collections ${requiredMediaCollections.length}/${requiredMediaCollections.length} published`)
  }

  for (const key of requiredMediaCollections) {
    const records = mediaByKey.get(key)
    if (!records) continue
    const payload = records[records.length - 1].payload || {}
    if (!hasText(payload.href)) {
      warnings.push(`Media Collections "${key}" has no href, so its card has no destination.`)
    }
    if (!hasText(payload.label)) {
      warnings.push(`Media Collections "${key}" has no label.`)
    }
  }

  // --- Content collections -------------------------------------------------
  const emptyCollections = contentCollections.filter((collection) => byCollection(collection).length === 0)
  if (emptyCollections.length) {
    warnings.push(`No published records in: ${emptyCollections.join(', ')} (those sections render empty).`)
  }

  const draftOnly = contentCollections.filter(
    (collection) =>
      byCollection(collection).length === 0 &&
      rows.some((row) => row.collection === collection && row.status !== 'published'),
  )
  for (const collection of draftOnly) {
    warnings.push(`${collection} has records but none are published, so nothing shows on the site.`)
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
    console.log('\nAll required CMS content is present and published.')
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
