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
  '/about': [
    {
      sectionKey: 'introduction',
      sortOrder: 0,
      isEnabled: true,
      content: {
        eyebrow: '01 / About Me',
        krEyebrow: '소개 및 철학',
        title: 'Making things',
        accent: 'matter.',
        description:
          'A full-stack software developer focused on thoughtful interfaces, dependable backend systems, and the details that make software feel human.',
        animation: { enabled: false, intensity: 0.2 },
      },
    },
    {
      sectionKey: 'education',
      sortOrder: 1,
      isEnabled: true,
      content: {
        eyebrow: '01 / Education',
        krEyebrow: '학력 사항',
        title: 'Learning with',
        accent: 'intention.',
        description:
          'Academic foundation in computer applications, distributed software, and algorithmic thinking.',
      },
    },
    {
      sectionKey: 'experience',
      sortOrder: 2,
      isEnabled: true,
      content: {
        eyebrow: '02 / Work Experience',
        krEyebrow: '경력 사항',
        title: 'Work in',
        accent: 'practice.',
        description:
          'Professional roles and teaching commitments where curiosity became practical impact.',
      },
    },
    {
      sectionKey: 'skills',
      sortOrder: 3,
      isEnabled: true,
      content: {
        eyebrow: '03 / Engineering Stack',
        krEyebrow: '기술 스택',
        title: 'Tools for turning',
        accent: 'ideas real.',
        description:
          'A practical, modern stack spanning frontend systems, backend services, and embedded hardware.',
      },
    },
    {
      sectionKey: 'interests',
      sortOrder: 4,
      isEnabled: true,
      content: {
        eyebrow: '04 / Interests',
        title: 'Beyond the',
        accent: 'editor.',
        description: 'Creative pursuits and study areas outside the day job.',
      },
    },
    {
      sectionKey: 'socials',
      sortOrder: 5,
      isEnabled: true,
      content: {
        eyebrow: '05 / Social Channels',
        title: 'Elsewhere',
        accent: 'online.',
      },
    },
    {
      sectionKey: 'github',
      sortOrder: 6,
      isEnabled: true,
      content: {
        eyebrow: '06 / Activity',
        krEyebrow: '깃허브',
        title: 'Recent',
        accent: 'commits.',
        ctaLabel: 'GitHub activity',
        ctaHref: '/about/github',
      },
    },
    {
      sectionKey: 'technology',
      sortOrder: 7,
      isEnabled: true,
      content: {
        eyebrow: '07 / Telemetry',
        title: 'Technology',
        accent: 'distribution.',
        description:
          'How the published work is built, weighted by the stack declared on each project.',
        ctaLabel: 'All projects',
        ctaHref: '/projects',
        animation: { enabled: true, intensity: 0.4 },
      },
    },
  ],
  '/projects': [],
  '/media': [
    {
      sectionKey: 'media',
      sortOrder: 0,
      isEnabled: true,
      content: {
        eyebrow: '01 / Cultural Library',
        krEyebrow: '미디어 기록',
        title: "What I'm",
        accent: 'into.',
        description:
          'Curated listening rotation, anime, manga, and films that inspire focus and visual storytelling.',
        ctaLabel: 'Open music archive',
        ctaHref: '/media/music',
        layout: 'index',
        animation: { enabled: false, intensity: 0.2 },
      },
    },
  ],
  '/contact': [
    {
      sectionKey: 'contact',
      sortOrder: 0,
      isEnabled: true,
      content: {
        eyebrow: '01 / Direct Dispatch',
        krEyebrow: '직접 연락',
        title: "Let's build something",
        accent: 'thoughtful.',
        description:
          'Open to software engineering roles, client contracts, and collaborative builds.',
        animation: { enabled: false, intensity: 0.2 },
      },
    },
  ],
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
