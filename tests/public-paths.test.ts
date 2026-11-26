import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { STATIC_PATHS } from '../src/lib/public-paths'

const APP_DIR = fileURLToPath(new URL('../src/app', import.meta.url))

/** Directories under `src/app` that are not one-segment routes. */
const NOT_A_ROUTE = new Set([
  '[slug]', // the catch-all whose records the proxy checks at runtime
  'actions', // server actions
  'logos', // static assets served from /logos/...
])

test('every top-level route is listed, so the proxy cannot 404 a real page', () => {
  const missing = readdirSync(APP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !NOT_A_ROUTE.has(name))
    .map((name) => `/${name}`)
    .filter((path) => !STATIC_PATHS.has(path))

  assert.deepEqual(
    missing,
    [],
    'add these routes to STATIC_PATHS in src/lib/public-paths.ts, or the proxy will answer them with a 404',
  )
})
