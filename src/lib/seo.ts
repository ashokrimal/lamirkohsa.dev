import type { Metadata } from 'next'
import type { PageCopy } from '@/lib/site-content'

function normalizeOrigin(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
  return withProtocol.replace(/\/+$/, '')
}

function resolveSiteUrl() {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeOrigin(process.env.APP_URL) ||
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeOrigin(process.env.VERCEL_URL) ||
    'https://www.ashokrimal.com.np'
  )
}

/**
 * The SEO title pattern is part of the site structure, not CMS content.
 * Next.js applies it through `title.template` in the root layout.
 */
export const SITE_NAME = 'Ashok Rimal'

export const SEO_TITLE_TEMPLATE = `%s · ${SITE_NAME}`

/** Canonical origin. The apex domain redirects to www, so www is the default. */
export const SITE_URL = resolveSiteUrl()

/** The branch's generated social card, used when a CMS record has no image. */
export const DEFAULT_OG_IMAGE = '/og.png'
export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630

const TWITTER_CREATOR = '@lamirkohsa'

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

/**
 * A share card drawn from the record itself. Used only when a CMS record has no
 * `ogImage` of its own, so an unset field never means an identical card for every
 * page. The `/og` route renders this URL.
 */
export function generatedOgImage(input: {
  title: string
  eyebrow?: string
  tags?: string[]
}): string {
  const title = input.title.replace(/\s+/g, ' ').trim().slice(0, 140)
  if (!title) return DEFAULT_OG_IMAGE

  const params = new URLSearchParams({ title })
  const eyebrow = input.eyebrow?.replace(/\s+/g, ' ').trim()
  if (eyebrow) params.set('eyebrow', eyebrow.slice(0, 60))
  const tags = (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 4)
  if (tags.length) params.set('tags', tags.join(','))

  return `/og?${params.toString()}`
}

function socialImage(image: string | undefined, alt: string) {
  if (image) return { url: image, alt }
  return {
    url: DEFAULT_OG_IMAGE,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
  }
}

/**
 * Builds page metadata from the CMS Page Copy record. Per-page `seoTitle`,
 * `seoDescription` and `ogImage` win; otherwise the record's page title and
 * description are used. The canonical path keeps every route pointing at one
 * indexable URL.
 */
export function pageMetadata(
  copy: PageCopy | undefined,
  fallback?: { title?: string; description?: string },
  canonicalPath?: string,
): Metadata {
  const title = copy?.seoTitle ?? copy?.title ?? fallback?.title
  const description = copy?.seoDescription ?? copy?.description ?? fallback?.description
  const image = copy?.ogImage ?? (title ? generatedOgImage({ title }) : undefined)
  const socialTitle = title ?? SITE_NAME
  const images = [socialImage(image, socialTitle)]

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    // A page that sets `alternates` replaces the layout's wholesale, so the feed
    // has to be advertised here as well or only pages without a canonical would
    // carry it.
    alternates: {
      ...(canonicalPath ? { canonical: canonicalPath } : {}),
      types: { 'application/rss+xml': '/feed.xml' },
    },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(canonicalPath ? { url: absoluteUrl(canonicalPath) } : {}),
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images,
      creator: TWITTER_CREATOR,
    },
  }
}

/** Metadata for a blog post or project case study. */
export function articleMetadata(input: {
  title: string
  description?: string
  path: string
  image?: string
  tags?: string[]
  publishedTime?: string
  modifiedTime?: string
}): Metadata {
  const image = socialImage(
    input.image ?? generatedOgImage({ title: input.title, tags: input.tags }),
    input.title,
  )

  return {
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    alternates: {
      canonical: input.path,
      types: { 'application/rss+xml': '/feed.xml' },
    },
    openGraph: {
      type: 'article',
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      url: absoluteUrl(input.path),
      siteName: SITE_NAME,
      locale: 'en_US',
      authors: [SITE_NAME],
      images: [image],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      images: [image],
      creator: TWITTER_CREATOR,
    },
  }
}
