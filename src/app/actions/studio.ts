'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  cmsContent,
  sitePage,
  sitePageSection,
  siteSetting,
  studioProject,
} from '@/lib/db/schema'
import { getAdminActorId } from '@/lib/admin-auth'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { revalidateCmsCache } from '@/lib/cms-revalidation'
import { normalizePageSlug } from '@/lib/studio/data'
import {
  isSectionKey,
  socialLinksSchema,
  validateSectionContent,
  type SocialLink,
} from '@/lib/studio/sections'
import { resolveProjectLifecycleStatus, type ProjectLifecycleStatus } from '@/lib/project-status'

/**
 * Admin Studio mutations for the studio CMS.
 *
 * Every action verifies the owner, validates its payload, writes, then
 * invalidates the exact cache tags and paths the public site reads so the
 * change is visible on the next request without a redeploy.
 */

async function requireOwner() {
  const actor = await getAdminActorId()
  if (!actor) throw new Error('Not authorised. Sign in to the studio to make changes.')
  return actor
}

export interface SaveSectionInput {
  sectionKey: string
  sortOrder: number
  isEnabled: boolean
  content: Record<string, unknown>
}

export async function savePageMeta(input: {
  id: number
  slug: string
  title: string
  metaDescription: string
  isPublished: boolean
}) {
  await requireOwner()
  const slug = normalizePageSlug(input.slug)
  const title = input.title.trim()
  if (!title) throw new Error('A page needs a title.')

  await db
    .update(sitePage)
    .set({
      title,
      metaDescription: input.metaDescription.trim(),
      isPublished: input.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(sitePage.id, input.id))

  revalidateTag(`page-${slug}`, { expire: 0 })
  revalidatePath(slug)
  return { ok: true as const }
}

export async function createPage(input: {
  slug: string
  title: string
  metaDescription?: string
}) {
  await requireOwner()
  const slug = normalizePageSlug(input.slug)
  const title = input.title.trim()
  if (!title) throw new Error('A page needs a title.')

  const [row] = await db
    .insert(sitePage)
    .values({ slug, title, metaDescription: input.metaDescription?.trim() ?? '', isPublished: true })
    .onConflictDoUpdate({
      target: sitePage.slug,
      set: { title, updatedAt: new Date() },
    })
    .returning()

  revalidateTag(`page-${slug}`, { expire: 0 })
  revalidatePath(slug)
  return { ok: true as const, id: row.id, slug }
}

/**
 * Replaces a page's sections in one transaction-like write. Payloads are
 * validated per section key; one invalid section rejects the whole save so the
 * owner never half-publishes a broken page.
 */
export async function savePageSections(input: {
  pageId: number
  slug: string
  sections: SaveSectionInput[]
}) {
  await requireOwner()
  const slug = normalizePageSlug(input.slug)

  const validated: Array<Required<SaveSectionInput>> = []
  for (const [index, section] of input.sections.entries()) {
    if (!isSectionKey(section.sectionKey)) {
      throw new Error(`Unknown section type: ${section.sectionKey}`)
    }
    const result = validateSectionContent(section.sectionKey, section.content)
    if (!result.ok) throw new Error(`${section.sectionKey}: ${result.error}`)
    validated.push({
      sectionKey: section.sectionKey,
      sortOrder: Number.isFinite(section.sortOrder) ? section.sortOrder : index,
      isEnabled: Boolean(section.isEnabled),
      content: result.data as unknown as Record<string, unknown>,
    })
  }

  await db.delete(sitePageSection).where(eq(sitePageSection.pageId, input.pageId))

  if (validated.length > 0) {
    await db.insert(sitePageSection).values(
      validated.map((section, index) => ({
        pageId: input.pageId,
        sectionKey: section.sectionKey,
        sortOrder: index,
        isEnabled: section.isEnabled,
        content: section.content,
        updatedAt: new Date(),
      })),
    )
  }

  revalidateTag(`page-${slug}`, { expire: 0 })
  revalidatePath(slug)
  return { ok: true as const }
}

export interface ProjectInput {
  id?: number
  slug: string
  title: string
  category?: string
  summary?: string
  problem?: string
  solution?: string
  techStack?: string[]
  coverMediaUrl?: string
  liveUrl?: string
  repoUrl?: string
  featuredOrder?: number | null
  status?: string
  isPublished?: boolean
}

export async function saveProject(input: ProjectInput) {
  await requireOwner()
  const title = input.title.trim()
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!title || !slug) throw new Error('A project needs a title and a slug.')

  const values = {
    slug,
    title,
    category: input.category?.trim() || null,
    summary: input.summary?.trim() || null,
    problem: input.problem?.trim() || null,
    solution: input.solution?.trim() || null,
    techStack: (input.techStack ?? []).map((tech) => tech.trim()).filter(Boolean),
    coverMediaUrl: input.coverMediaUrl?.trim() || null,
    liveUrl: input.liveUrl?.trim() || null,
    repoUrl: input.repoUrl?.trim() || null,
    featuredOrder:
      typeof input.featuredOrder === 'number' && Number.isFinite(input.featuredOrder)
        ? input.featuredOrder
        : null,
    status: resolveProjectLifecycleStatus(input.status),
    isPublished: input.isPublished ?? true,
    updatedAt: new Date(),
  }

  if (input.id) {
    await db.update(studioProject).set(values).where(eq(studioProject.id, input.id))
  } else {
    await db.insert(studioProject).values(values).onConflictDoUpdate({
      target: studioProject.slug,
      set: values,
    })
  }

  await syncCmsProjectStatusBySlug(slug, values.status)

  revalidateTag('projects', { expire: 0 })
  revalidateTag(`project-${slug}`, { expire: 0 })
  revalidateCmsCache(CMS_COLLECTIONS.projects)
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath(`/projects/${slug}`)
  revalidatePath('/work')
  revalidatePath(`/work/${slug}`)
  return { ok: true as const }
}

async function syncCmsProjectStatusBySlug(slug: string, status: ProjectLifecycleStatus) {
  try {
    const rows = await db
      .select({ id: cmsContent.id, payload: cmsContent.payload })
      .from(cmsContent)
      .where(and(eq(cmsContent.collection, CMS_COLLECTIONS.projects), eq(cmsContent.slug, slug)))
      .limit(1)
    const row = rows[0]
    if (!row) return
    await db
      .update(cmsContent)
      .set({
        payload: { ...(row.payload ?? {}), status },
        updatedAt: new Date(),
      })
      .where(eq(cmsContent.id, row.id))
  } catch (err) {
    console.warn('[studio] could not mirror status to cmsContent:', err)
  }
}

export async function updateStudioProjectStatus(id: number, status: ProjectLifecycleStatus) {
  await requireOwner()
  const normalizedStatus = resolveProjectLifecycleStatus(status)
  const [updated] = await db
    .update(studioProject)
    .set({ status: normalizedStatus, updatedAt: new Date() })
    .where(eq(studioProject.id, id))
    .returning({ slug: studioProject.slug })

  revalidateTag('projects', { expire: 0 })
  if (updated?.slug) {
    await syncCmsProjectStatusBySlug(updated.slug, normalizedStatus)
    revalidateTag(`project-${updated.slug}`, { expire: 0 })
    revalidatePath(`/work/${updated.slug}`)
    revalidatePath(`/projects/${updated.slug}`)
  }
  revalidateCmsCache(CMS_COLLECTIONS.projects)
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/work')
  return { ok: true as const, status: normalizedStatus }
}

export async function deleteProject(id: number) {
  await requireOwner()
  const [row] = await db
    .select({ slug: studioProject.slug })
    .from(studioProject)
    .where(eq(studioProject.id, id))
    .limit(1)
  await db.delete(studioProject).where(eq(studioProject.id, id))

  revalidateTag('projects', { expire: 0 })
  if (row?.slug) revalidateTag(`project-${row.slug}`, { expire: 0 })
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/work')
  if (row?.slug) revalidatePath(`/work/${row.slug}`)
  return { ok: true as const }
}

/** Moves a project up or down the featured list by swapping its order value. */
export async function moveProject(id: number, direction: -1 | 1) {
  await requireOwner()
  const rows = await db
    .select()
    .from(studioProject)
    .orderBy(asc(studioProject.featuredOrder), asc(studioProject.title))

  const index = rows.findIndex((row) => row.id === id)
  const target = index + direction
  if (index === -1 || target < 0 || target >= rows.length) return { ok: true as const }

  const reordered = [...rows]
  const [row] = reordered.splice(index, 1)
  reordered.splice(target, 0, row)

  for (const [position, project] of reordered.entries()) {
    await db
      .update(studioProject)
      .set({ featuredOrder: position, updatedAt: new Date() })
      .where(eq(studioProject.id, project.id))
  }

  revalidateTag('projects', { expire: 0 })
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/work')
  return { ok: true as const }
}

export async function saveSiteSettings(input: {
  contactEmail: string
  availabilityStatus: string
  socialLinks: SocialLink[]
}) {
  await requireOwner()
  const parsed = socialLinksSchema.safeParse(input.socialLinks)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join('; '))
  }

  // Normalise ordering so what the owner sees in the repeater is what renders.
  const socialLinks = [...parsed.data]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link, index) => ({ ...link, sort_order: index }))

  await db
    .insert(siteSetting)
    .values({
      id: 1,
      contactEmail: input.contactEmail.trim() || null,
      availabilityStatus: input.availabilityStatus.trim() || null,
      socialLinks,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSetting.id,
      set: {
        contactEmail: input.contactEmail.trim() || null,
        availabilityStatus: input.availabilityStatus.trim() || null,
        socialLinks,
        updatedAt: new Date(),
      },
    })

  revalidateTag('site-settings', { expire: 0 })
  revalidatePath('/', 'layout')
  return { ok: true as const }
}
