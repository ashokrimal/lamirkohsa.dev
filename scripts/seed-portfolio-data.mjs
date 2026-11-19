/**
 * Seeds the content that used to be hardcoded in `src/lib/portfolio-data.ts`
 * into the CMS, so the live site renders it from Postgres and the owner can
 * edit every value from the studio.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/seed-portfolio-data.mjs
 *   DATABASE_URL=postgres://... node scripts/seed-portfolio-data.mjs --dry-run
 *
 * Idempotent: a record is inserted only when its collection + slug is missing.
 * Existing records are never overwritten, so edits made in the studio survive a
 * re-run. Records are published so they appear on the site immediately.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { Client } from 'pg'
import { createPgClientOptions, resolveDatabaseUrl } from './db-env.mjs'
import { loadCmsSchema } from './load-cms-schema.mjs'

const { CMS_COLLECTIONS } = await loadCmsSchema()

const SITE_URL = 'https://ashokrimal.com.np'

const records = [
  {
    collection: CMS_COLLECTIONS.profile,
    title: 'Ashok Rimal',
    slug: 'profile',
    sortOrder: 0,
    payload: {
      fullName: 'Ashok Rimal',
      headline: 'Developer · Designer · Learner',
      summary:
        'A Bachelor of Computer Applications student and developer focused on thoughtful interfaces, useful products, and the details that make software feel human.',
      location: 'Butwal, Nepal',
      availability: 'Open to software roles and select collaborations',
      email: 'info@ashokrimal.com.np',
      github: 'https://github.com/ashokrimal',
      linkedin: 'https://linkedin.com/in/ashokrimal',
      website: SITE_URL,
    },
  },

  {
    collection: CMS_COLLECTIONS.experience,
    title: 'AI and Robotics Instructor',
    slug: 'ai-and-robotics-instructor',
    sortOrder: 0,
    payload: {
      organization: 'Dursikshya Education',
      period: 'March 2024 - August 2024',
      description:
        'Teaching students to turn curiosity into practical experiments across AI, robotics, and creative technology.',
      tags: ['AI', 'Robotics', 'Teaching'],
    },
  },

  {
    collection: CMS_COLLECTIONS.education,
    title: 'Bachelor of Computer Applications',
    slug: 'bachelor-of-computer-applications',
    sortOrder: 0,
    payload: {
      organization: 'Crimson College of Technology',
      period: 'August 2022 - Present',
      description: 'An affiliated college of Pokhara University.',
      tags: ['Computer Applications', 'Software Engineering'],
    },
  },
  {
    collection: CMS_COLLECTIONS.education,
    title: '+2',
    slug: 'plus-two',
    sortOrder: 1,
    payload: {
      organization: 'Tilottama College',
      period: 'July 2020 - June 2022',
      description: 'Higher secondary education.',
    },
  },
  {
    collection: CMS_COLLECTIONS.education,
    title: 'Secondary Education',
    slug: 'secondary-education',
    sortOrder: 2,
    payload: {
      organization: 'Rampur English Boarding Secondary School',
      period: 'April 2018 - March 2020',
      description: 'Secondary school education.',
    },
  },

  ...[
    ['Frontend Development', ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']],
    ['Backend Development', ['Node.js', 'Express', 'REST APIs']],
    ['Programming Languages', ['TypeScript', 'JavaScript', 'Python']],
    ['Database', ['PostgreSQL', 'Firebase']],
    ['Mobile Development', ['React Native']],
    ['AI and Emerging Technologies', ['AI / ML', 'Robotics']],
    ['UI/UX', ['Product design', 'Accessible interfaces']],
    ['Tools and Technologies', ['Git', 'Figma', 'REST']],
    ['Soft Skills', ['Communication', 'Teaching', 'Problem solving']],
  ].map(([category, items], index) => ({
    collection: CMS_COLLECTIONS.skills,
    title: category,
    slug: `skill-${String(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    sortOrder: index,
    payload: { category, items },
  })),

  ...[
    { label: 'GitHub', href: 'https://github.com/ashokrimal', handle: '@ashokrimal', kind: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ashokrimal', handle: 'in/ashokrimal', kind: 'linkedin' },
    { label: 'Email', href: 'mailto:info@ashokrimal.com.np', handle: 'info@ashokrimal.com.np', kind: 'mail' },
  ].map((link, index) => ({
    collection: CMS_COLLECTIONS.socialLinks,
    title: link.label,
    slug: `social-${link.label.toLowerCase()}`,
    sortOrder: index,
    payload: { ...link, featured: true },
  })),

  {
    collection: CMS_COLLECTIONS.projects,
    title: 'KaryaMantra',
    slug: 'karyamantra',
    sortOrder: 0,
    payload: {
      category: 'Product',
      summary: 'A calm workspace that helps students turn scattered assignments into steady progress.',
      description:
        'A productivity platform built around a single daily plan: what is due, what is next, and what can wait.',
      techStack: ['React', 'Firebase'],
      status: 'Prototype',
      featured: true,
    },
  },
  {
    collection: CMS_COLLECTIONS.projects,
    title: 'BuyNepal',
    slug: 'buynepal',
    sortOrder: 1,
    payload: {
      category: 'Web App',
      summary: 'A marketplace concept connecting local makers with a simpler, more human storefront.',
      description:
        'An e-commerce experience focused on small Nepali makers, with a storefront that stays legible on slow connections.',
      techStack: ['Next.js', 'Node.js'],
      status: 'Concept',
      featured: true,
    },
  },
  {
    collection: CMS_COLLECTIONS.projects,
    title: 'InsightHub',
    slug: 'insighthub',
    sortOrder: 2,
    payload: {
      category: 'Product',
      summary:
        'A collaborative data exchange for teams that want to make more value from what they know.',
      description:
        'A shared knowledge platform where teams publish the context behind their decisions instead of scattering it across chat.',
      techStack: ['React Native', 'Express'],
      status: 'Ongoing',
      featured: false,
    },
  },

  ...[
    {
      title: 'Building Calm Interfaces in a Noisy Web',
      slug: 'building-calm-interfaces-in-a-noisy-web',
      category: 'Essay',
      date: '2024-10-01',
      description:
        'Most modern digital software bombards users with notifications, saturated gradients, modal dialogs, and simulated urgency. Over the past year of designing and shipping products, I have converged on an opposing philosophy: calm software that respects human cognitive bandwidth. Calm interfaces avoid unnecessary motion, prioritize generous whitespace, and use progressive disclosure to reveal complexity only when invited. In this essay, we break down typography hierarchy, restrained color palettes, and why quiet software always outlasts noisy gimmicks.',
    },
    {
      title: 'Reflections on Teaching Robotics & Python to College Beginners',
      slug: 'reflections-on-teaching-robotics-python',
      category: 'Journal',
      date: '2024-08-01',
      description:
        'Teaching at Dursikshya Education forced me to re-evaluate how beginners conceptualize abstract programming constructs. When a student sees an error in a terminal, it feels like an impenetrable wall. But when an Arduino motor fails to spin because a PWM signal is out of bounds, the bug is immediately tactile and physical. Connecting hardware feedback loops to Python logic completely transformed how students engaged with loops, conditionals, and state machines. Here are the core pedagogical patterns that worked best.',
    },
    {
      title: 'The Architecture of Offline-First Web Applications',
      slug: 'architecture-of-offline-first-web-applications',
      category: 'Tutorial',
      date: '2024-06-01',
      description:
        'Building web applications for regions with intermittent bandwidth requires discarding the assumption that the network is always reliable. By combining IndexedDB local caching, service worker background synchronization, and optimistic UI updates, developers can craft experiences that never freeze or lose unsaved edits. We examine conflict resolution strategies, monotonic timestamp ordering, and how to design UI states that reassure users while background sync queues reconnect.',
    },
    {
      title: 'Why Small, Focused Tools Matter',
      slug: 'why-small-focused-tools-matter',
      category: 'Note',
      date: '2024-05-01',
      description:
        'The tendency of modern software products is toward feature sprawl. Every tool attempts to become an all-in-one operating system. Yet the utilities developers cherish most are Unix-style single-purpose programs that perform one task exceptionally well and compose cleanly with others.',
    },
  ].map((post, index) => ({
    collection: CMS_COLLECTIONS.blogs,
    title: post.title,
    slug: post.slug,
    sortOrder: index,
    payload: {
      category: post.category,
      publishAt: post.date,
      excerpt: post.description.slice(0, 180).trimEnd() + '…',
      body: post.description,
      tags: [post.category],
    },
  })),
]

export function buildPortfolioSeedRecords() {
  return records.map((record) => ({ ...record, status: 'published' }))
}

async function resolveOwnerId(client) {
  const fromContent = await client.query(
    `select "userId", count(*)::int as total from "cmsContent" group by 1 order by total desc limit 1`,
  )
  if (fromContent.rows[0]?.userId) return fromContent.rows[0].userId

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const byEmail = await client.query(`select id from "user" where lower(email) = lower($1) limit 1`, [
      adminEmail,
    ])
    if (byEmail.rows[0]?.id) return byEmail.rows[0].id
  }

  const firstUser = await client.query(`select id from "user" order by "createdAt" asc limit 1`)
  return firstUser.rows[0]?.id
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const connectionString = resolveDatabaseUrl()
  if (!connectionString) {
    console.error(
      'A PostgreSQL connection URL (DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL_UNPOOLED) is required.',
    )
    process.exit(1)
  }

  const client = new Client(createPgClientOptions(connectionString))
  await client.connect()

  try {
    const userId = await resolveOwnerId(client)
    if (!userId) {
      throw new Error(
        'No owner account found. Sign in to /admin/sign-in once (or set ADMIN_EMAIL) and run the seed again.',
      )
    }

    const rows = buildPortfolioSeedRecords()
    let inserted = 0
    let skipped = 0

    for (const row of rows) {
      const existing = await client.query(
        `select "id" from "cmsContent" where "collection" = $1 and "slug" = $2 limit 1`,
        [row.collection, row.slug],
      )
      if (existing.rowCount) {
        skipped += 1
        continue
      }

      if (dryRun) {
        console.log(`[dry-run] insert ${row.collection} / ${row.title}`)
        inserted += 1
        continue
      }

      await client.query(
        `insert into "cmsContent" ("userId", "collection", "title", "slug", "payload", "status", "sortOrder")
         values ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
        [
          userId,
          row.collection,
          row.title,
          row.slug,
          JSON.stringify(row.payload),
          row.status,
          row.sortOrder,
        ],
      )
      inserted += 1
    }

    console.log(
      `${dryRun ? '[dry-run] ' : ''}Seeded ${inserted} records; ${skipped} already existed and were left untouched.`,
    )
  } finally {
    await client.end()
  }
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (isDirectRun) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
