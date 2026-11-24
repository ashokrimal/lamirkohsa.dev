import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo'

/**
 * Structured data for the pages that can appear in search results on their own:
 * a journal entry and a case study. Both were missing it, so Google had only the
 * `<title>` and meta description to work with.
 *
 * Google's Article guidelines (BlogPosting and TechArticle are both Article
 * subtypes) require `image`, `datePublished`, `author` and a `publisher` that is
 * an Organization carrying a `logo`. A Person publisher, or no publisher at all,
 * makes the page ineligible for an article rich result, so both builders emit the
 * same Organization node that the homepage declares under `#organization`.
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

/** The site itself, so an article's `publisher` resolves to one entity sitewide. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

const PUBLISHER_LOGO = {
  '@type': 'ImageObject',
  // Article publishers need a logo of at least 112x112; the app icon is square
  // and already served, so it qualifies where the 1200x630 social card does not.
  url: absolute('/icons/icon-512.png'),
  width: 512,
  height: 512,
}

export function organizationJsonLd(name = SITE_NAME): JsonLd {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name,
    url: SITE_URL,
    logo: PUBLISHER_LOGO,
  }
}

function person(name = SITE_NAME, url = SITE_URL) {
  return { '@type': 'Person', name, url }
}

/**
 * Google requires an article image. A statement with no cover still has a social
 * card, so the page's real default image is used rather than dropping the key
 * (which would silently disqualify the page from rich results).
 */
function articleImages(image?: string): string[] {
  const candidate = image?.trim()
  return [absolute(candidate ? candidate : DEFAULT_OG_IMAGE)]
}

/**
 * Keeps `sameAs` to real absolute web URLs. CMS fields are free text, so a
 * placeholder such as `#` or a relative path has to be dropped: schema.org
 * consumers treat a malformed `sameAs` as a broken entity reference.
 */
function webUrl(value?: string): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

/**
 * Normalizes a studio date field to ISO 8601. Only `YYYY-MM` and `YYYY-MM-DD`
 * are accepted: prose such as "Q3 2025" or a bare year would otherwise become a
 * fabricated January 1st publication date. Invalid calendar days (2025-02-31)
 * are rejected rather than silently rolled forward.
 */
export function cmsDate(value?: string): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(trimmed)
  if (!match) return undefined
  const iso = trimmed.length === 7 ? `${trimmed}-01` : trimmed
  const parsed = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return undefined
  if (parsed.getUTCMonth() + 1 !== Number(match[2])) return undefined
  if (match[3] && parsed.getUTCDate() !== Number(match[3])) return undefined
  return parsed.toISOString()
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
  const published = cmsDate(input.publishedTime) ?? input.publishedTime

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: articleImages(input.image),
    ...(published ? { datePublished: published } : {}),
    ...(input.modifiedTime ? { dateModified: input.modifiedTime } : {}),
    author,
    publisher: organizationJsonLd(input.siteName),
    // `@id` ties every article to the Blog node the journal index declares, so
    // the collection is one entity instead of a URL repeated per page.
    isPartOf: {
      '@type': 'Blog',
      '@id': absolute('/blogs'),
      name: `${input.siteName ?? SITE_NAME} journal`,
      url: absolute('/blogs'),
    },
    inLanguage: 'en',
  }
}

export function blogIndexJsonLd(input: {
  name: string
  description?: string
  path?: string
}): JsonLd {
  const url = absolute(input.path ?? '/blogs')

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url,
    name: input.name,
    url,
    ...(input.description ? { description: input.description } : {}),
    publisher: organizationJsonLd(),
    inLanguage: 'en',
  }
}

export function caseStudyJsonLd(input: {
  title: string
  description?: string
  path: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  technologies?: string[]
  liveUrl?: string
  authorName?: string
}): JsonLd {
  const url = absolute(input.path)
  const technologies = (input.technologies ?? []).filter((tech) => Boolean(tech?.trim()))
  const liveUrl = webUrl(input.liveUrl)
  const published = cmsDate(input.publishedTime)

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: articleImages(input.image),
    ...(published ? { datePublished: published } : {}),
    ...(input.modifiedTime ? { dateModified: input.modifiedTime } : {}),
    author: person(input.authorName),
    publisher: organizationJsonLd(),
    ...(technologies.length
      ? {
          about: technologies.map((name) => ({ '@type': 'DefinedTerm', name })),
          keywords: technologies.join(', '),
        }
      : {}),
    ...(liveUrl ? { sameAs: [liveUrl] } : {}),
    inLanguage: 'en',
  }
}
