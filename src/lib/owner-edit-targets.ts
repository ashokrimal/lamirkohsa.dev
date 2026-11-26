/**
 * Where a public page's content is edited in the studio.
 *
 * This is chrome, not content: the mapping is code-owned like the routes
 * themselves. A page with no entry simply shows no edit affordance rather than
 * linking to a random collection.
 */

export interface EditTarget {
  label: string
  href: string
}

const STATIC_TARGETS: Record<string, EditTarget[]> = {
  '/': [
    { label: 'Homepage sections', href: '/admin?section=homepage' },
    { label: 'Hero', href: '/admin?section=hero' },
    { label: 'Site settings', href: '/admin/site-settings' },
  ],
  '/about': [
    { label: 'Pages & sections', href: '/admin/pages' },
    { label: 'Profile', href: '/admin/meta' },
  ],
  '/about/gallery': [{ label: 'Gallery', href: '/admin/gallery' }],
  '/about/github': [{ label: 'GitHub', href: '/admin/github' }],
  '/projects': [{ label: 'Projects', href: '/admin/projects' }],
  '/blogs': [{ label: 'Journal', href: '/admin/blogs' }],
  '/media': [{ label: 'Media', href: '/admin/media' }],
  '/media/music': [{ label: 'Music', href: '/admin/media/music' }],
  '/media/movies': [{ label: 'Films', href: '/admin/media/movies' }],
  '/media/anime': [{ label: 'Anime', href: '/admin/media/anime' }],
  '/media/manga': [{ label: 'Manga', href: '/admin/media/manga' }],
  '/experience': [{ label: 'Experience', href: '/admin/career' }],
  '/education': [{ label: 'Education', href: '/admin/career' }],
  '/skills': [{ label: 'Skills', href: '/admin/career' }],
  '/certificates': [{ label: 'Certificates', href: '/admin/career' }],
  '/contact': [{ label: 'Contact details', href: '/admin/site-settings' }],
}

/** Longest prefix first, so `/projects/foo` resolves to the projects vault. */
const PREFIX_TARGETS: Array<[string, EditTarget[]]> = [
  ['/projects/', [{ label: 'Projects', href: '/admin/projects' }, { label: 'Case studies', href: '/admin/work' }]],
  ['/blogs/', [{ label: 'Journal', href: '/admin/blogs' }]],
]

export function editTargetsForPath(pathname: string): EditTarget[] {
  const path = pathname.replace(/\/+$/, '') || '/'
  const exact = STATIC_TARGETS[path]
  if (exact) return exact

  for (const [prefix, targets] of PREFIX_TARGETS) {
    if (path.startsWith(prefix)) return targets
  }

  return []
}
