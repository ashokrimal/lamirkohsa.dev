import type { MetadataRoute } from 'next'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS, CMS_KEYS } from '@/lib/cms-schema'
import { getProjectsResult } from '@/lib/projects'
import { SITE_URL } from '@/lib/seo'
import {
  isSitemapPageSlug,
  newestOf,
  normalizeSitemapSlug,
  toLastModified,
} from '@/lib/sitemap'
import { toSlug } from '@/lib/slug'
import {
  getPublishedPagesForSitemap,
  getPublishedProjects,
  normalizePageSlug,
} from '@/lib/studio/data'

export const revalidate = 3600

/**
 * Every URL here is canonical: `/work` and `/work/<slug>` permanently redirect
 * to `/projects`, so they are not listed.
 *
 * `lastModified` policy: a URL is dated only from a row that actually backs it,
 * and never from the crawl time. Code-driven pages qualify because their copy is
 * CMS content — `/about`, `/media/*`, `/contact` and the rest render a Page Copy
 * record, so editing that record really does change the page. A page with no CMS
 * record and no studio page row (nothing editable behind it) ships without the
 * field instead of inventing a date.
 */
const staticRoutes = [
  { path: '/', priority: 1 },
  { path: '/about', priority: 0.9 },
  { path: '/about/gallery', priority: 0.8 },
  { path: '/about/github', priority: 0.6 },
  { path: '/projects', priority: 0.9 },
  { path: '/blogs', priority: 0.9 },
  { path: '/media', priority: 0.8 },
  { path: '/media/music', priority: 0.7 },
  { path: '/media/movies', priority: 0.7 },
  { path: '/media/anime', priority: 0.7 },
  { path: '/media/manga', priority: 0.7 },
  { path: '/experience', priority: 0.7 },
  { path: '/education', priority: 0.7 },
  { path: '/skills', priority: 0.7 },
  { path: '/certificates', priority: 0.7 },
  { path: '/contact', priority: 0.8 },
]

/**
 * The Page Copy record each code-driven route renders. `CMS_KEYS.homepageSections`
 * etc. are the pieces the homepage itself is built from.
 */
const routeCopyKeys: Record<string, string[]> = {
  '/': [CMS_KEYS.hero, CMS_KEYS.homepageSections, CMS_KEYS.brand, CMS_KEYS.footer],
  '/about': [CMS_KEYS.about],
  '/about/gallery': [CMS_KEYS.gallery],
  '/about/github': [CMS_KEYS.mediaGithub],
  '/projects': [CMS_KEYS.projects],
  '/blogs': [CMS_KEYS.journal],
  '/media': [CMS_KEYS.media],
  '/media/music': [CMS_KEYS.mediaMusic],
  '/media/movies': [CMS_KEYS.mediaFilms],
  '/media/anime': [CMS_KEYS.mediaAnime],
  '/media/manga': [CMS_KEYS.mediaManga],
  '/experience': [CMS_KEYS.experience],
  '/education': [CMS_KEYS.education],
  '/skills': [CMS_KEYS.skills],
  '/certificates': [CMS_KEYS.certificates],
  '/contact': [CMS_KEYS.contact],
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectsResult, blogsResult, pages, studioProjects, copyResult] = await Promise.all([
    getProjectsResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.blogs),
    getPublishedPagesForSitemap(),
    getPublishedProjects(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.pageCopy),
  ])

  const pageDates = new Map(
    pages.map((page) => [normalizePageSlug(page.slug), toLastModified(page.updatedAt)]),
  )

  // Page Copy is keyed per page, so each route borrows only its own records.
  const copyDates = new Map<string, Date>()
  if (copyResult.status === 'ok') {
    for (const record of copyResult.data) {
      const key =
        typeof record.payload?.key === 'string' ? record.payload.key.trim().toLowerCase() : ''
      if (!key) continue
      const next = toLastModified(record.updatedAt)
      const newest = newestOf(copyDates.get(key), next)
      if (newest) copyDates.set(key, newest)
    }
  }

  const projectDates =
    projectsResult.status === 'ok'
      ? projectsResult.data.map((project) => toLastModified(project.updatedAt))
      : []
  // A case study authored in the studio has no CMS record, but it still renders
  // at /projects/<slug>, so it belongs in the sitemap too.
  const studioProjectDates = studioProjects.map((project) => toLastModified(project.updatedAt))
  const blogDates =
    blogsResult.status === 'ok'
      ? blogsResult.data.map((blog) => toLastModified(blog.updatedAt))
      : []

  const routeDate = (path: string) => {
    const copy = (routeCopyKeys[path] ?? []).map((key) => copyDates.get(key))
    return newestOf(...copy, pageDates.get(path))
  }

  const routes: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => {
    // Index pages borrow the newest row they render: the case studies for
    // /projects, the journal entries for /blogs, and everything for the homepage,
    // which lists recent activity.
    const lastModified =
      path === '/projects'
        ? (newestOf(...projectDates, ...studioProjectDates, routeDate(path)) ?? undefined)
        : path === '/blogs'
          ? (newestOf(...blogDates, routeDate(path)) ?? undefined)
          : path === '/'
            ? (newestOf(
                ...projectDates,
                ...studioProjectDates,
                ...blogDates,
                ...[...pageDates.values()],
                routeDate(path),
              ) ?? undefined)
            : routeDate(path)
    return {
      url: `${SITE_URL}${path}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority,
    }
  })

  const listedProjectSlugs = new Set<string>()

  if (projectsResult.status === 'ok') {
    for (const project of projectsResult.data) {
      listedProjectSlugs.add(project.slug)
      const lastModified = toLastModified(project.updatedAt)
      routes.push({
        url: `${SITE_URL}/projects/${project.slug}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  for (const project of studioProjects) {
    if (listedProjectSlugs.has(project.slug)) continue
    const lastModified = toLastModified(project.updatedAt)
    routes.push({
      url: `${SITE_URL}/projects/${project.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  if (blogsResult.status === 'ok') {
    for (const blog of blogsResult.data) {
      const lastModified = toLastModified(blog.updatedAt)
      routes.push({
        url: `${SITE_URL}/blogs/${blog.slug || toSlug(blog.title)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  // Pages authored in Studio → Pages that have no hand-written route of their
  // own; `isSitemapPageSlug` keeps structural, unlisted and redirecting routes
  // out even if a page row appears at one of those slugs.
  for (const page of pages) {
    const slug = normalizeSitemapSlug(page.slug)
    if (!isSitemapPageSlug(slug)) continue
    const lastModified = toLastModified(page.updatedAt)
    routes.push({
      url: `${SITE_URL}${slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return routes
}
