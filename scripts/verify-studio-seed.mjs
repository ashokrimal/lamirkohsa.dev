/**
 * Verifies that a database has the studio CMS rows `studio:seed` is supposed to
 * create, by comparing it with the fixtures in `src/lib/studio/fixtures.ts`.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/verify-studio-seed.mjs
 *   DATABASE_URL=postgres://... node scripts/verify-studio-seed.mjs --json
 *
 * Read-only: it never writes, creates or repairs anything.
 *
 * Results have two severities:
 *   fail  the seed's output is missing or unusable (exit code 1)
 *   warn  an intentional owner edit or a legacy difference, reported only
 *
 * Owner edits are expected after seeding. Missing pages, missing seeded
 * sections, empty section content and a missing settings row are failures;
 * reordering, disabling, re-copying or adding sections are warnings.
 */
import fs from 'node:fs'
import { Client } from 'pg'
import ts from 'typescript'
import { createPgClientOptions, resolveDatabaseUrl } from './db-env.mjs'

const jsonOutput = process.argv.includes('--json')
const connectionString = resolveDatabaseUrl()
if (!connectionString) {
  console.error('No database URL found. Set DATABASE_URL (or POSTGRES_URL) and run again.')
  process.exit(1)
}

async function loadFixtures() {
  const source = fs.readFileSync(new URL('../src/lib/studio/fixtures.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: 'fixtures.ts',
  })
  const encoded = Buffer.from(outputText, 'utf8').toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const results = []
const pass = (code, message) => results.push({ level: 'pass', code, message })
const warn = (code, message) => results.push({ level: 'warn', code, message })
const fail = (code, message) => results.push({ level: 'fail', code, message })

const client = new Client(createPgClientOptions(connectionString))
await client.connect()

let exitCode = 0
try {
  const { DEFAULT_PAGES, DEFAULT_PAGE_SECTIONS, DEFAULT_SITE_SETTINGS } = await loadFixtures()

  const tables = {}
  for (const name of ['pages', 'page_sections', 'projects', 'site_settings', 'cmsContent']) {
    const { rows } = await client.query('SELECT to_regclass($1) AS regclass', [`public."${name}"`])
    tables[name] = Boolean(rows[0].regclass)
  }

  const missingTables = ['pages', 'page_sections', 'projects', 'site_settings'].filter(
    (name) => !tables[name],
  )
  if (missingTables.length > 0) {
    fail('tables.missing', `Missing tables: ${missingTables.join(', ')}. Run pnpm studio:seed first.`)
  } else {
    pass('tables', 'All four studio tables exist.')
  }

  let pageRows = []
  if (tables.pages) {
    const { rows } = await client.query('SELECT "id", "slug" FROM "pages" ORDER BY "slug"')
    pageRows = rows
  }
  const pageBySlug = new Map(pageRows.map((row) => [row.slug, row]))

  for (const page of DEFAULT_PAGES) {
    if (pageBySlug.has(page.slug)) pass('page', `Page ${page.slug} exists.`)
    else fail('page.missing', `Page ${page.slug} is missing.`)
  }
  const fixtureSlugs = new Set(DEFAULT_PAGES.map((page) => page.slug))
  for (const row of pageRows) {
    if (!fixtureSlugs.has(row.slug)) warn('page.extra', `Page ${row.slug} is not in the fixtures.`)
  }

  if (tables.page_sections) {
    const { rows } = await client.query(`
      SELECT p."slug", s."section_key", s."sort_order", s."is_enabled",
             s."content_json" = '{}'::jsonb AS empty_content
      FROM "page_sections" s
      JOIN "pages" p ON p."id" = s."page_id"
      ORDER BY p."slug", s."sort_order"`)
    const bySlug = new Map()
    for (const row of rows) {
      if (!bySlug.has(row.slug)) bySlug.set(row.slug, [])
      bySlug.get(row.slug).push(row)
    }

    for (const [slug, seeds] of Object.entries(DEFAULT_PAGE_SECTIONS)) {
      if (seeds.length === 0) continue
      const actual = bySlug.get(slug) ?? []
      if (actual.length === 0) {
        fail('sections.missing', `Page ${slug} has no sections; expected ${seeds.length}.`)
        continue
      }

      const actualKeys = new Map(actual.map((row) => [row.section_key, row]))
      for (const seed of seeds) {
        const row = actualKeys.get(seed.sectionKey)
        if (!row) {
          fail('section.missing', `Page ${slug} is missing the "${seed.sectionKey}" section.`)
          continue
        }
        if (row.empty_content) {
          fail('section.empty', `Page ${slug} "${seed.sectionKey}" has empty content.`)
        }
        if (row.sort_order !== seed.sortOrder) {
          warn(
            'section.order',
            `Page ${slug} "${seed.sectionKey}" is at ${row.sort_order}, seeded at ${seed.sortOrder}.`,
          )
        }
        if (!row.is_enabled) {
          warn('section.disabled', `Page ${slug} "${seed.sectionKey}" is disabled.`)
        }
        pass('section', `Page ${slug} "${seed.sectionKey}" present.`)
      }

      const extra = actual.filter(
        (row) => !seeds.some((seed) => seed.sectionKey === row.section_key),
      )
      for (const row of extra) {
        warn('section.extra', `Page ${slug} has an extra "${row.section_key}" section.`)
      }
    }
  }

  const legacyProjects = []
  if (tables.cmsContent) {
    try {
      const { rows } = await client.query(
        'SELECT "title", "slug" FROM "cmsContent" WHERE "collection" = $1 ORDER BY "sortOrder" ASC, "id" ASC',
        ['Projects'],
      )
      legacyProjects.push(...rows)
    } catch (error) {
      warn('legacy.unreadable', `Could not read legacy Projects records: ${error.message}`)
    }
  }

  if (tables.projects) {
    const { rows } = await client.query(
      'SELECT "slug", "title", "is_published" FROM "projects" ORDER BY "slug"',
    )
    const actualSlugs = new Set(rows.map((row) => row.slug))
    if (legacyProjects.length === 0 && rows.length === 0) {
      pass('projects', 'No projects seeded and none expected (no legacy project records).')
    }
    if (legacyProjects.length > 0) {
      pass('projects', `${legacyProjects.length} legacy project records found.`)
      for (const record of legacyProjects) {
        const slug = slugify(record.slug || record.title)
        if (!slug) {
          warn('project.unkeyable', `Legacy project "${record.title}" has no usable slug.`)
          continue
        }
        if (actualSlugs.has(slug)) pass('project', `Project ${slug} exists.`)
        else fail('project.missing', `Project ${slug} is missing.`)
      }
    }
    if (rows.length > 0 && rows.every((row) => !row.is_published)) {
      warn('project.unpublished', 'Every project row is unpublished.')
    }
  }

  if (tables.site_settings) {
    const { rows } = await client.query(
      'SELECT "contact_email", "availability_status", jsonb_array_length("social_links") AS socials FROM "site_settings" WHERE "id" = 1',
    )
    if (rows.length === 0) {
      fail('settings.missing', 'The site_settings row is missing.')
    } else {
      const settings = rows[0]
      if (!settings.contact_email) {
        fail('settings.email', 'site_settings.contact_email is empty.')
      } else {
        pass('settings', 'Settings row exists with a contact email.')
      }
      if (!settings.availability_status) {
        warn('settings.availability', 'site_settings.availability_status is empty.')
      }
      if (!settings.socials) {
        warn('settings.socials', 'site_settings.social_links is empty.')
      }
    }
  }

  const counts = results.reduce(
    (acc, result) => ({ ...acc, [result.level]: acc[result.level] + 1 }),
    { pass: 0, warn: 0, fail: 0 },
  )
  exitCode = counts.fail > 0 ? 1 : 0

  if (jsonOutput) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: counts.fail === 0,
          counts,
          results,
          fixtures: {
            pages: DEFAULT_PAGES.length,
            sectionPages: Object.values(DEFAULT_PAGE_SECTIONS).filter((seeds) => seeds.length > 0)
              .length,
            settingsEmail: Boolean(DEFAULT_SITE_SETTINGS.contactEmail),
          },
        },
        null,
        2,
      )}\n`,
    )
  } else {
    const mark = { pass: '✓', warn: '!', fail: '✗' }
    for (const result of results) {
      if (result.level === 'pass' && result.code === 'section') continue
      console.log(`${mark[result.level]} [${result.code}] ${result.message}`)
    }
    console.log(
      `\n${counts.pass} passed, ${counts.warn} warning${counts.warn === 1 ? '' : 's'}, ${counts.fail} failure${counts.fail === 1 ? '' : 's'}.`,
    )
    console.log(
      counts.fail === 0
        ? 'Studio seed verification passed.'
        : 'Studio seed verification failed: re-add the listed rows in Pages & Sections, or run pnpm studio:seed for a page that has no sections at all.',
    )
  }
} catch (error) {
  console.error('Studio seed verification could not run:', error.message)
  exitCode = 1
} finally {
  await client.end()
}

process.exit(exitCode)
