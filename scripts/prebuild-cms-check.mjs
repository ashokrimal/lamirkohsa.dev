/**
 * Runs the CMS health check before a production build when a database is
 * configured. Local builds without a PostgreSQL URL still typecheck and compile;
 * Vercel builds with any Postgres env var (DATABASE_URL, POSTGRES_URL,
 * POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, DATABASE_URL_UNPOOLED) run the
 * check and block only on actual duplicate published CMS keys.
 *
 * It also runs the studio seed verifier. A database whose studio tables exist
 * but whose seeded pages, sections, projects or settings are missing or empty
 * fails the build, so a broken seed cannot ship. A database that has not been
 * seeded yet is only warned about, because the site falls back to fixtures and
 * the tables are created by the seed.
 */
import { spawnSync } from 'node:child_process'
import { resolveDatabaseUrl } from './db-env.mjs'

const connectionString = resolveDatabaseUrl()

if (!connectionString) {
  console.warn('[cms:check] No PostgreSQL URL is set; skipping the prebuild content check.')
  process.exit(0)
}

const childEnv = {
  ...process.env,
  DATABASE_URL: connectionString,
}

// Studio seed gate first: it must run even when the legacy cmsContent check
// cannot (for example a database bootstrapped by the studio seed alone).
const studioVerify = spawnSync(
  process.execPath,
  ['scripts/verify-studio-seed.mjs', '--json'],
  {
    env: childEnv,
    encoding: 'utf8',
  },
)

let studioReport
if (studioVerify.stdout) {
  try {
    studioReport = JSON.parse(studioVerify.stdout)
  } catch {
    studioReport = undefined
  }
}

if (studioVerify.status === 0 && studioReport?.ok) {
  console.log('[studio:verify] Seeded studio content verified.')
} else if (!studioReport) {
  console.warn(
    `[studio:verify] Verification did not produce a report (exit ${studioVerify.status ?? 'unknown'}); database may be unreachable. Proceeding with build using ISR and fallbacks.`,
  )
} else {
  const failures = studioReport.results.filter((entry) => entry.level === 'fail')
  // When the studio tables themselves are absent the dependent page, section
  // and settings failures are consequences of that, not a broken seed.
  const unseeded = failures.some((entry) => entry.code === 'tables.missing')
  if (unseeded) {
    console.warn(
      '[studio:verify] Studio tables are not seeded yet; skipping the seed gate. Run pnpm studio:seed, then redeploy.',
    )
  } else {
    console.error('[studio:verify] Seeded studio content failed verification:')
    for (const failure of failures) {
      console.error(`  - ${failure.message}`)
    }
    console.error(
      '[studio:verify] Failing the prebuild before deployment. Run pnpm studio:seed:preflight, then pnpm studio:seed.',
    )
    process.exit(1)
  }
}

const duplicateResult = spawnSync(
  process.execPath,
  ['scripts/check-site-content.mjs', '--duplicates-only'],
  {
    stdio: 'inherit',
    env: childEnv,
  },
)
if (duplicateResult.status === 1) {
  console.error(
    '[cms:check] Duplicate published CMS keys detected; failing the prebuild before deployment.',
  )
  process.exit(1)
}
if (duplicateResult.status !== 0) {
  console.warn(
    `[cms:check] Duplicate key check skipped (exit ${duplicateResult.status ?? 'unknown'}); database may not be reachable or migrated yet. Proceeding with build using ISR and fallbacks.`,
  )
  process.exit(0)
}

const result = spawnSync(process.execPath, ['scripts/check-site-content.mjs'], {
  stdio: 'inherit',
  env: childEnv,
})
if (result.status !== 0) {
  console.warn(
    `[cms:check] Prebuild content check completed with status ${result.status}. Proceeding with build using Next.js ISR caching and graceful CMS fallbacks.`,
  )
}
process.exit(0)
