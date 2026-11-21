# Runbooks

Operational notes for this repository. Each file is meant to be read before
doing the thing it describes, not after something breaks.

| Runbook | Covers |
| --- | --- |
| [studio-seed.md](studio-seed.md) | Production seeding: `DATABASE_URL`, backups, verification queries, cache behaviour, pooled Neon connections, legacy `cmsContent` tables |
| [bugsmash-mcp.md](bugsmash-mcp.md) | Connecting the BugSmash MCP server over OAuth, reviewing a deployment by hand, and why there is no BugSmash CI job |

## Working with CMS sections

Studio → **Pages** lists the rows in the studio's `site_pages` table, so a page
can only carry sections once it has a row there. Pages that predate the studio
(`/about/gallery`) render fixed layouts until someone creates one:

1. Studio → Pages → **New page slug** → `/about/gallery` → create.
2. Add the section you want (for example **Instagram feed**) and set its fields.
3. `/about/gallery` prefers that section once it is enabled and falls back to
   its built-in block when it is missing or hidden.

The gallery page reads only its `instagram` section; other keys added to that
page are ignored, because the rest of the page is not section-driven yet.

## Checks

| Command | What it needs |
| --- | --- |
| `pnpm run typecheck` | Nothing |
| `pnpm run lint` | Nothing |
| `pnpm run test` | Nothing (unit tests only) |
| `pnpm run build` | Nothing; `prebuild` skips database checks without `DATABASE_URL` |
| `pnpm run studio:verify` | `DATABASE_URL` |

`.github/workflows/quality.yml` runs the first four on every push and pull
request; the database workflows skip when their secret is absent.
