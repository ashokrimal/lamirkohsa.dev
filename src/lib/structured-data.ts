import { SITE_NAME, SITE_URL } from '@/lib/seo'

/**
 * Structured data for the pages that can appear in search results on their own:
 * a journal entry and a case study. Both were missing it, so Google had only the
 * `<title>` and meta description to work with.
 *
 * The functions are pure and return the exact object that goes inside the
 * `<script type="application/ld+json">` tag, so the shape is unit-testable.
 */

export type JsonLd = Record<string, unknown>

function absolute(path: string): string {
  try {
    return new URL(path, SITE_URL).toString()
  } catch {
    return path
  }
}

function person(name = SITE_NAME, url = SITE_URL) {
  return { '@type': 'Person', name, url }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  }
}

export function blogPostingJsonLd(input: {
  title: string
  description?: string
  path: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  authorName?: string
  siteName?: string
}): JsonLd {
  const url = absolute(input.path)
  const author = person(input.authorName, SITE_URL)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(input.image ? { image: [absolute(input.image)] } : {}),
    ...(input.publishedTime ? { datePublished: input.publishedTime } : {}),
    ...(input.modifiedTime ? { dateModified: input.modifiedTime } : {}),
    author,
    publisher: person(input.siteName ?? SITE_NAME, SITE_URL),
    isPartOf: { '@type': 'Blog', name: `${input.siteName ?? SITE_NAME} journal`, url: absolute('/blogs') },
    inLanguage: 'en',
  }
}

export function caseStudyJsonLd(input: {
  title: string
  description?: string
  path: string
  image?: string
  modifiedTime?: string
  technologies?: string[]
  liveUrl?: string
  authorName?: string
}): JsonLd {
  const url = absolute(input.path)
  const technologies = (input.technologies ?? []).filter((tech) => Boolean(tech?.trim()))

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(input.image ? { image: [absolute(input.image)] } : {}),
    ...(input.modifiedTime ? { dateModified: input.modifiedTime } : {}),
    author: person(input.authorName),
    ...(technologies.length
      ? {
          about: technologies.map((name) => ({ '@type': 'DefinedTerm', name })),
          keywords: technologies.join(', '),
        }
      : {}),
    ...(input.liveUrl ? { sameAs: [input.liveUrl] } : {}),
    inLanguage: 'en',
  }
}
