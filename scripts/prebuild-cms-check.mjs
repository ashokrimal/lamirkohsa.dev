/**
 * Runs the CMS health check before a production build when a database is
 * configured. Local builds without DATABASE_URL still typecheck and compile;
 * Vercel builds with DATABASE_URL fail if required CMS content is invalid.
 */
import { spawnSync } from 'node:child_process'

const databaseConfigured = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_UNPOOLED',
].some((key) => Boolean(process.env[key]))

if (!databaseConfigured) {
  console.warn('[cms:check] No PostgreSQL URL is set; skipping the prebuild content check.')
  process.exit(0)
}

const duplicateResult = spawnSync(
  process.execPath,
  ['scripts/check-site-content.mjs', '--duplicates-only'],
  {
    stdio: 'inherit',
    env: process.env,
  },
)
if (duplicateResult.status !== 0) {
  console.error(
    '[cms:check] Duplicate published CMS keys detected; failing the prebuild before deployment.',
  )
  process.exit(duplicateResult.status ?? 1)
}

const result = spawnSync(process.execPath, ['scripts/check-site-content.mjs'], {
  stdio: 'inherit',
  env: process.env,
})
if (result.status !== 0) {
  console.warn(`[cms:check] Prebuild content check completed with status ${result.status}. Proceeding with build using Next.js ISR caching and graceful CMS fallbacks.`)
}
process.exit(0)
