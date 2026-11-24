import type { MetadataRoute } from 'next'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
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
 * to `/projects`, so they are not listed. `lastModified` comes from the CMS row
 * that actually backs the page; when there is no usable timestamp the field is
 * left out instead of being set to the crawl time.
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectsResult, blogsResult, pages, studioProjects] = await Promise.all([
    getProjectsResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.blogs),
    getPublishedPagesForSitemap(),
    getPublishedProjects(),
  ])

  const pageDates = new Map(
    pages.map((page) => [normalizePageSlug(page.slug), toLastModified(page.updatedAt)]),
  )

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
  const sitemapPageDates = pages.map((page) => toLastModified(page.updatedAt))

  const routes: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => {
    // Index pages have no record of their own, so each one borrows the newest row
    // it actually renders: the case studies for /projects, the journal entries
    // for /blogs, and everything for the homepage, which lists recent activity.
    const lastModified =
      path === '/projects'
        ? (newestOf(...projectDates, ...studioProjectDates) ?? pageDates.get(path))
        : path === '/blogs'
          ? (newestOf(...blogDates) ?? pageDates.get(path))
          : path === '/'
            ? (newestOf(...projectDates, ...studioProjectDates, ...blogDates, ...sitemapPageDates) ??
              pageDates.get(path))
            : pageDates.get(path)
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
