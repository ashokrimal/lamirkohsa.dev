import { getPublishedCmsContentResult } from '@/app/actions/content-cms'
import {
  CMS_COLLECTIONS,
  CMS_KEYS,
  CMS_SCHEMA,
  indexCmsRecordsByKey,
  type CmsResult,
} from '@/lib/cms-schema'

/**
 * Site-wide configuration and page copy, read from the CMS.
 *
 * Nothing in this module invents content: when a CMS record is missing the
 * caller receives an empty value and renders its own empty state. The only
 * literals here are the shape of the payload and the keys used to look records
 * up, never the copy shown to visitors.
 */

export interface NavLink {
  label: string
  kr?: string
  href: string
}

export interface SiteSocial {
  label: string
  href: string
  kind?: string
}

export interface SiteNavigation {
  primary: NavLink[]
  footer: NavLink[]
  collections: NavLink[]
  socials: SiteSocial[]
}

export interface SiteBrand {
  name?: string
  korean?: string
  domain?: string
}

export interface SiteFooterConfig {
  tagline?: string
  availabilityLabel?: string
  availabilityText?: string
  ctaLabel?: string
  ctaHref?: string
  copyrightName?: string
  canonical?: string
}

export interface ContactDetails {
  location?: string
  timeZone?: string
  timezoneLabel?: string
  availability?: string
  email?: string
  phone?: string
  /** Whether the contact form is shown on the contact page and preview. */
  formEnabled?: boolean
}

export interface PageCopy {
  eyebrow?: string
  krEyebrow?: string
  title?: string
  accent?: string
  description?: string
  meta?: string
  href?: string
  primaryLabel?: string
  secondaryLabel?: string
  /** Named sub-sections, e.g. `experience` or `github`, each with its own copy. */
  sections?: Record<string, Omit<PageCopy, 'sections'>>
}

export interface MediaCollection {
  key: string
  number?: string
  label: string
  kr?: string
  description?: string
  href: string
  /** How many cards the preview row shows before the View all card. */
  previewCount?: number
}

export interface SiteConfig {
  brand: SiteBrand
  navigation: SiteNavigation
  footer: SiteFooterConfig
  contact: ContactDetails
}

function text(payload: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = payload?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

function booleanValue(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  if (typeof value === 'boolean') return value
  if (value === 'false') return false
  if (value === 'true') return true
  return undefined
}

function numberValue(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined
}

function links(payload: Record<string, unknown> | undefined, key: string): NavLink[] {
  const value = payload?.[key]
  const result: NavLink[] = []
  if (!Array.isArray(value)) return result

  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const entry = item as Record<string, unknown>
    const label = typeof entry.label === 'string' ? entry.label.trim() : ''
    const href = typeof entry.href === 'string' ? entry.href.trim() : ''
    if (!label || !href) continue
    const kr = typeof entry.kr === 'string' && entry.kr.trim() ? (entry.kr as string) : undefined
    result.push({ label, href, ...(kr ? { kr } : {}) })
  }

  return result
}

function socials(payload: Record<string, unknown> | undefined): SiteSocial[] {
  const value = payload?.socials
  const result: SiteSocial[] = []
  if (!Array.isArray(value)) return result

  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const entry = item as Record<string, unknown>
    const label = typeof entry.label === 'string' ? entry.label.trim() : ''
    const href = typeof entry.href === 'string' ? entry.href.trim() : ''
    if (!label || !href) continue
    const kind =
      typeof entry.kind === 'string' && entry.kind.trim() ? (entry.kind as string) : undefined
    result.push({ label, href, ...(kind ? { kind } : {}) })
  }

  return result
}


function parseCopy(payload: Record<string, unknown> | undefined): PageCopy {
  return {
    eyebrow: text(payload, 'eyebrow'),
    krEyebrow: text(payload, 'krEyebrow'),
    title: text(payload, 'title'),
    accent: text(payload, 'accent'),
    description: text(payload, 'description'),
    meta: text(payload, 'meta'),
    href: text(payload, 'href'),
    primaryLabel: text(payload, 'primaryLabel'),
    secondaryLabel: text(payload, 'secondaryLabel'),
  }
}

function parseSections(payload: Record<string, unknown> | undefined) {
  const value = payload?.sections
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const sections: Record<string, PageCopy> = {}
  for (const [key, section] of Object.entries(value as Record<string, unknown>)) {
    if (!section || typeof section !== 'object') continue
    const parsed = parseCopy(section as Record<string, unknown>)
    if (Object.values(parsed).some(Boolean)) sections[key.toLowerCase()] = parsed
  }

  return Object.keys(sections).length ? sections : undefined
}

/** Empty chrome shape used when the CMS is unavailable, so layout can render. */
export const EMPTY_SITE_CONFIG: SiteConfig = {
  brand: {},
  navigation: { primary: [], footer: [], collections: [], socials: [] },
  footer: {},
  contact: {},
}

/** Every setting the chrome needs, in one CMS round trip. */
export async function getSiteConfig(): Promise<CmsResult<SiteConfig>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.siteSettings)
  if (result.status !== 'ok') return result

  const byKey = indexCmsRecordsByKey(result.data)
  if (Object.keys(byKey).length === 0) return { status: 'empty' }

  const navigation = byKey[CMS_KEYS.navigation]
  const footer = byKey[CMS_KEYS.footer]
  const brand = byKey[CMS_KEYS.brand]
  const contact = byKey[CMS_KEYS.contactDetails]

  return {
    status: 'ok',
    data: {
      brand: {
        name: text(brand?.payload, 'name'),
        korean: text(brand?.payload, 'korean'),
        domain: text(brand?.payload, 'domain'),
      },
      navigation: {
        primary: links(navigation?.payload, 'primary'),
        footer: links(navigation?.payload, 'footer'),
        collections: links(navigation?.payload, 'collections'),
        socials: socials(navigation?.payload),
      },
      footer: {
        tagline: text(footer?.payload, 'tagline'),
        availabilityLabel: text(footer?.payload, 'availabilityLabel'),
        availabilityText: text(footer?.payload, 'availabilityText'),
        ctaLabel: text(footer?.payload, 'ctaLabel'),
        ctaHref: text(footer?.payload, 'ctaHref'),
        copyrightName: text(footer?.payload, 'copyrightName'),
        canonical: text(footer?.payload, 'canonical'),
      },
      contact: {
        location: text(contact?.payload, 'location'),
        timeZone: text(contact?.payload, 'timeZone'),
        timezoneLabel: text(contact?.payload, 'timezoneLabel'),
        availability: text(contact?.payload, 'availability'),
        email: text(contact?.payload, 'email'),
        phone: text(contact?.payload, 'phone'),
        formEnabled: booleanValue(contact?.payload, 'formEnabled'),
      },
    },
  }
}

/** Per-page hero copy, keyed only by the locked `payload.key` field. */
export async function getPageCopy(): Promise<CmsResult<Record<string, PageCopy>>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.pageCopy)
  if (result.status !== 'ok') return result

  const copy: Record<string, PageCopy> = {}
  for (const record of result.data) {
    const key =
      typeof record.payload?.key === 'string' ? record.payload.key.trim().toLowerCase() : ''
    if (!key) continue
    copy[key] = { ...parseCopy(record.payload), sections: parseSections(record.payload) }
  }

  if (Object.keys(copy).length === 0) return { status: 'empty' }
  return { status: 'ok', data: copy }
}

/** The media library sections recorded in the CMS, in the locked key order. */
export async function getMediaCollections(): Promise<CmsResult<MediaCollection[]>> {
  const result = await getPublishedCmsContentResult(CMS_COLLECTIONS.mediaCollections)
  if (result.status !== 'ok') return result

  const byKey = indexCmsRecordsByKey(result.data)
  const collectionSchema = CMS_SCHEMA.collections.mediaCollections.records ?? {}
  const collections: MediaCollection[] = []

  for (const [kind, definition] of Object.entries(collectionSchema)) {
    const record = byKey[definition.key]
    if (!record) continue
    const payload = record.payload
    collections.push({
      key: definition.key,
      number: text(payload, 'number'),
      label: text(payload, 'label') || definition.label,
      kr: text(payload, 'kr'),
      description: text(payload, 'description'),
      href: text(payload, 'href') || definition.route || `/media/${kind}`,
      previewCount: numberValue(payload, 'previewCount'),
    })
  }

  if (collections.length === 0) return { status: 'empty' }
  return { status: 'ok', data: collections }
}
