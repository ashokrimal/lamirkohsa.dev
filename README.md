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

`pnpm build` runs `scripts/prebuild-cms-check.mjs`. It executes the health
check when `DATABASE_URL` is configured and skips it with a warning for local
builds without a database.

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
