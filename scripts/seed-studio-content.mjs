/**
 * Seeds the studio CMS tables (`pages`, `page_sections`, `projects`,
 * `site_settings`) from what the site currently renders.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/seed-studio-content.mjs
 *
 * The script reads the legacy `cmsContent` collections that hold today's page
 * copy, projects and navigation when they exist, and falls back to the
 * documented fixtures when they do not. It is idempotent: existing pages,
 * sections, projects and settings are never overwritten, so running it again
 * after the owner has edited content in the studio changes nothing.
 */
import fs from 'node:fs'
import { Client } from 'pg'
import ts from 'typescript'
import { createPgClientOptions, resolveDatabaseUrl } from './db-env.mjs'

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

function stringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item && typeof item === 'object') {
          const obj = item
          const label = obj.name ?? obj.label ?? obj.tech ?? obj.technology
          return typeof label === 'string' ? label.trim() : ''
        }
        return ''
      })
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function text(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

const client = new Client(createPgClientOptions(connectionString))
await client.connect()

async function ensureTables() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "pages" (
      "id" serial PRIMARY KEY,
      "slug" text NOT NULL UNIQUE,
      "title" text NOT NULL,
      "meta_description" text,
      "is_published" boolean NOT NULL DEFAULT true,
      "updated_at" timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "page_sections" (
      "id" serial PRIMARY KEY,
      "page_id" integer NOT NULL,
      "section_key" text NOT NULL,
      "sort_order" integer NOT NULL DEFAULT 0,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "content_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "page_sections_page_id_fk" FOREIGN KEY ("page_id")
        REFERENCES "pages" ("id") ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "page_sections_page_idx" ON "page_sections" ("page_id", "sort_order");
    CREATE TABLE IF NOT EXISTS "projects" (
      "id" serial PRIMARY KEY,
      "slug" text NOT NULL UNIQUE,
      "title" text NOT NULL,
      "category" text,
      "summary" text,
      "problem" text,
      "solution" text,
      "tech_stack" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "cover_media_url" text,
      "live_url" text,
      "repo_url" text,
      "featured_order" integer,
      "is_published" boolean NOT NULL DEFAULT true,
      "updated_at" timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "site_settings" (
      "id" integer PRIMARY KEY DEFAULT 1,
      "contact_email" text,
      "availability_status" text,
      "social_links" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "updated_at" timestamptz NOT NULL DEFAULT now()
    );
  `)
}

async function legacyRecords() {
  try {
    const { rows } = await client.query(
      'SELECT collection, title, slug, payload, "sortOrder" FROM "cmsContent" ORDER BY "sortOrder" ASC, id ASC',
    )
    return rows
  } catch (error) {
    if (error.code === '42P01') return [] // cmsContent does not exist in this database
    throw error
  }
}

const { DEFAULT_PAGES, DEFAULT_PAGE_SECTIONS, DEFAULT_SITE_SETTINGS } = await loadFixtures()
const legacy = await legacyRecords()
const byCollection = (name) => legacy.filter((row) => row.collection === name)
const pageCopy = byCollection('Page Copy')
const navigation = byCollection('Site Settings').find((row) => row.payload?.key === 'navigation')
const contactDetails = byCollection('Site Settings').find((row) => row.payload?.key === 'contact-details')
const footer = byCollection('Site Settings').find((row) => row.payload?.key === 'footer')

await client.query('BEGIN')
try {
  await ensureTables()

  let pagesInserted = 0
  for (const page of DEFAULT_PAGES) {
    const copy = pageCopy.find((row) => row.payload?.key === (page.slug === '/' ? '' : page.slug.slice(1)))
    const title = text(copy?.payload?.seoTitle) || text(copy?.payload?.title) || page.title
    const metaDescription =
      text(copy?.payload?.seoDescription) || text(copy?.payload?.description) || page.metaDescription
    const result = await client.query(
      `INSERT INTO "pages" ("slug", "title", "meta_description", "is_published")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("slug") DO NOTHING`,
      [page.slug, title, metaDescription, page.isPublished],
    )
    pagesInserted += result.rowCount ?? 0
  }

  const { rows: pageRows } = await client.query('SELECT "id", "slug" FROM "pages"')
  const pageIdBySlug = new Map(pageRows.map((row) => [row.slug, row.id]))

  let sectionsInserted = 0
  for (const [slug, seeds] of Object.entries(DEFAULT_PAGE_SECTIONS)) {
    const pageId = pageIdBySlug.get(slug)
    if (!pageId || seeds.length === 0) continue
    const { rows: existing } = await client.query(
      'SELECT count(*)::int AS count FROM "page_sections" WHERE "page_id" = $1',
      [pageId],
    )
    if (existing[0].count > 0) continue // the owner may have edited this page already

    for (const seed of seeds) {
      await client.query(
        `INSERT INTO "page_sections" ("page_id", "section_key", "sort_order", "is_enabled", "content_json")
         VALUES ($1, $2, $3, $4, $5)`,
        [pageId, seed.sectionKey, seed.sortOrder, seed.isEnabled, JSON.stringify(seed.content)],
      )
      sectionsInserted += 1
    }
  }

  // Legacy projects → the projects table, keeping featured order and publication.
  const legacyProjects = byCollection('Projects')
  let projectsInserted = 0
  let featuredOrder = 0
  for (const record of legacyProjects) {
    const payload = record.payload ?? {}
    const slug = slugify(record.slug || record.title)
    if (!slug) continue
    const featured = payload.featured === true || payload.featured === 'true'
    const result = await client.query(
      `INSERT INTO "projects"
        ("slug", "title", "category", "summary", "problem", "solution", "tech_stack",
         "cover_media_url", "live_url", "repo_url", "featured_order", "is_published")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT ("slug") DO NOTHING`,
      [
        slug,
        record.title,
        text(payload.category) ?? null,
        text(payload.summary) ?? null,
        text(payload.challenge) ?? null,
        text(payload.solution) ?? null,
        JSON.stringify(
          stringArray(payload.techStack).length
            ? stringArray(payload.techStack)
            : stringArray(payload.tech),
        ),
        text(payload.imageUrl) ?? text(payload.coverUrl) ?? null,
        text(payload.live) ?? text(payload.liveUrl) ?? null,
        text(payload.github) ?? text(payload.repo) ?? null,
        featured ? featuredOrder : null,
        record.status === 'published' || record.status == null,
      ],
      )
    if (featured) featuredOrder += 1
    projectsInserted += result.rowCount ?? 0
  }

  // Site settings: email, availability and footer social links.
  const { rows: existingSettings } = await client.query('SELECT count(*)::int AS count FROM "site_settings"')
  let settingsInserted = 0
  if (existingSettings[0].count === 0) {
    const legacySocials = Array.isArray(navigation?.payload?.socials) ? navigation.payload.socials : []
    const socials = (legacySocials.length ? legacySocials : DEFAULT_SITE_SETTINGS.socialLinks).map(
      (social, index) => ({
        id: slugify(social.id || social.label) || `link-${index + 1}`,
        platform: slugify(social.platform || social.kind || social.label) || 'website',
        label: text(social.label) || 'Link',
        url: text(social.url || social.href) || '#',
        is_visible: social.is_visible !== false,
        sort_order: typeof social.sort_order === 'number' ? social.sort_order : index,
      }),
    )

    await client.query(
      `INSERT INTO "site_settings" ("id", "contact_email", "availability_status", "social_links")
       VALUES (1, $1, $2, $3)`,
      [
        text(contactDetails?.payload?.email) || DEFAULT_SITE_SETTINGS.contactEmail,
        text(footer?.payload?.availabilityText) ||
          text(contactDetails?.payload?.availability) ||
          DEFAULT_SITE_SETTINGS.availabilityStatus,
        JSON.stringify(socials),
      ],
    )
    settingsInserted = 1
  }

  await client.query('COMMIT')
  console.log(`Pages inserted: ${pagesInserted}`)
  console.log(`Homepage sections inserted: ${sectionsInserted}`)
  console.log(`Projects inserted: ${projectsInserted} (from ${legacyProjects.length} legacy records)`)
  console.log(`Site settings inserted: ${settingsInserted}`)
  console.log('Studio seed complete.')
} catch (error) {
  await client.query('ROLLBACK')
  console.error('Studio seed failed:', error.message)
  process.exitCode = 1
} finally {
  await client.end()
}
