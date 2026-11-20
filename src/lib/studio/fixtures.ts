/**
 * Default studio content.
 *
 * Self-contained on purpose: the seed script transpiles this file in memory
 * (the same trick `scripts/load-cms-schema.mjs` uses), so it must not import
 * anything. The app uses these values as the fallback when the studio tables
 * are still empty, which keeps every route rendering before the first seed.
 */

export interface DefaultPage {
  slug: string
  title: string
  metaDescription: string
  isPublished: boolean
}

export interface DefaultSectionSeed {
  sectionKey: string
  sortOrder: number
  isEnabled: boolean
  content: Record<string, unknown>
}

export interface DefaultSocialLink {
  id: string
  platform: string
  label: string
  url: string
  is_visible: boolean
  sort_order: number
}

export const DEFAULT_PAGES: DefaultPage[] = [
  {
    slug: '/',
    title: 'Ashok Rimal — Software Developer',
    metaDescription:
      'Portfolio of Ashok Rimal, a full-stack software developer building calm interfaces and dependable backend systems.',
    isPublished: true,
  },
  {
    slug: '/about',
    title: 'About',
    metaDescription:
      'About Ashok Rimal, a full-stack software developer focused on thoughtful interfaces and dependable systems.',
    isPublished: true,
  },
  {
    slug: '/projects',
    title: 'Projects & Case Studies',
    metaDescription:
      'Case studies from discovery to deployment, where architecture, performance and interface craft meet real-world utility.',
    isPublished: true,
  },
  {
    slug: '/contact',
    title: 'Contact',
    metaDescription:
      'Start a conversation about software roles, independent builds and open-source collaborations.',
    isPublished: true,
  },
  {
    slug: '/media',
    title: 'Media & Cultural Library',
    metaDescription:
      'A curated listening rotation, anime, manga, and films that inspire focus and visual storytelling.',
    isPublished: true,
  },
]

/** Homepage sections, in the order the site shipped with. */
export const DEFAULT_PAGE_SECTIONS: Record<string, DefaultSectionSeed[]> = {
  '/': [
    {
      sectionKey: 'introduction',
      sortOrder: 0,
      isEnabled: true,
      content: {
        eyebrow: '01 / About Me',
        krEyebrow: '소개 및 철학',
        title: 'Useful by design.',
        accent: 'Quietly ambitious.',
        description:
          'I like the space between a rough idea and the moment it becomes obvious to use.',
        ctaLabel: 'Read the full story',
        ctaHref: '/about',
        animation: { enabled: true, intensity: 0.5 },
      },
    },
    {
      sectionKey: 'projects',
      sortOrder: 1,
      isEnabled: true,
      content: {
        eyebrow: '02 / Selected Work',
        krEyebrow: '주요 프로젝트',
        title: 'Systems built with',
        accent: 'conviction.',
        description:
          'Web and mobile applications engineered from user research to production delivery.',
        ctaLabel: 'View all projects',
        ctaHref: '/projects',
        previewCount: 3,
        animation: { enabled: true, intensity: 0.4 },
      },
    },
    {
      sectionKey: 'media',
      sortOrder: 2,
      isEnabled: true,
      content: {
        eyebrow: '03 / Cultural Influences',
        krEyebrow: '음악 및 미디어',
        title: 'Soundtrack &',
        accent: 'Stories.',
        description: 'Music rotation, anime, and manga that inspire visual rhythm and focus.',
        ctaLabel: 'View all media',
        ctaHref: '/media',
        animation: { enabled: false, intensity: 0.3 },
      },
    },
    {
      sectionKey: 'github',
      sortOrder: 3,
      isEnabled: true,
      content: {
        eyebrow: '04 / Activity',
        krEyebrow: '깃허브',
        title: 'Recent',
        accent: 'commits.',
        description: 'Public work, in progress.',
        ctaLabel: 'GitHub activity',
        ctaHref: '/about/github',
        animation: { enabled: false, intensity: 0.2 },
      },
    },
  ],
  '/about': [],
  '/projects': [],
  '/contact': [],
  '/media': [],
}

export const DEFAULT_SITE_SETTINGS = {
  contactEmail: 'contact@lamirkohsa.com',
  availabilityStatus: 'Available for select work',
  socialLinks: [
    {
      id: 'github',
      platform: 'github',
      label: 'GitHub',
      url: 'https://github.com/ashokrimal',
      is_visible: true,
      sort_order: 0,
    },
    {
      id: 'linkedin',
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/lamirkohsa/',
      is_visible: true,
      sort_order: 1,
    },
    {
      id: 'email',
      platform: 'email',
      label: 'Email',
      url: 'mailto:contact@lamirkohsa.com',
      is_visible: true,
      sort_order: 2,
    },
  ] as DefaultSocialLink[],
}
