/**
 * The CMS contract.
 *
 * This file is the single description of:
 * - every collection the public site reads,
 * - the locked key used to find keyed records (Site Settings, Page Copy,
 *   Media Collections),
 * - which payload fields are required and optional,
 * - the deliberate empty state each public section renders.
 *
 * Structure and routes live in code. Copy and media live in the CMS. Nothing in
 * this file is shown to visitors except the empty-state messages, which are part
 * of the page structure rather than CMS content.
 */

/** A public CMS read always distinguishes success, empty content and failure. */
export type CmsResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string }

export type CmsFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'url'
  | 'image'
  | 'array'
  | 'object'

export interface CmsFieldDefinition {
  key: string
  label: string
  type: CmsFieldType
  required?: boolean
}

export interface CmsEmptyState {
  message: string
  hint?: string
  actionLabel?: string
  actionHref?: string
}

export interface CmsRecordDefinition {
  /** Locked lookup key stored as `payload.key`. */
  key: string
  label: string
  /** Structural route for records that render a fixed public section. */
  route?: string
  /** Collection that supplies this record's items, when it is a section config. */
  collection?: string
  /** Missing required records block the health check. */
  required?: boolean
  requiredFields: readonly CmsFieldDefinition[]
  optionalFields: readonly CmsFieldDefinition[]
  emptyState: CmsEmptyState
}

export interface CmsCollectionDefinition {
  name: string
  label: string
  keyed: boolean
  required?: boolean
  records?: Record<string, CmsRecordDefinition>
  requiredFields?: readonly CmsFieldDefinition[]
  optionalFields?: readonly CmsFieldDefinition[]
  emptyState: CmsEmptyState
}

export interface CmsSectionDefinition {
  label: string
  collection: string
  emptyState: CmsEmptyState
}

export interface CmsSchema {
  collections: Record<string, CmsCollectionDefinition>
  sections: {
    home: Record<string, CmsSectionDefinition>
    pages: Record<string, CmsSectionDefinition>
  }
}

const text = (key: string, label: string, required = false): CmsFieldDefinition => ({
  key,
  label,
  type: 'text',
  required,
})
const url = (key: string, label: string, required = false): CmsFieldDefinition => ({
  key,
  label,
  type: 'url',
  required,
})
const image = (key: string, label: string, required = false): CmsFieldDefinition => ({
  key,
  label,
  type: 'image',
  required,
})
const array = (key: string, label: string, required = false): CmsFieldDefinition => ({
  key,
  label,
  type: 'array',
  required,
})
const object = (key: string, label: string): CmsFieldDefinition => ({
  key,
  label,
  type: 'object',
})

/** Collection names used by server code, seeds and the health check. */
export const CMS_COLLECTIONS = {
  siteSettings: 'Site Settings',
  pageCopy: 'Page Copy',
  mediaCollections: 'Media Collections',
  profile: 'Profile',
  projects: 'Projects',
  gallery: 'Gallery',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  certificates: 'Certificates',
  socialLinks: 'Social Links',
  interests: 'Interests',
  blogs: 'Blogs',
  music: 'Music',
  movies: 'Movies',
  anime: 'Anime',
  manga: 'Manga',
} as const

/** Locked keys used by keyed collections. */
export const CMS_KEYS = {
  navigation: 'navigation',
  footer: 'footer',
  brand: 'brand',
  contactDetails: 'contact-details',
  hero: 'hero-section',
  homepageSections: 'homepage-sections',
  about: 'about',
  projects: 'projects',
  projectCaseStudy: 'project-case-study',
  media: 'media',
  mediaMusic: 'media-music',
  mediaFilms: 'media-films',
  mediaAnime: 'media-anime',
  mediaManga: 'media-manga',
  mediaGithub: 'media-github',
  journal: 'journal',
  gallery: 'gallery',
  contact: 'contact',
  experience: 'experience',
  education: 'education',
  skills: 'skills',
  certificates: 'certificates',
  resume: 'resume',
  music: 'music',
  movies: 'movies',
  anime: 'anime',
  manga: 'manga',
} as const

const PAGE_COPY_KEYS = [
  CMS_KEYS.about,
  CMS_KEYS.projects,
  CMS_KEYS.projectCaseStudy,
  CMS_KEYS.media,
  CMS_KEYS.mediaMusic,
  CMS_KEYS.mediaFilms,
  CMS_KEYS.mediaAnime,
  CMS_KEYS.mediaManga,
  CMS_KEYS.mediaGithub,
  CMS_KEYS.journal,
  CMS_KEYS.gallery,
  CMS_KEYS.contact,
  CMS_KEYS.experience,
  CMS_KEYS.education,
  CMS_KEYS.skills,
  CMS_KEYS.certificates,
  CMS_KEYS.resume,
] as const

const copyFields = (): CmsFieldDefinition[] => [
  text('eyebrow', 'Eyebrow'),
  text('krEyebrow', 'Korean eyebrow'),
  text('title', 'Title'),
  text('accent', 'Accent'),
  text('description', 'Description'),
  object('sections', 'Named sub-sections'),
  text('seoTitle', 'SEO title'),
  text('seoDescription', 'SEO description'),
  image('ogImage', 'Social sharing image'),
]

function pageCopyRecord(key: string, label: string, titleRequired = true): CmsRecordDefinition {
  return {
    key,
    label,
    required: false,
    requiredFields: titleRequired ? [text('title', 'Title', true)] : [],
    optionalFields: copyFields(),
    emptyState: {
      message: `${label} copy is not published yet.`,
      hint: 'Add the page copy in the CMS to fill this page heading.',
      actionLabel: 'Edit page copy in admin',
      actionHref: `/admin?section=content&collection=${encodeURIComponent('Page Copy')}`,
    },
  }
}

/**
 * The complete CMS schema. Getters, seed/migration scripts and the health check
 * import this object rather than carrying their own collection lists.
 */
export const CMS_SCHEMA: CmsSchema = {
  collections: {
    siteSettings: {
      name: CMS_COLLECTIONS.siteSettings,
      label: 'Site Settings',
      keyed: true,
      required: true,
      records: {
        navigation: {
          key: CMS_KEYS.navigation,
          label: 'Navigation',
          required: true,
          requiredFields: [array('primary', 'Primary navigation', true)],
          optionalFields: [
            array('footer', 'Footer navigation'),
            array('collections', 'Footer collections'),
            array('socials', 'Social links'),
          ],
          emptyState: {
            message: 'Navigation is not published yet.',
            hint: 'Add primary, footer and social links in the CMS.',
            actionLabel: 'Edit navigation in admin',
            actionHref: '/admin?section=subpage',
          },
        },
        footer: {
          key: CMS_KEYS.footer,
          label: 'Footer',
          required: true,
          requiredFields: [],
          optionalFields: [
            text('tagline', 'Tagline'),
            text('availabilityLabel', 'Availability label'),
            text('availabilityText', 'Availability text'),
            text('ctaLabel', 'Call-to-action label'),
            url('ctaHref', 'Call-to-action link'),
            text('copyrightName', 'Copyright name'),
            text('canonical', 'Canonical domain'),
          ],
          emptyState: {
            message: 'Footer copy is not published yet.',
            hint: 'Add the footer tagline and links in the CMS.',
            actionLabel: 'Edit footer in admin',
            actionHref: '/admin?section=appearance',
          },
        },
        brand: {
          key: CMS_KEYS.brand,
          label: 'Brand',
          required: true,
          requiredFields: [text('name', 'Name', true)],
          optionalFields: [
            text('korean', 'Korean name'),
            text('role', 'Role line'),
            text('domain', 'Domain'),
          ],
          emptyState: {
            message: 'Brand details are not published yet.',
            hint: 'Add the site name in the CMS.',
            actionLabel: 'Edit brand in admin',
            actionHref: '/admin?section=content&collection=Site%20Settings',
          },
        },
        contactDetails: {
          key: CMS_KEYS.contactDetails,
          label: 'Contact Details',
          required: true,
          requiredFields: [],
          optionalFields: [
            text('location', 'Location'),
            text('timeZone', 'IANA time zone'),
            text('timezoneLabel', 'Time zone label'),
            text('availability', 'Availability'),
            text('email', 'Email'),
            text('phone', 'Phone'),
            text('responseTime', 'Response-time promise'),
            { key: 'formEnabled', label: 'Contact form enabled', type: 'boolean' },
          ],
          emptyState: {
            message: 'Contact details are not published yet.',
            hint: 'Add an email or location in the CMS.',
            actionLabel: 'Edit contact details in admin',
            actionHref: '/admin?section=content&collection=Site%20Settings',
          },
        },
        hero: {
          key: CMS_KEYS.hero,
          label: 'Hero Section',
          required: true,
          requiredFields: [text('heading', 'Heading', true)],
          optionalFields: [
            text('subtitle', 'Subtitle'),
            text('location', 'Location'),
            text('initials', 'Initials'),
            image('imageUrl', 'Hero image'),
            text('imageAlt', 'Hero image alt text'),
          ],
          emptyState: {
            message: 'Hero text is not published yet.',
            hint: 'Add the headline and intro in Hero & Footer.',
            actionLabel: 'Edit hero in admin',
            actionHref: '/admin?section=appearance',
          },
        },
        homepageSections: {
          key: CMS_KEYS.homepageSections,
          label: 'Homepage Sections',
          required: true,
          requiredFields: [array('order', 'Section order', true)],
          optionalFields: [object('enabled', 'Visibility'), object('sectionMeta', 'Section copy')],
          emptyState: {
            message: 'Homepage structure is not configured yet.',
            hint: 'Add the section order in the CMS.',
            actionLabel: 'Edit homepage sections in admin',
            actionHref: '/admin?section=content&collection=Site%20Settings',
          },
        },
      },
      emptyState: {
        message: 'Site settings are not published yet.',
        hint: 'Add navigation, brand, footer and hero records in the CMS.',
        actionLabel: 'Open Site Settings in admin',
        actionHref: '/admin?section=content&collection=Site%20Settings',
      },
    },

    pageCopy: {
      name: CMS_COLLECTIONS.pageCopy,
      label: 'Page Copy',
      keyed: true,
      required: false,
      records: Object.fromEntries(
        PAGE_COPY_KEYS.map((key) => [
          key,
          pageCopyRecord(key, key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), key !== CMS_KEYS.projectCaseStudy),
        ]),
      ),
      emptyState: {
        message: 'Page copy is not published yet.',
        hint: 'Add page copy records in the CMS.',
        actionLabel: 'Edit page copy in admin',
        actionHref: '/admin?section=content&collection=Page%20Copy',
      },
    },

    mediaCollections: {
      name: CMS_COLLECTIONS.mediaCollections,
      label: 'Media Collections',
      keyed: true,
      required: false,
      records: {
        music: {
          key: CMS_KEYS.music,
          label: 'Music',
          route: '/media/music',
          collection: 'Music',
          requiredFields: [],
          optionalFields: [
            text('number', 'Number'),
            text('label', 'Label'),
            text('kr', 'Korean label'),
            text('description', 'Description'),
            url('href', 'Route'),
            { key: 'previewCount', label: 'Preview count', type: 'number' },
          ],
          emptyState: {
            message: 'No music published yet.',
            hint: 'Add music items from the CMS.',
            actionLabel: 'Add music in admin',
            actionHref: `/admin?section=content&collection=${encodeURIComponent('Music')}`,
          },
        },
        movies: {
          key: CMS_KEYS.movies,
          label: 'Movies',
          route: '/media/movies',
          collection: 'Movies',
          requiredFields: [],
          optionalFields: [
            text('number', 'Number'),
            text('label', 'Label'),
            text('kr', 'Korean label'),
            text('description', 'Description'),
            url('href', 'Route'),
            { key: 'previewCount', label: 'Preview count', type: 'number' },
          ],
          emptyState: {
            message: 'No movies published yet.',
            hint: 'Add movie items from the CMS.',
            actionLabel: 'Add movies in admin',
            actionHref: `/admin?section=content&collection=${encodeURIComponent('Movies')}`,
          },
        },
        anime: {
          key: CMS_KEYS.anime,
          label: 'Anime',
          route: '/media/anime',
          collection: 'Anime',
          requiredFields: [],
          optionalFields: [
            text('number', 'Number'),
            text('label', 'Label'),
            text('kr', 'Korean label'),
            text('description', 'Description'),
            url('href', 'Route'),
            { key: 'previewCount', label: 'Preview count', type: 'number' },
          ],
          emptyState: {
            message: 'No anime published yet.',
            hint: 'Add anime items from the CMS.',
            actionLabel: 'Add anime in admin',
            actionHref: `/admin?section=content&collection=${encodeURIComponent('Anime')}`,
          },
        },
        manga: {
          key: CMS_KEYS.manga,
          label: 'Manga',
          route: '/media/manga',
          collection: 'Manga',
          requiredFields: [],
          optionalFields: [
            text('number', 'Number'),
            text('label', 'Label'),
            text('kr', 'Korean label'),
            text('description', 'Description'),
            url('href', 'Route'),
            { key: 'previewCount', label: 'Preview count', type: 'number' },
          ],
          emptyState: {
            message: 'No manga published yet.',
            hint: 'Add manga items from the CMS.',
            actionLabel: 'Add manga in admin',
            actionHref: `/admin?section=content&collection=${encodeURIComponent('Manga')}`,
          },
        },
      },
      emptyState: {
        message: 'Media collections are not configured yet.',
        hint: 'Add music, movies, anime and manga records in the CMS.',
        actionLabel: 'Edit media collections in admin',
        actionHref: '/admin?section=content&collection=Media%20Collections',
      },
    },

    profile: {
      name: CMS_COLLECTIONS.profile,
      label: 'Profile',
      keyed: false,
      requiredFields: [],
      optionalFields: [
        text('fullName', 'Full name'),
        text('headline', 'Headline'),
        text('summary', 'Summary'),
        text('bio', 'Biography'),
        text('location', 'Location'),
        text('availability', 'Availability'),
        text('focus', 'Focus'),
        text('email', 'Email'),
        image('avatarUrl', 'Avatar'),
        text('github', 'GitHub username'),
        array('interests', 'Interests'),
      ],
      emptyState: {
        message: 'No introduction published yet.',
        hint: 'Add your profile, summary and bio in the CMS.',
        actionLabel: 'Add introduction in admin',
        actionHref: `/admin?section=content&collection=${encodeURIComponent('Profile')}`,
      },
    },

    projects: {
      name: CMS_COLLECTIONS.projects,
      label: 'Projects',
      keyed: false,
      requiredFields: [
        text('summary', 'Summary', true),
        text('description', 'Description', true),
        image('imageUrl', 'Image', true),
      ],
      optionalFields: [
        text('category', 'Category'),
        text('altText', 'Image alt text'),
        text('completionDate', 'Completion date'),
        text('period', 'Period'),
        text('duration', 'Duration'),
        text('status', 'Status'),
        text('model', 'Process / SDLC model'),
        text('cost', 'Project cost'),
        text('challenge', 'Challenge'),
        text('solution', 'Solution'),
        text('caseStudyPlan', 'Case study plan'),
        text('documentation', 'Documentation (Markdown)'),
        text('srsDoc', 'Planning — SRS / PRD (Markdown)'),
        text('architectureDoc', 'Architecture — System Design (Markdown)'),
        text('apiDoc', 'Development — API Docs (Markdown)'),
        text('readmeDoc', 'Development — README & Setup (Markdown)'),
        text('testPlanDoc', 'Testing — Test Plan & QA (Markdown)'),
        text('runbookDoc', 'Operations — Deployment & Runbook (Markdown)'),
        text('userManualDoc', 'End-User — Manual & Release Notes (Markdown)'),
        array('features', 'Features'),
        array('techStack', 'Tech stack'),
        array('phases', 'Phases'),
        text('github', 'Source URL'),
        text('live', 'Live URL'),
      ],
      emptyState: {
        message: 'No projects published yet',
        hint: 'Add a project in the CMS to show it here.',
        actionLabel: 'Add a project in admin',
        actionHref: '/admin?section=projects',
      },
    },

    gallery: {
      name: CMS_COLLECTIONS.gallery,
      label: 'Gallery',
      keyed: false,
      requiredFields: [text('imageUrl', 'Image', true)],
      optionalFields: [text('altText', 'Alt text'), text('category', 'Category'), text('description', 'Description'), text('location', 'Location')],
      emptyState: {
        message: 'No gallery images published yet.',
        hint: 'Upload photos to show them here.',
        actionLabel: 'Add images in admin',
        actionHref: `/admin?section=content&collection=${encodeURIComponent('Gallery')}`,
      },
    },

    experience: {
      name: CMS_COLLECTIONS.experience,
      label: 'Experience',
      keyed: false,
      requiredFields: [text('organization', 'Organization', true), text('period', 'Period', true)],
      optionalFields: [text('location', 'Location'), text('description', 'Description'), array('highlights', 'Highlights')],
      emptyState: {
        message: 'No experience published yet',
        hint: 'Add a role in the CMS to show it on the timeline.',
        actionLabel: 'Add experience in admin',
        actionHref: `/admin?section=content&collection=${encodeURIComponent('Experience')}`,
      },
    },

    education: {
      name: CMS_COLLECTIONS.education,
      label: 'Education',
      keyed: false,
      requiredFields: [text('organization', 'Organization', true), text('period', 'Period', true)],
      optionalFields: [text('location', 'Location'), text('description', 'Description'), array('highlights', 'Highlights')],
      emptyState: {
        message: 'No education published yet',
        hint: 'Add a qualification in the CMS to show it on the timeline.',
        actionLabel: 'Add education in admin',
        actionHref: `/admin?section=content&collection=${encodeURIComponent('Education')}`,
      },
    },

    skills: {
      name: CMS_COLLECTIONS.skills,
      label: 'Skills',
      keyed: false,
      requiredFields: [array('items', 'Skill items', true)],
      optionalFields: [text('category', 'Category'), text('level', 'Level')],
      emptyState: {
        message: 'No skills published yet.',
        hint: 'Add a skill group in the CMS.',
        actionLabel: 'Add skills in admin',
        actionHref: `/admin?section=content&collection=Skills`,
      },
    },

    certificates: {
      name: CMS_COLLECTIONS.certificates,
      label: 'Certificates',
      keyed: false,
      requiredFields: [text('organization', 'Organization', true)],
      optionalFields: [
        text('date', 'Date'),
        text('credentialUrl', 'Credential URL'),
        text('credentialId', 'Credential ID'),
        text('description', 'Description'),
      ],
      emptyState: {
        message: 'No certificates published yet.',
        hint: 'Add a credential in the CMS.',
        actionLabel: 'Add certificates in admin',
        actionHref: `/admin?section=content&collection=Certificates`,
      },
    },

    socialLinks: {
      name: CMS_COLLECTIONS.socialLinks,
      label: 'Social Links',
      keyed: false,
      requiredFields: [text('label', 'Label', true), url('href', 'Link', true)],
      optionalFields: [text('handle', 'Handle')],
      emptyState: {
        message: 'No social links published yet.',
        hint: 'Add a social link in the CMS.',
        actionLabel: 'Add social links in admin',
        actionHref: `/admin?section=content&collection=Social%20Links`,
      },
    },

    interests: {
      name: CMS_COLLECTIONS.interests,
      label: 'Interests',
      keyed: false,
      requiredFields: [text('label', 'Label', true)],
      optionalFields: [],
      emptyState: {
        message: 'No interests published yet.',
        hint: 'Add an interest in the CMS.',
        actionLabel: 'Add interests in admin',
        actionHref: `/admin?section=content&collection=Interests`,
      },
    },

    blogs: {
      name: CMS_COLLECTIONS.blogs,
      label: 'Blogs',
      keyed: false,
      requiredFields: [text('content', 'Content', true)],
      optionalFields: [text('description', 'Description'), text('category', 'Category'), text('date', 'Date'), text('imageUrl', 'Image')],
      emptyState: {
        message: 'No journal entries published yet.',
        hint: 'Add a note in the CMS to start the journal.',
        actionLabel: 'Add a note in admin',
        actionHref: `/admin?section=content&collection=Blogs`,
      },
    },

    media: {
      name: CMS_COLLECTIONS.music,
      label: 'Media item',
      keyed: false,
      requiredFields: [],
      optionalFields: [
        text('artist', 'Artist'),
        text('subtitle', 'Subtitle'),
        text('creator', 'Creator'),
        text('description', 'Description'),
        text('coverUrl', 'Cover'),
        text('imageUrl', 'Image'),
        text('rating', 'Rating'),
        text('status', 'Status'),
        url('externalUrl', 'External link'),
      ],
      emptyState: {
        message: 'No media items published yet.',
        hint: 'Add music, movies, anime or manga from the admin.',
        actionLabel: 'Add media in admin',
        actionHref: `/admin?section=content&collection=${encodeURIComponent('Music')}`,
      },
    },
  },

  sections: {
    home: {
      about: {
        label: 'Introduction',
        collection: CMS_COLLECTIONS.profile,
        emptyState: {
          message: 'No introduction published yet.',
          hint: 'Add your profile, summary and bio in the CMS.',
          actionLabel: 'Add introduction in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Profile')}`,
        },
      },
      gallery: {
        label: 'Gallery',
        collection: CMS_COLLECTIONS.gallery,
        emptyState: {
          message: 'No gallery images published yet.',
          hint: 'Upload photos to show them here.',
          actionLabel: 'Add images in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Gallery')}`,
        },
      },
      blogArticle: {
        label: 'Journal note',
        collection: CMS_COLLECTIONS.blogs,
        emptyState: {
          message: 'This note has no body yet.',
          hint: 'Add the article text in the CMS to publish the full note.',
          actionLabel: 'Edit this note in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Blogs')}`,
        },
      },
      experience: {
        label: 'Experience',
        collection: CMS_COLLECTIONS.experience,
        emptyState: {
          message: 'No experience published yet',
          hint: 'Add a role in the CMS to show it on the timeline.',
          actionLabel: 'Add experience in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Experience')}`,
        },
      },
      education: {
        label: 'Education',
        collection: CMS_COLLECTIONS.education,
        emptyState: {
          message: 'No education published yet',
          hint: 'Add a qualification in the CMS to show it on the timeline.',
          actionLabel: 'Add education in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Education')}`,
        },
      },
      projects: {
        label: 'Projects',
        collection: CMS_COLLECTIONS.projects,
        emptyState: {
          message: 'No projects published yet',
          hint: 'Published projects appear here and on the projects page.',
          actionLabel: 'Add a project in admin',
          actionHref: '/admin?section=projects',
        },
      },
      media: {
        label: 'Media',
        collection: CMS_COLLECTIONS.mediaCollections,
        emptyState: {
          message: 'No media items published yet.',
          hint: 'Add music, movies, anime or manga from the admin.',
          actionLabel: 'Add media in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Music')}`,
        },
      },
      github: {
        label: 'GitHub',
        collection: CMS_COLLECTIONS.profile,
        emptyState: {
          message: 'GitHub status is not connected yet.',
          hint: 'Set your GitHub username in admin settings to show activity here.',
          actionLabel: 'Connect GitHub in admin',
          actionHref: '/admin?section=settings',
        },
      },
    },
    pages: {
      about: {
        label: 'About',
        collection: CMS_COLLECTIONS.profile,
        emptyState: {
          message: 'No introduction published yet.',
          hint: 'Add your profile, summary and bio in the CMS.',
          actionLabel: 'Add introduction in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Profile')}`,
        },
      },
      projects: {
        label: 'Projects',
        collection: CMS_COLLECTIONS.projects,
        emptyState: {
          message: 'No projects published yet',
          hint: 'Add a project in the CMS to show it here.',
          actionLabel: 'Add a project in admin',
          actionHref: '/admin?section=projects',
        },
      },
      gallery: {
        label: 'Gallery',
        collection: CMS_COLLECTIONS.gallery,
        emptyState: {
          message: 'No gallery images published yet.',
          hint: 'Upload images to the gallery collection.',
          actionLabel: 'Add images in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Gallery')}`,
        },
      },
      blogs: {
        label: 'Journal',
        collection: CMS_COLLECTIONS.blogs,
        emptyState: {
          message: 'No journal entries published yet.',
          hint: 'Add a note in the CMS to start the journal.',
          actionLabel: 'Add a note in admin',
          actionHref: `/admin?section=content&collection=Blogs`,
        },
      },
      experience: {
        label: 'Experience',
        collection: CMS_COLLECTIONS.experience,
        emptyState: {
          message: 'No experience published yet',
          hint: 'Add a role in the CMS to show it on the timeline.',
          actionLabel: 'Add experience in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Experience')}`,
        },
      },
      education: {
        label: 'Education',
        collection: CMS_COLLECTIONS.education,
        emptyState: {
          message: 'No education published yet',
          hint: 'Add a qualification in the CMS to show it on the timeline.',
          actionLabel: 'Add education in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Education')}`,
        },
      },
      skills: {
        label: 'Skills',
        collection: CMS_COLLECTIONS.skills,
        emptyState: {
          message: 'No skills published yet.',
          hint: 'Add a skill group in the CMS.',
          actionLabel: 'Add skills in admin',
          actionHref: `/admin?section=content&collection=Skills`,
        },
      },
      certificates: {
        label: 'Certificates',
        collection: CMS_COLLECTIONS.certificates,
        emptyState: {
          message: 'No certificates published yet.',
          hint: 'Add a credential in the CMS.',
          actionLabel: 'Add certificates in admin',
          actionHref: `/admin?section=content&collection=Certificates`,
        },
      },
      resume: {
        label: 'Résumé',
        collection: CMS_COLLECTIONS.profile,
        emptyState: {
          message: 'No résumé content published yet.',
          hint: 'Add profile, experience and education records in the CMS.',
          actionLabel: 'Add résumé content in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Profile')}`,
        },
      },
      contact: {
        label: 'Contact',
        collection: CMS_COLLECTIONS.siteSettings,
        emptyState: {
          message: 'Contact details are not published yet.',
          hint: 'Add an email or location in the CMS.',
          actionLabel: 'Edit contact details in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Site Settings')}`,
        },
      },
      media: {
        label: 'Media',
        collection: CMS_COLLECTIONS.mediaCollections,
        emptyState: {
          message: 'No media published yet.',
          hint: 'Add music, movies, anime or manga from the admin.',
          actionLabel: 'Add media in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Music')}`,
        },
      },
      music: {
        label: 'Music',
        collection: CMS_COLLECTIONS.music,
        emptyState: {
          message: 'No music published yet.',
          hint: 'Add music items from the CMS.',
          actionLabel: 'Add music in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Music')}`,
        },
      },
      movies: {
        label: 'Movies',
        collection: CMS_COLLECTIONS.movies,
        emptyState: {
          message: 'No movies published yet.',
          hint: 'Add movie items from the CMS.',
          actionLabel: 'Add movies in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Movies')}`,
        },
      },
      anime: {
        label: 'Anime',
        collection: CMS_COLLECTIONS.anime,
        emptyState: {
          message: 'No anime published yet.',
          hint: 'Add anime items from the CMS.',
          actionLabel: 'Add anime in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Anime')}`,
        },
      },
      manga: {
        label: 'Manga',
        collection: CMS_COLLECTIONS.manga,
        emptyState: {
          message: 'No manga published yet.',
          hint: 'Add manga items from the CMS.',
          actionLabel: 'Add manga in admin',
          actionHref: `/admin?section=content&collection=${encodeURIComponent('Manga')}`,
        },
      },
    },
  },
}

/** A helper for keyed collections so callers never hand-maintain key lists. */
export const CMS_PAGE_COPY_KEYS = PAGE_COPY_KEYS

export const CMS_MEDIA_COLLECTIONS = {
  music: CMS_COLLECTIONS.music,
  movies: CMS_COLLECTIONS.movies,
  anime: CMS_COLLECTIONS.anime,
  manga: CMS_COLLECTIONS.manga,
} as const

export function cmsFieldsFor(collectionKey: string): readonly CmsFieldDefinition[] {
  const collection = CMS_SCHEMA.collections[collectionKey]
  if (!collection) return []
  return [...(collection.requiredFields ?? []), ...(collection.optionalFields ?? [])]
}

/** Media collection records, typed without the optional `records` guard. */
export const CMS_MEDIA_RECORDS = CMS_SCHEMA.collections.mediaCollections.records ?? {}

/** Site Settings records, typed without the optional `records` guard. */
export const CMS_SETTINGS_RECORDS = CMS_SCHEMA.collections.siteSettings.records ?? {}

/**
 * One structural section: its identity, route, renderer, the collection that
 * fills it, and the empty state it shows when that collection has no published
 * records. Section numbers are positional, so they can never gap.
 */
export interface SiteSectionDefinition extends CmsSectionDefinition {
  id: string
  route: string
  component: string
}

/**
 * The homepage, in the order it always renders. Structure is owned here; the CMS
 * only supplies each section's copy and records. Adding or removing a section is
 * a code change, never a CMS edit.
 */
export const SECTIONS: readonly SiteSectionDefinition[] = [
  {
    id: 'about',
    route: '/about',
    component: 'HomeIntroduction',
    ...CMS_SCHEMA.sections.home.about,
  },
  {
    id: 'gallery',
    route: '/about/gallery',
    component: 'HomeGallery',
    ...CMS_SCHEMA.sections.home.gallery,
  },
  {
    id: 'experience',
    route: '/experience',
    component: 'HomeExperience',
    ...CMS_SCHEMA.sections.home.experience,
  },
  {
    id: 'education',
    route: '/education',
    component: 'HomeEducation',
    ...CMS_SCHEMA.sections.home.education,
  },
  {
    id: 'projects',
    route: '/projects',
    component: 'HomeProjects',
    ...CMS_SCHEMA.sections.home.projects,
  },
  {
    id: 'media',
    route: '/media',
    component: 'HomeMedia',
    ...CMS_SCHEMA.sections.home.media,
  },
  {
    id: 'github',
    route: '/about/github',
    component: 'HomeGitHub',
    ...CMS_SCHEMA.sections.home.github,
  },
]

/** The about page's numbered blocks, in render order. */
export const ABOUT_SECTIONS: readonly SiteSectionDefinition[] = [
  {
    id: 'education',
    route: '/about#education',
    component: 'AboutEducation',
    ...CMS_SCHEMA.sections.pages.education,
  },
  {
    id: 'experience',
    route: '/about#experience',
    component: 'AboutExperience',
    ...CMS_SCHEMA.sections.pages.experience,
  },
  {
    id: 'skills',
    route: '/about#skills',
    component: 'AboutSkills',
    ...CMS_SCHEMA.sections.pages.skills,
  },
  {
    id: 'interests',
    route: '/about#interests',
    component: 'AboutInterests',
    label: 'Interests',
    collection: CMS_COLLECTIONS.interests,
    emptyState: CMS_SCHEMA.collections.interests.emptyState,
  },
  {
    id: 'socials',
    route: '/about#socials',
    component: 'AboutSocials',
    label: 'Social Links',
    collection: CMS_COLLECTIONS.socialLinks,
    emptyState: CMS_SCHEMA.collections.socialLinks.emptyState,
  },
  {
    id: 'github',
    route: '/about#github',
    component: 'AboutGitHub',
    ...CMS_SCHEMA.sections.home.github,
  },
]

/** Zero-based position in a section registry, rendered as `01`, `02`, ... */
export function sectionNumber(index: number): string {
  return String(Math.max(0, index) + 1).padStart(2, '0')
}

/** Removes a hand-typed numeric prefix from CMS eyebrow copy. */
export function stripSectionNumber(eyebrow?: string): string | undefined {
  if (!eyebrow) return undefined
  const label = eyebrow.replace(/^\s*\d{1,2}\s*[\/\u00b7|\u2014\u2013-]\s*/, '').trim()
  return label || undefined
}

/**
 * The eyebrow a section actually shows: its registry position plus the CMS label
 * with any hand-typed prefix removed.
 */
export function withSectionNumber(index: number, eyebrow?: string): string {
  const label = stripSectionNumber(eyebrow)
  return label ? `${sectionNumber(index)} / ${label}` : sectionNumber(index)
}

export type NavGroup = 'primary' | 'footer' | 'collections'

export interface NavPageDefinition {
  id: string
  route: string
  label: string
  kr: string
  groups: readonly NavGroup[]
  /** Shown when the CMS has no navigation record yet. */
  defaultVisible: boolean
}

/**
 * Every route the site owns. The CMS controls which of these appear in the nav;
 * it can never invent a route or replace a label.
 */
export const NAV_PAGES: readonly NavPageDefinition[] = [
  { id: 'home', route: '/', label: 'Home', kr: '\ud648', groups: ['primary', 'footer'], defaultVisible: true },
  { id: 'about', route: '/about', label: 'About', kr: '\uc18c\uac1c', groups: ['primary', 'footer'], defaultVisible: true },
  { id: 'media', route: '/media', label: 'Media', kr: '\ubbf8\ub514\uc5b4', groups: ['primary', 'footer'], defaultVisible: true },
  { id: 'projects', route: '/projects', label: 'Projects', kr: '\uc791\uc5c5', groups: ['primary', 'footer'], defaultVisible: true },
  { id: 'contact', route: '/contact', label: 'Contact', kr: '\uc5f0\ub77d\ucc98', groups: ['primary', 'footer'], defaultVisible: true },
  { id: 'journal', route: '/blogs', label: 'Journal', kr: '\uae00', groups: ['collections'], defaultVisible: true },
  { id: 'gallery', route: '/about/gallery', label: 'Gallery', kr: '\uc0ac\uc9c4', groups: ['collections'], defaultVisible: true },
  { id: 'music', route: '/media/music', label: 'Music archive', kr: '\uc74c\uc545', groups: ['collections'], defaultVisible: true },
  { id: 'movies', route: '/media/movies', label: 'Movies archive', kr: '\uc601\ud654', groups: ['collections'], defaultVisible: true },
  { id: 'anime', route: '/media/anime', label: 'Anime library', kr: '\uc560\ub2c8', groups: ['collections'], defaultVisible: true },
  { id: 'manga', route: '/media/manga', label: 'Manga library', kr: '\ub9cc\ud654', groups: ['collections'], defaultVisible: true },
  { id: 'github', route: '/about/github', label: 'GitHub activity', kr: '\uae43\ud5c8\ube0c', groups: ['collections'], defaultVisible: false },
  { id: 'experience', route: '/experience', label: 'Experience', kr: '\uacbd\ub825', groups: ['footer'], defaultVisible: false },
  { id: 'education', route: '/education', label: 'Education', kr: '\ud559\ub825', groups: ['footer'], defaultVisible: false },
  { id: 'skills', route: '/skills', label: 'Skills', kr: '\uae30\uc220', groups: ['footer'], defaultVisible: false },
  { id: 'certificates', route: '/certificates', label: 'Certificates', kr: '\uc790\uaca9\uc99d', groups: ['footer'], defaultVisible: false },
]

/** All routes the CMS may toggle into the navigation. */
export const NAV_ROUTES: ReadonlySet<string> = new Set(NAV_PAGES.map((page) => page.route))

/**
 * Builds a key-only lookup. Records without a locked key are ignored (and
 * reported by the health check), never matched by title or slug.
 */
export function indexCmsRecordsByKey<T extends { payload?: Record<string, unknown> }>(
  records: T[],
): Record<string, T> {
  const index: Record<string, T> = {}
  for (const record of records) {
    const key =
      typeof record.payload?.key === 'string' ? record.payload.key.trim().toLowerCase() : ''
    if (!key || index[key]) continue
    index[key] = record
  }
  return index
}
