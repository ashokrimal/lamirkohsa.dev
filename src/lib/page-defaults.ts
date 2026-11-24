/**
 * Default titles and descriptions for routes that have no Page Copy record in
 * the studio.
 *
 * The root layout supplies the site tagline for any page that sets no
 * description, which made every uncopied route share one snippet in search
 * results and social cards. Each entry gives its route a description of its own;
 * a CMS Page Copy record still overrides it once one exists.
 */
export type PageFallback = { title: string; description: string }

export const PAGE_DEFAULTS = {
  '/about/gallery': {
    title: 'Gallery',
    description:
      "Photographs from Ashok Rimal's travels, studio life and everyday frames, plus a live Instagram feed of recent work.",
  },
  '/about/github': {
    title: 'GitHub',
    description:
      "Repositories, languages and contribution history from Ashok Rimal's GitHub, read live through the GitHub API.",
  },
  '/media': {
    title: 'Media',
    description:
      'A curated listening rotation, film and anime shelf, and manga reading list — the media that shapes the work.',
  },
  '/media/music': {
    title: 'Music',
    description:
      "Ashok Rimal's listening rotation: albums, artists and tracks pulled from Last.fm and Spotify.",
  },
  '/media/movies': {
    title: 'Movies',
    description:
      'Films and series watched, rated and remembered — a running watchlist kept alongside the studio work.',
  },
  '/media/anime': {
    title: 'Anime',
    description:
      'Anime in rotation: seasons watched, ratings given, and the titles worth recommending.',
  },
  '/media/manga': {
    title: 'Manga',
    description:
      "Manga on the shelf — series in progress, completed runs, and what's queued next.",
  },
  '/experience': {
    title: 'Experience',
    description:
      "Ashok Rimal's professional experience: the roles held, the responsibilities carried, and the systems shipped along the way.",
  },
  '/education': {
    title: 'Education',
    description:
      "Ashok Rimal's academic background and coursework — the foundations behind a full-stack engineering practice.",
  },
  '/skills': {
    title: 'Skills',
    description:
      'The languages, frameworks and tools Ashok Rimal works with, grouped by how they are actually used.',
  },
  '/certificates': {
    title: 'Certificates',
    description:
      "Certifications and completed courses that back up Ashok Rimal's engineering practice.",
  },
} satisfies Record<string, PageFallback>
