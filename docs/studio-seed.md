# Studio CMS seed runbook

How to populate the studio CMS tables (`pages`, `page_sections`, `projects`,
`site_settings`) in a production database, what the script does and does not
touch, and how to verify the result.

The script is `scripts/seed-studio-content.mjs`, exposed as `pnpm studio:seed`.
It creates the four tables if they do not exist, then fills them from the legacy
`cmsContent` collections when those exist and from
`src/lib/studio/fixtures.ts` when they do not.

## Before you start

- Node.js `>=20.18.1` and a checkout with `pnpm install --frozen-lockfile`.
- A Postgres connection string for the target database. Production for this
  project is Neon (Vercel Postgres); copy `DATABASE_URL` from
  **Vercel → Project → Settings → Environment Variables → Production**, or from
  the Neon dashboard.
- The script resolves the URL in this order: `DATABASE_URL`, `POSTGRES_URL`,
  `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`,
  `DATABASE_URL_UNPOOLED` (see `scripts/db-env.mjs`). Remote hosts get TLS
  automatically unless the URL already carries `sslmode`.
- Never commit the connection string. Keep it in your shell, in `.env.local`
  (git-ignored), or in the host's secret store.

## 1. Confirm the target and take a backup

```bash
# Which database am I about to write to?
echo "${DATABASE_URL%%\?*}" | sed -E 's#(://[^:]+:)[^@]+@#\1***@#'

# Schema + data backup of everything the seed can write
pg_dump "$DATABASE_URL" \
  --table=pages --table=page_sections --table=projects --table=site_settings \
  --no-owner --file "backups/studio-pre-seed-$(date +%Y%m%d-%H%M%S).sql"
```

The seed never deletes or overwrites rows, so this backup is insurance, not a
routine restore point. `backups/` is git-ignored.

## 2. Preflight the target (no writes)

Every run starts with a preflight report. Run it on its own first:

```bash
DATABASE_URL='postgres://…' pnpm studio:seed:preflight
DATABASE_URL='postgres://…' pnpm studio:seed:preflight -- --json   # machine-readable
```

```text
Studio seed preflight
  Target:       ep-xxx.neon.tech:5432/neondb (TLS on)
  Tables:       pages present, page_sections present, projects present, site_settings present, cmsContent present
  Pages:        /, /about, /contact, /media, /projects
  Sections:     / 4, /about 8, /contact 1, /media 1
  Projects:     2 (2 published)
  Settings:     1 row
  Legacy CMS:   Page Copy 1, Projects 2, Site Settings 3
  Planned inserts:
    pages:      none
    sections:   none
    projects:   none
    settings:   none
Preflight only: no changes were written.
```

The report names the host and database, whether each table exists, the row and
section counts per page, which sections are disabled, the legacy collections
found, and every insert the seed would make. It is read-only — it does not even
create missing tables — so it is safe on production at any time. If the planned
inserts are `none`, the seed is a no-op and there is nothing to audit.

`--json` prints the same information (without credentials) for logs or a
release record.

A scratch database is still the best place to see a first run end to end:

```bash
DATABASE_URL=postgres://user:pass@host/scratch node scripts/seed-studio-content.mjs
```

## 3. Seed production

```bash
DATABASE_URL='postgres://...' pnpm studio:seed
```

Expected output on a first run:

```text
Pages inserted: 5
Homepage sections inserted: 14
Projects inserted: 0 (from 0 legacy records)
Site settings inserted: 1
Studio seed complete.
```

Those are the fixtures-only numbers, verified on an empty database: 4 homepage
sections, 8 on `/about`, 1 on `/media`, 1 on `/contact`. A database that already
holds legacy `cmsContent` records reports a non-zero project count and may carry
different section copy. The script prints `Homepage sections inserted` for every
page's sections, not just `/`.

With the URL in `.env.local` instead:

```bash
node --env-file=.env.local scripts/seed-studio-content.mjs
```

## 4. Verify

```sql
-- Every page has its sections, in order
select p.slug, count(s.id) as sections,
       count(*) filter (where s.is_enabled) as enabled
from pages p
left join page_sections s on s.page_id = p.id
group by p.slug
order by p.slug;

-- The section order and visibility the pages read
select p.slug, s.sort_order, s.section_key, s.is_enabled
from page_sections s
join pages p on p.id = s.page_id
order by p.slug, s.sort_order;

-- Projects and settings exist
select count(*) from projects;
select id, contact_email, availability_status,
       jsonb_array_length(social_links) as socials, updated_at
from site_settings;
```

Or with `psql`:

```bash
psql "$DATABASE_URL" -c "\
select p.slug, count(s.id) from pages p \
left join page_sections s on s.page_id = p.id group by p.slug order by p.slug;"
```

Then check the running site:

- `/` shows the enabled homepage sections.
- `/about` shows education, experience, skills, interests, socials, GitHub and
  the technology chart.
- `/media` shows one block per media collection (the seeded `media` section uses
  `layout: index`).
- `/contact` shows the channels form and details.
- `/work` lists the seeded projects and `/work/<slug>` opens a case study.
- Footer email, availability and socials come from `site_settings`.

Pages are cached (`revalidate = 300`) and tagged `page-<slug>`, `projects`,
`site-settings`. The seed writes directly to Postgres, so it does not invalidate
those tags: changes appear within the revalidation window, or immediately after
any save in the admin studio (which calls `revalidateTag`/`revalidatePath`).

## What the seed does and does not do

- **Creates** missing tables, pages, sections, projects and settings rows.
- **Reads** the legacy `cmsContent` collections (`page copy`, education,
  experience, skills, interests, social links, projects, …) when present, and
  falls back to fixtures for anything missing.
- **Never overwrites** an existing page, section, project or settings row, and
  never deletes anything. Re-running after editing in the studio is a no-op.
- **Tops up sections**: a page that exists but has no sections gets them, which
  is how `/about`, `/media` and `/contact` were moved onto `page_sections`
  without disturbing existing edits.
- Does **not** migrate media galleries, navigation records, uploads or images.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `No database URL found` | No accepted variable is set. Export `DATABASE_URL` for the command. |
| `column "createdAt" does not exist` | A legacy `cmsContent` table created outside Drizzle. Run the app's normal schema migration/`drizzle-kit push` before seeding, or seed a database created by the app. |
| `terminating connection due to administrator command` / DDL errors on Neon | Use the unpooled URL: `DATABASE_URL_UNPOOLED=... pnpm studio:seed`. |
| `self signed certificate` | Keep `sslmode=require` in the URL; the script otherwise enables TLS for remote hosts automatically. |
| Counts are all `0` | Every row already existed, or you pointed at the wrong database. Check the query in step 1. |

## Undoing a seed

The seed is additive. To remove what it created, restore the step 1 dump:

```bash
psql "$DATABASE_URL" -f backups/studio-pre-seed-<timestamp>.sql
```

Deleting individual rows is possible but not recommended: pages, sections,
projects and settings are referenced by the running site, and an emptied table
makes pages fall back to fixtures rather than disappear.
