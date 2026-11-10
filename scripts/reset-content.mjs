/**
 * Content reset: empties the site's populated content while keeping every
 * collection type, the CMS, the auth system and the schema intact.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/reset-content.mjs            # dry run
 *   DATABASE_URL=postgres://... node scripts/reset-content.mjs --apply    # perform
 *
 * What it does
 *   - Deletes every record in the content collections listed below.
 *   - Reorders the primary navigation to Home, About, Media, Projects, Contact.
 *   - Clears contact email/phone/availability and sets the location to
 *     Butwal, Nepal.
 *   - Reorders the homepage sections to gallery, about, projects, media,
 *     contact, with five preview cards each.
 *   - Ensures the Music, Movies, Anime and Manga collection records exist.
 *
 * What it never touches
 *   - Site Settings records other than Navigation, Contact Details and
 *     Homepage Sections.
 *   - Page Copy, Media Collections, the users/auth tables and the schema.
 */
import { Client } from 'pg'

const CONTENT_COLLECTIONS = [
  'Projects',
  'Gallery',
  'Education',
  'Experience',
  'Skills',
  'Certificates',
  'Achievements',
  'Social Links',
  'Interests',
  'Music',
  'Movies',
  'Anime',
  'Manga',
  'Blogs',
  'Media',
]

const PRIMARY_NAV = [
  { href: '/', label: 'Home', kr: '홈' },
  { href: '/about', label: 'About', kr: '소개' },
  { href: '/media', label: 'Media', kr: '미디어' },
  { href: '/projects', label: 'Projects', kr: '작업' },
  { href: '/contact', label: 'Contact', kr: '연락처' },
]

const HOMEPAGE_ORDER = ['gallery', 'about', 'projects', 'media', 'contact']

const HOMEPAGE_SECTIONS = {
  gallery: { previewCount: 5, href: '/about/gallery' },
  about: { previewCount: 5 },
  projects: { previewCount: 5, href: '/projects' },
  media: { previewCount: 5, href: '/media' },
  contact: {},
}

const MEDIA_COLLECTIONS = [
  { key: 'music', label: 'Music', kr: '음악', href: '/media/music', number: '01' },
  { key: 'movies', label: 'Movies', kr: '영화', href: '/media/movies', number: '02' },
  { key: 'anime', label: 'Anime', kr: '애니', href: '/media/anime', number: '03' },
  { key: 'manga', label: 'Manga', kr: '만화', href: '/media/manga', number: '04' },
]

const apply = process.argv.includes('--apply')

function fail(message) {
  console.error(message)
  process.exit(2)
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) fail('DATABASE_URL is required.')

  const client = new Client({ connectionString })
  await client.connect()

  try {
    const settings = await client.query(
      `select "id", "title", "slug", "payload" from "cmsContent" where "collection" = 'Site Settings'`,
    )
    const bySlug = new Map(settings.rows.map((row) => [String(row.slug || row.title).toLowerCase(), row]))

    const counts = await client.query(
      `select "collection", count(*)::int as count from "cmsContent"
       where "collection" = any($1) group by 1 order by 1`,
      [CONTENT_COLLECTIONS],
    )

    console.log(`Content reset — ${apply ? 'APPLY' : 'dry run'}\n`)

    console.log('Records to delete')
    if (counts.rows.length === 0) {
      console.log('  (no content records found)')
    } else {
      for (const row of counts.rows) console.log(`  ${row.collection}: ${row.count}`)
    }

    console.log('\nPlanned Site Settings changes')
    const navigation = bySlug.get('navigation')
    if (navigation) {
      console.log('  Navigation: primary order Home, About, Media, Projects, Contact; socials cleared')
    } else {
      console.log('  Navigation: record missing, skipped')
    }
    const contact = bySlug.get('contact-details')
    if (contact) {
      console.log('  Contact Details: location Butwal, Nepal; email, phone and availability cleared')
    } else {
      console.log('  Contact Details: record missing, skipped')
    }
    const homepage = bySlug.get('homepage-sections')
    if (homepage) {
      console.log(`  Homepage Sections: order ${HOMEPAGE_ORDER.join(' → ')}; five preview cards each`)
    } else {
      console.log('  Homepage Sections: record missing, skipped')
    }
    console.log('  Media Collections: ensure music, movies, anime and manga records exist')

    if (!apply) {
      console.log('\nNothing was changed. Re-run with --apply to write these changes.')
      return
    }

    const owner = await client.query(
      `select "userId", count(*)::int as total from "cmsContent" group by 1 order by total desc limit 1`,
    )
    const userId =
      owner.rows[0]?.userId ||
      navigation?.payload?.userId ||
      contact?.payload?.userId ||
      'admin'
    if (owner.rows.length === 0) {
      console.log('\nNo CMS records at all: nothing to reset.')
      return
    }

    await client.query('begin')

    const deleted = await client.query(
      `delete from "cmsContent" where "collection" = any($1)`,
      [CONTENT_COLLECTIONS],
    )

    if (navigation) {
      const payload = { ...(navigation.payload || {}), primary: PRIMARY_NAV, footer: PRIMARY_NAV, socials: [] }
      await client.query(
        `update "cmsContent" set "payload" = $1, "updatedAt" = now() where "id" = $2`,
        [payload, navigation.id],
      )
    }

    if (contact) {
      const payload = {
        ...(contact.payload || {}),
        location: 'Butwal, Nepal',
        timeZone: 'Asia/Kathmandu',
        timezoneLabel: 'NPT',
        email: '',
        phone: '',
        availability: '',
        formEnabled: true,
      }
      await client.query(
        `update "cmsContent" set "payload" = $1, "updatedAt" = now() where "id" = $2`,
        [payload, contact.id],
      )
    }

    if (homepage) {
      const previous = homepage.payload || {}
      const previousMeta =
        previous.sectionMeta && typeof previous.sectionMeta === 'object' ? previous.sectionMeta : {}
      const sectionMeta = {}
      for (const key of HOMEPAGE_ORDER) {
        sectionMeta[key] = { ...(previousMeta[key] || {}), ...HOMEPAGE_SECTIONS[key] }
      }
      const enabled = {}
      for (const key of HOMEPAGE_ORDER) enabled[key] = true
      const payload = { ...previous, order: HOMEPAGE_ORDER, enabled, sectionMeta }
      await client.query(
        `update "cmsContent" set "payload" = $1, "updatedAt" = now() where "id" = $2`,
        [payload, homepage.id],
      )
    }

    let insertedCollections = 0
    for (const [index, collection] of MEDIA_COLLECTIONS.entries()) {
      const existing = await client.query(
        `select "id", "payload" from "cmsContent"
         where "collection" = 'Media Collections'
           and (lower("slug") = $1 or lower(coalesce("payload"->>'key','')) = $1 or lower("title") = $1)
         limit 1`,
        [collection.key],
      )

      const payload = {
        key: collection.key,
        number: collection.number,
        label: collection.label,
        kr: collection.kr,
        description: '',
        href: collection.href,
        previewCount: 5,
      }

      if (existing.rows[0]) {
        await client.query(
          `update "cmsContent" set "payload" = $1, "updatedAt" = now() where "id" = $2`,
          [{ ...(existing.rows[0].payload || {}), ...payload }, existing.rows[0].id],
        )
      } else {
        await client.query(
          `insert into "cmsContent" ("userId", "collection", "title", "slug", "payload", "status", "sortOrder")
           values ($1, 'Media Collections', $2, $3, $4, 'published', $5)`,
          [userId, collection.label, collection.key, payload, 40 + index],
        )
        insertedCollections += 1
      }
    }

    await client.query('commit')

    console.log(`\nDeleted ${deleted.rowCount} content record(s).`)
    console.log(`Media Collections records created: ${insertedCollections}.`)
    console.log('Done. The site now only renders content added through the CMS.')
  } catch (error) {
    await client.query('rollback').catch(() => {})
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
