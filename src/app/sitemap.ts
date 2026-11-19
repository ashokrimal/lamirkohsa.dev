import type { MetadataRoute } from 'next'
import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { getProjectsResult } from '@/lib/projects'
import { SITE_URL } from '@/lib/seo'
import { toSlug } from '@/lib/slug'

export const revalidate = 3600

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
  { path: '/a2', priority: 0.7 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [projectsResult, blogsResult] = await Promise.all([
    getProjectsResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.blogs),
  ])

  const routes: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority,
  }))

  if (projectsResult.status === 'ok') {
    for (const project of projectsResult.data) {
      routes.push({
        url: `${SITE_URL}/projects/${project.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  if (blogsResult.status === 'ok') {
    for (const blog of blogsResult.data) {
      const rawUpdatedAt = blog.updatedAt
      const updatedAt = rawUpdatedAt
        ? rawUpdatedAt instanceof Date
          ? rawUpdatedAt
          : new Date(rawUpdatedAt)
        : undefined

      routes.push({
        url: `${SITE_URL}/blogs/${blog.slug || toSlug(blog.title)}`,
        lastModified:
          updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return routes
}
