# lamirkohsa.dev

Personal portfolio and content studio for [ashokrimal.com.np](https://ashokrimal.com.np).

The site is a Next.js App Router application. Every public value comes from a
Postgres-backed CMS; the shape of the site (pages, sections, routes and empty
states) is code. If a CMS value is missing, the page shows a deliberate empty
state, never placeholder copy such as "N/A" or "Untitled".

## Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS with design tokens in `src/app/globals.css`
- **Database:** PostgreSQL (Neon/Vercel Postgres) through Drizzle ORM
- **Auth:** Better Auth for the owner account, plus the first-owner bootstrap
- **Cache:** Next.js tagged cache (`src/lib/cms-cache.ts`), invalidated per
  collection after every admin mutation
- **Hosting:** Vercel
- **Media/uploads:** Vercel Blob, plus optional Spotify, Last.fm, ListenBrainz,
  MyAnimeList, AniList, GitHub, Google Drive and Resend integrations

## Local setup

Requirements: Node.js `>=20.18.1`, pnpm, and PostgreSQL. `pnpm-lock.yaml` is the
only committed lockfile.

```bash
git clone https://github.com/ashokrimal/lamirkohsa.dev.git
cd lamirkohsa.dev

pnpm install --frozen-lockfile

cp .env.example .env.local
# Fill in DATABASE_URL and BETTER_AUTH_SECRET at minimum.

pnpm dev
```

Open <http://localhost:3000>. The owner studio is at `/admin`.

## Environment variables

`.env.example` is the authoritative list. The important ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Also accepts the `POSTGRES_URL*` and `DATABASE_URL_UNPOOLED` names supplied by Neon/Vercel. |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth sessions. |
| `BETTER_AUTH_URL` | Public origin, e.g. `http://localhost:3000`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Optional one-time bootstrap for the first owner login. Once the database owner exists, it wins. |
| `RESEND_API_KEY`, `RESEND_EMAIL_DOMAIN`, `CONTACT_TO_EMAIL` | Contact-form email delivery. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads from the studio. Without it the studio keeps the paste-a-URL flow. |
| `SPOTIFY_*`, `LASTFM_API_KEY` | Music integrations. |
| `GITHUB_TOKEN`, `GOOGLE_*` | Optional GitHub and Google Drive imports. |
| `GEMINI_API_KEY` | Only if the Gemini integration is enabled. |

Secrets belong in environment variables or the host's secret store, never in the
CMS, source files, or client components.

## First owner and admin studio

1. Deploy or run locally with `DATABASE_URL` set.
2. Open `/admin/sign-in`. While no owner exists, the page offers a one-time
   **Create the owner account** form.
3. The password is stored as a salted scrypt hash in `adminCredential`.
4. Signed-out visits to `/admin` and `/admin/account` redirect to
   `/admin/sign-in`; there is no shared demo account.
5. Change the password from `/admin/account`.

`/admin?section=setup` lists every CMS area the site reads, grouped by page, with
links to its editor.

## CMS structure and empty states

`src/lib/cms-schema.ts` is the single contract. It defines:

- every collection and its human label,
- the locked `payload.key` for keyed collections (`Site Settings`, `Page Copy`,
  `Media Collections`),
- required and optional fields per record,
- the `SECTIONS` registry: the homepage's fixed section order, route, renderer,
  collection and empty state (plus `ABOUT_SECTIONS` for the about page),
- the `NAV_PAGES` registry of every route the site owns,
- the exact empty-state message, hint and admin action for that section.

Structure is code; the CMS supplies values. Section numbers (`01`, `02`, …) and
counts such as the hero's project/discipline totals and "N Execution Phases" are
derived from the registry and published records, never typed into the CMS. The
CMS `Homepage Sections` record only carries section copy; its `order` and
`enabled` values are ignored. Navigation labels and routes come from `NAV_PAGES`;
the CMS navigation record decides which of those routes appear in each group.

Interface strings (labels, buttons, aria labels, system messages) live in
`src/lib/ui-strings.ts` with English and Korean variants. Per-page SEO comes from
the Page Copy record: `seoTitle`, `seoDescription` and `ogImage` fall back to the
page title and description.

The public getters return:

```ts
type CmsResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string }
```

- `ok` renders the values.
- `empty` renders the shared `EmptyState` from the schema.
- `error` renders the quiet `CmsErrorState`; failures are never shown as empty.

Missing optional fields are hidden. Missing required fields are reported by the
health check. Record titles are display-only: lookups use `payload.key`, so
renaming a record never breaks a section.

### Seeding and migrating content

The site starts with no bundled content. Seed a fresh database after the owner
account exists:

```bash
DATABASE_URL=postgres://... node scripts/migrate-site-content.mjs
```

The script is idempotent. It inserts missing records, backfills `payload.key` on
keyed records, migrates the legacy `timezone → timeZone`, `image → imageUrl` and
`challenge → description` field names, and renames the old `films` media key to
`movies`. Existing content is never overwritten or deleted.

For a database with existing but incomplete keyed records, use the repair
command first. It is a dry run by default, fills only blank fields from the seed
defaults, backfills missing keys, and reports duplicates, slug conflicts and
unkeyable records without deleting anything:

```bash
DATABASE_URL=postgres://... pnpm cms:repair                 # dry run
DATABASE_URL=postgres://... pnpm cms:repair -- --apply      # write
```

`--apply` writes `backups/cms-repair-<timestamp>.json` before the transaction,
locks `cmsContent`, aborts if a record changed after planning, and verifies every
write. It refuses to write while duplicate keys, slug conflicts or unkeyable
records remain; use `--allow-partial` only to write the safe repairs around
those. Use `--backup <path>` to choose the backup file or `--no-backup` to skip
it. Run `pnpm cms:check` after applying; the repair does not invent content for
non-keyed records or resolve editorial duplicates.

Before repairing a database with duplicate published records, generate a
read-only dedupe plan:

```bash
DATABASE_URL=postgres://... pnpm cms:dedupe
DATABASE_URL=postgres://... pnpm cms:dedupe -- --json
DATABASE_URL=postgres://... pnpm cms:dedupe -- --output backups/dedupe-plan.json
```

The plan groups published records by key, slug, and matching non-keyed titles.
It keeps the richest record, shows blank fields and conflicting values on the
others, and marks each group as safe to unpublish or needing a merge review.
It never writes to the database. Resolve the listed records in the CMS, then
rerun `pnpm cms:repair`.

To apply only the safe actions, save and review the plan first, then run:

```bash
DATABASE_URL=postgres://... pnpm cms:dedupe -- --output backups/dedupe-plan.json
DATABASE_URL=postgres://... pnpm cms:dedupe:apply -- --plan backups/dedupe-plan.json
```

`--apply-dedupe` refuses if a reviewed record changed, if a new safe duplicate
appeared after the plan was saved, or if a record is both a kept record and a
duplicate. It backs up the CMS rows, locks `cmsContent`, checks every selected
record before writing, and verifies that duplicate statuses became `draft` and
kept records stayed `published`. Groups needing a merge review are skipped and
reported. Use `--backup <path>` to choose the backup
file or `--no-backup` to skip it. Without `--plan`, it applies the safe actions
from a fresh plan.

To undo an apply, restore the records listed in its backup:

```bash
DATABASE_URL=postgres://... pnpm cms:dedupe:restore -- backups/cms-dedupe-<timestamp>.json
```

The backup must have been written by `cms:dedupe:apply`. Restore republishes
only the records that command unpublished; records already published are
skipped. It refuses if the backup belongs to another database or a record's
collection, title or slug changed. It locks `cmsContent`, verifies the draft
records before changing them, and verifies every record is published before
committing. It does not overwrite payloads or delete records.

### Backfilling the legacy media tables

The old `galleryItem`, `portfolioProject`, `musicTrack` and `animeMangaItem`
tables are no longer read or written by the application. Copy their rows into
the CMS before retiring them:

```bash
DATABASE_URL=postgres://... pnpm cms:backfill                 # dry run
DATABASE_URL=postgres://... pnpm cms:backfill -- --apply      # write
```

Run the backfill before deploying a build that removes the legacy fallbacks.
The backfill is idempotent: it matches rows by a hidden legacy id, fills only
blank CMS fields, and preserves existing titles, slugs, statuses and values.
Anime/manga rows are migrated as drafts because the legacy table had no
`published` flag; add `--publish-catalogs` to publish them. Use `--owner <id>`
when the database has more than one CMS owner. The report lists every mapped
field, every skipped field and why, and every row that was inserted, updated,
unchanged or skipped.

`--apply` writes a JSON backup to `backups/legacy-media-backfill-<timestamp>.json`
before touching the database, locks the CMS table for the transaction, and
aborts if a record changed after planning or fails post-write verification. It
also refuses to write when a legacy table is missing, a row would be skipped, or
a required CMS field would be empty. Review the dry run and use
`--allow-partial` only when that partial result is intended. Untagged CMS records
that share a slug are skipped; add `--adopt-existing` to merge one after
checking that it is the same item. Use `--backup <path>` to choose a different
backup file or `--no-backup` to skip it.

To reset all editorial content while keeping the CMS and auth tables intact:

```bash
DATABASE_URL=postgres://... node scripts/reset-content.mjs          # dry run
DATABASE_URL=postgres://... node scripts/reset-content.mjs --apply
```

### Content health check

```bash
DATABASE_URL=postgres://... pnpm cms:check
DATABASE_URL=postgres://... pnpm cms:check -- --strict
```

The check imports `CMS_SCHEMA`, `SECTIONS` and `NAV_PAGES` and validates the
published CMS against them. It fails with exit code `1` for missing required
records, missing required fields (including a project image), duplicate or
missing keys, invalid field types, navigation links without an href or pointing
at a route the site does not own, media collections without an href, and project
phases without a name. A database connection/read failure exits `2`. Warnings
(empty optional collections, unknown keys, draft-only collections, images without
alt text, profile URLs used as project source links, and images hosted on known
stock-photo services such as Unsplash, Pexels, Pixabay or placeholder hosts) fail
only with `--strict`.

`pnpm cms:check:duplicates` is the deployment gate for duplicate published
keys. It checks only keyed records and exits `1` with the conflicting records
when two published records share a key. `pnpm build` runs this gate first and
exits nonzero before `next build` if duplicates are found. It then runs the full
health check when `DATABASE_URL` is configured; that report is advisory for
other content issues. Local builds without a database skip both checks with a
warning.

`.github/workflows/cms-duplicates.yml` runs the same duplicate gate for pushes
to `main`, same-repository pull requests, and manual runs. Add `DATABASE_URL` as
a repository Actions secret for the workflow. Fork pull requests skip the job
because repository secrets are not available to them.

## Adding a new collection

1. Add the collection name to `CMS_COLLECTIONS` and a definition to
   `CMS_SCHEMA.collections` in `src/lib/cms-schema.ts` (fields, required fields,
   empty state, and whether it is keyed).
2. If a public page reads it, add the section definition to `SECTIONS` (or
   `ABOUT_SECTIONS`) so it keeps a fixed position, number and empty state.
3. Add a result-aware getter that calls `getPublishedCmsContentResult` and
   returns `CmsResult`.
4. Render the three states: data, `EmptyState`, and `CmsErrorState`.
5. Add the route to `NAV_PAGES` if the section should be reachable and can be
   toggled into the navigation.
6. Add the collection to the admin studio's creatable collections and, if it is
   keyed, to the keyed collection list.
7. Add seed records or a migration for existing deployments.
8. Run `pnpm cms:check` and `pnpm build`.

## Migrating existing content

The seed script only normalises legacy field names. The owner still needs to add
the following in the CMS after deploying:

- `Site Settings → Brand → role` (used in the default metadata title).
- `Site Settings → Contact Details → responseTime` and `formEnabled` (the form
  shows by default; set `formEnabled` to false to hide it).
- `Page Copy → seoTitle / seoDescription / ogImage` for each page.
- A project image (`imageUrl`) on every published project, and alt text on
  project and gallery images.
- A repository URL (not a profile URL) for project `github` fields.
- Replace stock-image URLs with your own uploads; the health check warns about
  the known stock hosts but never invents replacement images.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js on `0.0.0.0:3000`. |
| `pnpm build` | Production build; runs the CMS prebuild check when configured. |
| `pnpm start` | Start the production server on `0.0.0.0:3000`. |
| `pnpm lint` | ESLint. |
| `pnpm cms:check` | Validate published CMS content against the schema. |
| `pnpm cms:check:duplicates` | Fail on duplicate published keys in keyed collections. |
| `pnpm cms:repair` | Dry-run repair for missing keys and blank seeded fields. |
| `pnpm cms:dedupe` | Read-only plan for duplicate published CMS records. |
| `pnpm cms:dedupe:apply` | Unpublish safe duplicate records with a backup and verification. |
| `pnpm cms:dedupe:restore` | Republish records recorded in a cms-dedupe backup. |
