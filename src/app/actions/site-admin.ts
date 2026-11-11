'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { getAdminActorId } from '@/lib/admin-auth'
import { CMS_CACHE_TAG } from '@/lib/cms-cache'

export type SiteAdminResult = { ok: true } | { ok: false; error: string }

async function requireOwner() {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Sign in to the admin studio first.')
  return actorId
}

function revalidateSite() {
  revalidateTag(CMS_CACHE_TAG)
  for (const path of ['/', '/about', '/media', '/projects', '/contact', '/admin']) {
    revalidatePath(path)
  }
}

/** Creates or merges one Site Settings record without dropping other fields. */
async function upsertSetting(title: string, slug: string, patch: Record<string, unknown>) {
  const userId = await requireOwner()
  const rows = await db
    .select()
    .from(cmsContent)
    .where(and(eq(cmsContent.userId, userId), eq(cmsContent.collection, 'Site Settings')))

  const existing = rows.find((row) => row.title.trim().toLowerCase() === title.toLowerCase())

  if (existing) {
    await db
      .update(cmsContent)
      .set({
        payload: { ...(existing.payload || {}), ...patch },
        status: 'published',
        updatedAt: new Date(),
      })
      .where(eq(cmsContent.id, existing.id))
    return
  }

  await db.insert(cmsContent).values({
    userId,
    collection: 'Site Settings',
    title,
    slug,
    payload: patch,
    status: 'published',
    sortOrder: 0,
  })
}

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

type LinkRow = { label: string; href: string; kind?: string }

function parseLinks(value: FormDataEntryValue | null): LinkRow[] {
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => ({
        label: typeof row?.label === 'string' ? row.label.trim() : '',
        href: typeof row?.href === 'string' ? row.href.trim() : '',
        ...(typeof row?.kind === 'string' && row.kind.trim() ? { kind: row.kind.trim() } : {}),
      }))
      .filter((row) => row.label && row.href)
  } catch {
    return []
  }
}

/** Saves the hero image and copy shown on the homepage. */
export async function saveHeroSettings(formData: FormData): Promise<SiteAdminResult> {
  try {
    const keys = ['heading', 'subtitle', 'location', 'metaLeft', 'metaRight', 'initials', 'imageUrl', 'imageAlt']
    const patch: Record<string, unknown> = {}
    for (const key of keys) patch[key] = text(formData, key)
    if (!patch.heading && !patch.subtitle && !patch.imageUrl) {
      return { ok: false, error: 'Add a heading, subtitle or hero image before saving.' }
    }
    await upsertSetting('Hero Section', 'hero-section', patch)
    revalidateSite()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'The hero could not be saved.' }
  }
}

/** Saves footer navigation, collection links, socials and footer copy. */
export async function saveSiteChromeSettings(formData: FormData): Promise<SiteAdminResult> {
  try {
    const navigationPatch = {
      footer: parseLinks(formData.get('footerLinks')),
      collections: parseLinks(formData.get('collectionLinks')),
      socials: parseLinks(formData.get('socialLinks')),
    }

    const footerPatch = {
      tagline: text(formData, 'tagline'),
      availabilityLabel: text(formData, 'availabilityLabel'),
      availabilityText: text(formData, 'availabilityText'),
      ctaLabel: text(formData, 'ctaLabel'),
      ctaHref: text(formData, 'ctaHref'),
      copyrightName: text(formData, 'copyrightName'),
      canonical: text(formData, 'canonical'),
    }

    await upsertSetting('Navigation', 'navigation', navigationPatch)
    await upsertSetting('Footer', 'footer', footerPatch)
    revalidateSite()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'The footer could not be saved.' }
  }
}
