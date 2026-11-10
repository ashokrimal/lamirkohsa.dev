/**
 * One-off migration: move the copy that used to be hardcoded in components into
 * the CMS, so the site keeps rendering after the hardcoded fallbacks were
 * removed.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/migrate-site-content.mjs
 *
 * Idempotent: a record is only inserted when no record with the same
 * collection + slug exists. Existing records are never overwritten or deleted.
 * Nothing in the running app reads this file; it only seeds the CMS once.
 */
import { Client } from 'pg'

const siteSettings = [
  {
    collection: 'Site Settings',
    title: 'Navigation',
    slug: 'navigation',
    sortOrder: 10,
    payload: {
      primary: [
        { href: '/', label: 'Home', kr: '홈' },
        { href: '/about', label: 'About', kr: '소개' },
        { href: '/projects', label: 'Projects', kr: '작업' },
        { href: '/media', label: 'Media', kr: '미디어' },
        { href: '/contact', label: 'Contact', kr: '연락처' },
      ],
      footer: [
        { href: '/', label: 'Home', kr: '홈' },
        { href: '/about', label: 'About', kr: '소개' },
        { href: '/projects', label: 'Projects', kr: '작업' },
        { href: '/media', label: 'Media', kr: '미디어' },
        { href: '/contact', label: 'Contact', kr: '연락처' },
      ],
      collections: [
        { href: '/blogs', label: 'Journal', kr: '글' },
        { href: '/gallery', label: 'Gallery', kr: '사진' },
        { href: '/media/music', label: 'Music archive', kr: '음악' },
        { href: '/media/anime', label: 'Anime library', kr: '애니' },
        { href: '/resume', label: 'Résumé', kr: '이력서' },
      ],
      socials: [
        { label: 'GitHub', href: 'https://github.com/ashokrimal', kind: 'github' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lamirkohsa/', kind: 'linkedin' },
        { label: 'Email', href: 'mailto:contact@lamirkohsa.com', kind: 'mail' },
        { label: 'Domain', href: 'https://ashokrimal.com.np', kind: 'globe' },
      ],
    },
  },
  {
    collection: 'Site Settings',
    title: 'Footer',
    slug: 'footer',
    sortOrder: 11,
    payload: {
      tagline:
        'Full-stack software developer building calm, human-centric interfaces and dependable backend systems from Nepal.',
      availabilityLabel: 'Available for select work',
      availabilityText: 'Software roles, independent builds and open-source collaborations.',
      ctaLabel: 'Start a conversation',
      ctaHref: '/contact',
      copyrightName: 'Ashok Rimal',
      canonical: 'ashokrimal.com.np',
    },
  },
  {
    collection: 'Site Settings',
    title: 'Brand',
    slug: 'brand',
    sortOrder: 12,
    payload: {
      name: 'Ashok Rimal',
      korean: '아쇼크 리말',
      domain: 'ashokrimal.com.np',
    },
  },
  {
    collection: 'Site Settings',
    title: 'Contact Details',
    slug: 'contact-details',
    sortOrder: 13,
    payload: {
      location: 'Butwal, Nepal',
      timeZone: 'Asia/Kathmandu',
      timezoneLabel: 'NPT',
      availability: 'Available for select work',
      email: 'contact@lamirkohsa.com',
    },
  },
  {
    collection: 'Site Settings',
    title: 'Hero Section',
    slug: 'hero-section',
    sortOrder: 0,
    payload: {
      heading: 'Hello.',
      subtitle: "I'm Ashok, a developer building calm, useful digital experiences.",
      location: 'Butwal, Nepal\nAvailable for thoughtful collaborations',
      initials: 'AR',
      imageUrl: '/images/hero-ashok.png',
      stats: [
        { label: 'Selected projects', value: '04+' },
        { label: 'Creative disciplines', value: '04' },
      ],
      metaLeft: 'Scroll to explore ↓',
      metaRight: 'Selected work · 01 / 06',
    },
  },
  {
    collection: 'Site Settings',
    title: 'Homepage Sections',
    slug: 'homepage-sections',
    sortOrder: 1,
    payload: {
      order: ['about', 'gallery', 'projects', 'media', 'experience', 'contact'],
      enabled: {
        about: true,
        gallery: true,
        projects: true,
        media: true,
        experience: true,
        contact: true,
      },
      sectionMeta: {
        about: {
          eyebrow: '01 / About Me',
          kr: '소개 및 철학',
          title: 'Useful by design.',
          accent: 'Quietly ambitious.',
          description:
            'I like the space between a rough idea and the moment it becomes obvious to use.',
          href: '/about',
          primaryLabel: 'Read complete biography & approach',
          secondaryLabel: 'Status & Focus',
          meta: 'Core Engineering Stack',
        },
        gallery: {
          eyebrow: '02 / Visual Journal',
          kr: '사진 및 시각 기록',
          title: 'Moments in',
          accent: 'perspective.',
          description:
            'Personal photographs capturing quiet geometry, architecture, and light across Nepal.',
          href: '/media',
          primaryLabel: 'View all photographs',
        },
        projects: {
          eyebrow: '03 / Selected Work',
          kr: '주요 프로젝트',
          title: 'Systems built with',
          accent: 'conviction.',
          description:
            'Web and mobile applications engineered from user research to production delivery.',
          href: '/projects',
          primaryLabel: 'Browse project archive & execution timeline',
          secondaryLabel: 'Browse all case studies & milestones',
        },
        media: {
          eyebrow: '04 / Cultural Influences',
          kr: '음악 및 미디어',
          title: 'Soundtrack &',
          accent: 'Stories.',
          description: 'Music rotation, anime, and manga that inspire visual rhythm and focus.',
          href: '/media',
          primaryLabel: 'Open complete media collections',
        },
        experience: {
          eyebrow: '05 / Career & Toolkit',
          kr: '경력 및 기술',
          title: 'Work in',
          accent: 'practice.',
          description: 'Roles, teaching commitments, and practical technical proficiencies.',
          href: '/about',
          primaryLabel: 'View complete career & qualifications',
          secondaryLabel: 'Selected Milestones',
          meta: 'Core Disciplines',
        },
        contact: {
          eyebrow: '06 / Direct Dispatch',
          kr: '직접 연락',
          title: "Let's build something",
          accent: 'thoughtful.',
          description: 'Open to software engineering roles, client contracts, and collaborative builds.',
        },
      },
    },
  },
]

const pageCopy = [
  {
    key: 'about',
    eyebrow: 'About / Software Developer',
    krEyebrow: '소개',
    title: 'Making things',
    accent: 'matter.',
    description:
      'A Bachelor of Computer Applications student and full-stack software developer focused on thoughtful interfaces, dependable backend systems, and the details that make software feel human.',
    sections: {
      coordinates: { title: 'Coordinates' },
      experience: {
        eyebrow: '01 / Work Experience',
        krEyebrow: '경력 사항',
        title: 'Work in',
        accent: 'practice.',
        description:
          'Professional roles and teaching commitments where curiosity became practical impact.',
      },
      education: {
        eyebrow: '02 / Education',
        krEyebrow: '학력 사항',
        title: 'Learning with',
        accent: 'intention.',
        description:
          'Academic foundation in computer applications, distributed software, and algorithmic thinking.',
      },
      skills: {
        eyebrow: '03 / Engineering Stack',
        krEyebrow: '기술 스택',
        title: 'Tools for turning',
        accent: 'ideas real.',
        description:
          'A practical, modern stack spanning frontend systems, backend services, and embedded hardware.',
      },
    },
  },
  {
    key: 'projects',
    eyebrow: 'Selected Work · Case Studies',
    krEyebrow: '주요 프로젝트',
    title: 'Engineering ideas into',
    accent: 'reality.',
    description:
      'Case studies from discovery to deployment, where architecture, performance and interface craft meet real-world utility.',
  },
  {
    key: 'project-case-study',
    eyebrow: 'Case Study',
    accent: 'in detail.',
    description: 'How the work moved from the first brief to a shipped build.',
    sections: {
      problem: {
        eyebrow: '01 / Problem & Approach',
        krEyebrow: '문제와 접근',
        title: 'The brief and the',
        accent: 'build.',
        primaryLabel: 'The challenge',
        secondaryLabel: 'The approach',
      },
      phases: {
        eyebrow: '02 / Delivery',
        krEyebrow: '진행 단계',
        title: 'Phase by',
        accent: 'phase.',
        description: 'The milestones that carried the build from concept to release.',
      },
      details: {
        eyebrow: '03 / Details',
        krEyebrow: '세부 사항',
        title: 'What shipped',
        accent: 'inside.',
        primaryLabel: 'Features',
        secondaryLabel: 'Stack',
      },
    },
  },
  {
    key: 'media',
    eyebrow: 'Media & Cultural Library',
    krEyebrow: '미디어 기록',
    title: "What I'm",
    accent: 'into.',
    description:
      'Curated listening rotation, anime, manga, and films that inspire focus and visual storytelling.',
  },
  {
    key: 'media-music',
    eyebrow: 'Media / Music',
    krEyebrow: '음악',
    title: 'Listening',
    accent: 'rotation.',
    description: 'Favorite listening, recent rotation, and personal soundscapes.',
  },
  {
    key: 'media-anime',
    eyebrow: 'Media / Anime',
    krEyebrow: '애니메이션',
    title: 'Watching',
    accent: 'closely.',
    description: 'Favorite, currently watching, completed, and plan-to-watch series.',
  },
  {
    key: 'media-manga',
    eyebrow: 'Media / Manga',
    krEyebrow: '만화',
    title: 'Reading',
    accent: 'closely.',
    description: 'Favorite graphic novels, currently reading series, and masterworks.',
  },
  {
    key: 'media-github',
    eyebrow: 'Media / GitHub',
    krEyebrow: '깃허브',
    title: 'Building in',
    accent: 'public.',
    description: 'Open-source activity and commit cadence pulled live from GitHub.',
  },
  {
    key: 'media-films',
    eyebrow: 'Media / Films',
    krEyebrow: '영화',
    title: "Films I've",
    accent: 'watched.',
    description: 'A personal shelf of films watched, remembered, and worth returning to.',
  },
  {
    key: 'journal',
    eyebrow: 'Journal / Essays & Notes',
    krEyebrow: '글',
    title: 'Notes in',
    accent: 'progress.',
    description:
      'Essays, architectural experiments, and field observations on software design, pedagogical robotics, and calm digital craft.',
  },
  {
    key: 'gallery',
    eyebrow: 'Archive / Photography',
    krEyebrow: '사진',
    title: 'A collection of',
    accent: 'frames.',
    description:
      'Landscapes, workspaces and quiet geometry collected along the way — the visual journal behind the software.',
  },
  {
    key: 'contact',
    eyebrow: 'Contact / Direct Channel',
    krEyebrow: '연락처',
    title: "Let's build something",
    accent: 'thoughtful.',
    description:
      'Open to software engineering roles, independent client builds, and open-source initiatives. Send a message or reach out across any channel.',
    sections: { coordinates: { title: 'Coordinates' } },
  },
  {
    key: 'experience',
    eyebrow: '02 / Professional history',
    title: 'A career built through curiosity.',
    description:
      'A chronological view of the roles, responsibilities, and experiments shaping my path.',
  },
  {
    key: 'education',
    eyebrow: '03 / Education',
    title: 'Learning with intention.',
    description:
      'The classrooms and communities that gave me a foundation for building useful things.',
  },
  {
    key: 'skills',
    eyebrow: '04 / Skills & interests',
    title: 'Tools for turning ideas real.',
    description:
      'Owner-entered self-assessments across the technologies and disciplines I am actively exploring.',
  },
  {
    key: 'certificates',
    eyebrow: '06 / Certificates',
    title: 'Proof of steady progress.',
    description: 'Credentials and learning milestones will live here as the library grows.',
  },
  {
    key: 'resume',
    eyebrow: '08 / Resume',
    title: 'An evolving CV.',
    description:
      'A concise, portfolio-derived view of my experience, education, and current direction.',
  },
]

const mediaCollections = [
  {
    key: 'music',
    number: '01',
    label: 'Music',
    kr: '음악',
    description: 'Favorite listening, recent rotation, and personal soundscapes.',
    href: '/media/music',
  },
  {
    key: 'anime',
    number: '02',
    label: 'Anime',
    kr: '애니',
    description: 'Favorite, currently watching, completed, and plan-to-watch series.',
    href: '/media/anime',
  },
  {
    key: 'manga',
    number: '03',
    label: 'Manga & Manhwa',
    kr: '만화',
    description: 'Favorite graphic novels, currently reading series, and masterworks.',
    href: '/media/manga',
  },
  {
    key: 'films',
    number: '04',
    label: 'Films',
    kr: '영화',
    description: 'Cinematic films watched, remembered, and worth revisiting.',
    href: '/movies',
  },
]

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is required.')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    const owner = await client.query(
      `select "userId", count(*) as total from "cmsContent" group by 1 order by total desc limit 1`,
    )
    const userId = owner.rows[0]?.userId
    if (!userId) {
      throw new Error('No existing CMS records found; sign in and save a record first.')
    }

    const records = [
      ...siteSettings.map((record) => ({ ...record, status: 'published' })),
      ...pageCopy.map((payload, index) => ({
        collection: 'Page Copy',
        title: payload.key,
        slug: `page-${payload.key}`,
        sortOrder: index,
        status: 'published',
        payload,
      })),
      ...mediaCollections.map((payload, index) => ({
        collection: 'Media Collections',
        title: payload.label,
        slug: `media-collection-${payload.key}`,
        sortOrder: index,
        status: 'published',
        payload,
      })),
    ]

    let inserted = 0
    let skipped = 0

    for (const record of records) {
      const existing = await client.query(
        `select 1 from "cmsContent" where "collection" = $1 and "slug" = $2 limit 1`,
        [record.collection, record.slug],
      )
      if (existing.rowCount) {
        skipped += 1
        continue
      }

      await client.query(
        `insert into "cmsContent" ("userId", "collection", "title", "slug", "payload", "status", "sortOrder")
         values ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
        [
          userId,
          record.collection,
          record.title,
          record.slug,
          JSON.stringify(record.payload),
          record.status,
          record.sortOrder,
        ],
      )
      inserted += 1
    }

    console.log(`Inserted ${inserted} records, skipped ${skipped} existing records.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
