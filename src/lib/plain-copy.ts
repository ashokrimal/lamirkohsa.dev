/**
 * Plain-language copy for the site's section headings and page titles.
 *
 * The shipped copy read like taglines ("Useful by design. Quietly ambitious.",
 * "Systems built with conviction."), which says nothing about what a section
 * holds. These values say what the section is. They are the defaults the app
 * renders, the values the studio fixtures seed, and what
 * `scripts/simplify-copy.mjs` writes into existing rows.
 *
 * No imports on purpose: `scripts/simplify-copy.mjs` transpiles this file in
 * memory so a plain Node script can read the same wording the app uses.
 */

export interface PlainSectionCopy {
  eyebrow: string
  title: string
  accent: string
  description?: string
}

export const PLAIN_SECTION_COPY: Record<string, PlainSectionCopy> = {
  introduction: {
    eyebrow: 'Introduction',
    title: 'A short introduction',
    accent: '',
    description: 'Who I am, what I build, and how to reach me.',
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Projects',
    accent: '',
    description: 'Case studies with the problem, what I built, and how it turned out.',
  },
  media: {
    eyebrow: 'Media',
    title: 'Media',
    accent: '',
    description: 'Music, films, anime and manga I keep coming back to.',
  },
  github: {
    eyebrow: 'Activity',
    title: 'Recent activity',
    accent: '',
    description: 'Public work in progress, straight from GitHub.',
  },
  education: {
    eyebrow: 'Education',
    title: 'Education',
    accent: '',
    description: 'Where I studied and what I studied.',
  },
  experience: {
    eyebrow: 'Experience',
    title: 'Experience',
    accent: '',
    description: 'Roles I have held, and what I worked on.',
  },
  skills: {
    eyebrow: 'Skills',
    title: 'Skills',
    accent: '',
    description: 'The languages, frameworks and tools I work with.',
  },
  interests: {
    eyebrow: 'Interests',
    title: 'Interests',
    accent: '',
    description: 'Things I do when I am not working.',
  },
  socials: {
    eyebrow: 'Elsewhere',
    title: 'Elsewhere online',
    accent: '',
  },
  instagram: {
    eyebrow: 'Social',
    title: 'Latest from Instagram',
    accent: '',
    description: 'New frames and outtakes, posted between gallery updates.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Contact',
    accent: '',
    description: 'Open to engineering roles, client work and collaborations.',
  },
}

export interface PlainPageCopy {
  eyebrow: string
  title: string
  accent: string
  description?: string
}

/** Keyed by the Page Copy record's `key` (the lowercased page name). */
export const PLAIN_PAGE_COPY: Record<string, PlainPageCopy> = {
  about: {
    eyebrow: 'About',
    title: 'About me',
    accent: '',
    description:
      'A full-stack software developer working on interfaces, backend systems and the details that make software feel human.',
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Projects',
    accent: '',
    description: 'Case studies from first sketch to production.',
  },
  media: {
    eyebrow: 'Media',
    title: 'Media',
    accent: '',
    description: 'Music, films, anime and manga I keep coming back to.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Contact',
    accent: '',
    description: 'Open to engineering roles, client work and collaborations.',
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'Gallery',
    accent: '',
    description: 'Photographs from travels, studio life and everyday frames.',
  },
  journal: {
    eyebrow: 'Journal',
    title: 'Journal',
    accent: '',
    description: 'Notes on interfaces, systems and the craft of building software.',
  },
}
