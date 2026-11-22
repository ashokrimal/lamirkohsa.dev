/**
 * Adds a unique index over `cmsContent` (userId, collection, slug) so two rows
 * can never share the identity the public getters and the studio use.
 *
 * This is a dry run by default: it reports whether the index exists and which
 * rows block it. `--apply` creates the index, and refuses while duplicate slugs
 * remain. `--build` is the prebuild mode: it applies only for a Vercel
 * production deployment, and it warns instead of failing the build so a data
 * conflict can never take the site down. Previews and local builds never change
 * the schema.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs
 *   DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs --apply
 *   DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs --build
 *   DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs --json
 *
 * Exit codes: 0 healthy, applied or skipped; 1 duplicates block an explicit
 * --apply; 2 could not read or write the database.
 */
import { Client } from 'pg'
import { createPgClientOptions, resolveDatabaseUrl } from './db-env.mjs'

const INDEX_NAME = 'cmsContent_user_collection_slug_key'
const DUPLICATE_LIMIT = 25

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const build = args.has('--build')
const json = args.has('--json')
const help = args.has('--help') || args.has('-h')

if (help) {
  console.log(`Keep cmsContent slugs unique per user and collection.

  DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs           # report only
  DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs --apply   # create the index
  DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs --build   # prebuild mode
  DATABASE_URL=postgres://... node scripts/index-cms-slugs.mjs --json

--apply fails (exit 1) while duplicate (userId, collection, slug) rows remain.
--build applies only when VERCEL_ENV=production, and never fails the build.
`)
  process.exit(0)
}

function displayTarget(connectionString) {
  try {
    const url = new URL(connectionString)
    return `${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`
  } catch {
    return 'database'
  }
}

function report(lines) {
  if (json) return
  for (const line of lines) console.log(line)
}

async function readDuplicates(client) {
  const { rows } = await client.query(
    `select "userId", "collection", "slug", count(*)::int as count,
            array_agg("title" order by "id") as titles
       from "cmsContent"
      group by "userId", "collection", "slug"
     having count(*) > 1
      order by "collection", "slug"`,
  )
  return rows
}

async function indexExists(client) {
  const { rows } = await client.query(
    `select 1 from pg_indexes
      where schemaname = current_schema() and tablename = 'cmsContent' and indexname = $1`,
    [INDEX_NAME],
  )
  return rows.length > 0
}

async function createIndex(client) {
  // A short lock timeout keeps a busy table from stalling the deployment, and
  // the table is small enough that a plain (non-concurrent) build is instant.
  await client.query("set lock_timeout = '5s'")
  await client.query("set statement_timeout = '60s'")
  await client.query(
    `create unique index if not exists "${INDEX_NAME}"
       on "cmsContent" ("userId", "collection", "slug")`,
  )
}

async function main() {
  const connectionString = resolveDatabaseUrl()
  const shouldApply = apply || (build && process.env.VERCEL_ENV === 'production')

  if (!connectionString) {
    report(['[cms:index] No PostgreSQL URL is set; skipping the slug index check.'])
    process.exit(0)
  }

  const client = new Client(createPgClientOptions(connectionString))
  try {
    await client.connect()
  } catch (error) {
    console.error(`[cms:index] Could not connect to ${displayTarget(connectionString)}: ${error.message}`)
    process.exit(2)
  }

  let duplicates
  let exists
  try {
    exists = await indexExists(client)
    duplicates = await readDuplicates(client)
  } catch (error) {
    console.error(`[cms:index] Could not read cmsContent: ${error.message}`)
    await client.end()
    process.exit(2)
  }

  const lines = [`CMS slug index — ${displayTarget(connectionString)}`, '']
  lines.push(
    exists
      ? `✓ Unique index "${INDEX_NAME}" is present.`
      : `! Unique index "${INDEX_NAME}" is missing.`,
  )

  if (duplicates.length) {
    lines.push('', `${duplicates.length} duplicate slug group${duplicates.length === 1 ? '' : 's'} found:`)
    for (const duplicate of duplicates.slice(0, DUPLICATE_LIMIT)) {
      const titles = (duplicate.titles || []).join('", "')
      lines.push(
        `  ✗ ${duplicate.collection} :: ${duplicate.slug} (${duplicate.count} rows: "${titles}")`,
      )
    }
    if (duplicates.length > DUPLICATE_LIMIT) {
      lines.push(`  … ${duplicates.length - DUPLICATE_LIMIT} more`)
    }
    lines.push(
      '',
      'Resolve them first:',
      '  DATABASE_URL=postgres://... pnpm cms:dedupe -- --output backups/dedupe-plan.json',
      '  DATABASE_URL=postgres://... pnpm cms:dedupe:apply -- --plan backups/dedupe-plan.json',
      'Then re-run this command with --apply.',
    )
  }

  if (json) {
    console.log(
      JSON.stringify(
        { target: displayTarget(connectionString), indexExists: exists, duplicates },
        null,
        2,
      ),
    )
  } else {
    report(lines)
  }

  if (!shouldApply || exists) {
    if (build && !exists && !duplicates.length && process.env.VERCEL_ENV !== 'production') {
      report([
        '',
        'Skipping index creation outside a Vercel production build; run with --apply to create it.',
      ])
    }
    await client.end()
    process.exit(0)
  }

  if (duplicates.length) {
    if (build) {
      console.warn(
        '[cms:index] Duplicate slugs remain, so the unique index was not created. The build continues; fix the duplicates and the next production build will add it.',
      )
      await client.end()
      process.exit(0)
    }
    console.error('[cms:index] Refusing to create the unique index while duplicates remain.')
    await client.end()
    process.exit(1)
  }

  try {
    await createIndex(client)
  } catch (error) {
    // A concurrent deployment may have created it between the check and the
    // create; nothing else about the index is recoverable from here.
    if (error.code === '42P07' || error.code === '23505') {
      console.warn(`[cms:index] Index already present (${error.code}); nothing to do.`)
      await client.end()
      process.exit(0)
    }
    console.error(`[cms:index] Could not create the unique index: ${error.message}`)
    await client.end()
    process.exit(2)
  }

  console.log(`[cms:index] Created unique index "${INDEX_NAME}".`)
  await client.end()
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
