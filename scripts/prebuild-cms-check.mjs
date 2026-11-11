/**
 * Runs the CMS health check before a production build when a database is
 * configured. Local builds without DATABASE_URL still typecheck and compile;
 * Vercel builds with DATABASE_URL fail if required CMS content is invalid.
 */
import { spawnSync } from 'node:child_process'

if (!process.env.DATABASE_URL) {
  console.warn('[cms:check] DATABASE_URL is not set; skipping the prebuild content check.')
  process.exit(0)
}

const result = spawnSync(process.execPath, ['scripts/check-site-content.mjs'], {
  stdio: 'inherit',
  env: process.env,
})
process.exit(result.status ?? 2)
