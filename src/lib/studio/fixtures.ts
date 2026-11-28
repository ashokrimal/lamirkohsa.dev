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
        eyebrow: 'Introduction',
        krEyebrow: '소개 및 철학',
        title: 'A short introduction',
        accent: '',
        description: 'Who I am, what I build, and how to reach me.',
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
        eyebrow: 'Projects',
        krEyebrow: '주요 프로젝트',
        title: 'Projects',
        accent: '',
        description: 'Case studies with the problem, what I built, and how it turned out.',
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
        eyebrow: 'Media',
        krEyebrow: '음악 및 미디어',
        title: 'Media',
        accent: '',
        description: 'Music, films, anime and manga I keep coming back to.',
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
        eyebrow: 'Activity',
        krEyebrow: '깃허브',
        title: 'Recent activity',
        accent: '',
        description: 'Public work in progress, straight from GitHub.',
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
        eyebrow: 'Introduction',
        krEyebrow: '소개 및 철학',
        title: 'A short introduction',
        accent: '',
        description: 'Who I am, what I build, and how to reach me.',
        animation: { enabled: false, intensity: 0.2 },
      },
    },
    {
      sectionKey: 'education',
      sortOrder: 1,
      isEnabled: true,
      content: {
        eyebrow: 'Education',
        krEyebrow: '학력 사항',
        title: 'Education',
        accent: '',
        description: 'Where I studied and what I studied.',
      },
    },
    {
      sectionKey: 'experience',
      sortOrder: 2,
      isEnabled: true,
      content: {
        eyebrow: 'Experience',
        krEyebrow: '경력 사항',
        title: 'Experience',
        accent: '',
        description: 'Roles I have held, and what I worked on.',
      },
    },
    {
      sectionKey: 'skills',
      sortOrder: 3,
      isEnabled: true,
      content: {
        eyebrow: 'Skills',
        krEyebrow: '기술 스택',
        title: 'Skills',
        accent: '',
        description: 'The languages, frameworks and tools I work with.',
      },
    },
    {
      sectionKey: 'interests',
      sortOrder: 4,
      isEnabled: true,
      content: {
        eyebrow: 'Interests',
        title: 'Interests',
        accent: '',
        description: 'Things I do when I am not working.',
      },
    },
    {
      sectionKey: 'socials',
      sortOrder: 5,
      isEnabled: true,
      content: {
        eyebrow: 'Elsewhere',
        title: 'Elsewhere online',
        accent: '',
      },
    },
    {
      sectionKey: 'github',
      sortOrder: 6,
      isEnabled: true,
      content: {
        eyebrow: 'Activity',
        krEyebrow: '깃허브',
        title: 'Recent activity',
        accent: '',
        ctaLabel: 'GitHub activity',
        ctaHref: '/about/github',
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
        eyebrow: 'Media',
        krEyebrow: '미디어 기록',
        title: 'Media',
        accent: '',
        description: 'Music, films, anime and manga I keep coming back to.',
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
        eyebrow: 'Contact',
        krEyebrow: '직접 연락',
        title: 'Contact',
        accent: '',
        description: 'Open to engineering roles, client work and collaborations.',
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
