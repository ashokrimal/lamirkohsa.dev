/**
 * Rewrites the studio's stored copy from taglines to plain labels.
 *
 * The headings a visitor sees come from Postgres (`page_sections.content_json`
 * and the `Page Copy` rows in `cmsContent`), not from the repository, so editing
 * the defaults alone would not change the live site. This script applies the
 * same wording from `src/lib/plain-copy.ts` to rows that already exist.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/simplify-copy.mjs
 *       Prints every change it would make and writes nothing.
 *   DATABASE_URL=postgres://... node scripts/simplify-copy.mjs --apply
 *       Writes the changes.
 *
 * It only touches eyebrow / title / accent / description, leaves every other
 * field (CTA, animation, preview counts, layout) alone, and skips a row whose
 * copy already matches. Running it twice changes nothing the second time.
 */
import fs from 'node:fs'
import ts from 'typescript'
import { Client } from 'pg'
import { createPgClientOptions, resolveDatabaseUrl } from './db-env.mjs'

const apply = process.argv.includes('--apply')

const connectionString = resolveDatabaseUrl()
if (!connectionString) {
  console.error('No database URL found. Set DATABASE_URL (or POSTGRES_URL) and run again.')
  process.exit(1)
}

async function loadPlainCopy() {
  const source = fs.readFileSync(new URL('../src/lib/plain-copy.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: 'plain-copy.ts',
  })
  const encoded = Buffer.from(outputText, 'utf8').toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}

const COPY_FIELDS = ['eyebrow', 'title', 'accent', 'description']

/** Returns the changed fields only, so unrelated section content survives. */
function pickChanges(current, plain) {
  const next = {}
  for (const field of COPY_FIELDS) {
    const value = plain[field]
    if (value === undefined) continue
    if (current?.[field] === value) continue
    next[field] = value
  }
  return next
}

const { PLAIN_SECTION_COPY, PLAIN_PAGE_COPY } = await loadPlainCopy()
const client = new Client(createPgClientOptions(connectionString))
await client.connect()

try {
  let sectionChanges = 0
  let pageChanges = 0

  const sections = await client.query(
    `select id, page_id, section_key, content_json from page_sections order by page_id, sort_order`,
  )
  for (const row of sections.rows) {
    const plain = PLAIN_SECTION_COPY[row.section_key]
    if (!plain) continue
    const current = row.content_json ?? {}
    const changes = pickChanges(current, plain)
    if (Object.keys(changes).length === 0) continue

    sectionChanges += 1
    console.log(`section ${row.section_key} (page ${row.page_id}): ${Object.keys(changes).join(', ')}`)
    if (apply) {
      await client.query(
        `update page_sections set content_json = content_json || $1::jsonb, updated_at = now() where id = $2`,
        [JSON.stringify(changes), row.id],
      )
    }
  }

  const pages = await client.query(
    `select id, coalesce(payload->>'key', '') as key, payload from "cmsContent"
     where collection = 'Page Copy'`,
  )
  for (const row of pages.rows) {
    const plain = PLAIN_PAGE_COPY[String(row.key).trim().toLowerCase()]
    if (!plain) continue
    const current = row.payload ?? {}
    const changes = pickChanges(current, plain)
    if (Object.keys(changes).length === 0) continue

    pageChanges += 1
    console.log(`page copy ${row.key}: ${Object.keys(changes).join(', ')}`)
    if (apply) {
      await client.query(`update "cmsContent" set payload = payload || $1::jsonb where id = $2`, [
        JSON.stringify(changes),
        row.id,
      ])
    }
  }

  console.log(
    `\n${apply ? 'Updated' : 'Would update'} ${sectionChanges} section row(s) and ${pageChanges} page copy row(s).`,
  )
  if (!apply && sectionChanges + pageChanges > 0) {
    console.log('Re-run with --apply to write these changes.')
  }
} finally {
  await client.end()
}
