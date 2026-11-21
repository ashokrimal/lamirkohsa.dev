'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getAdminActorId } from '@/lib/admin-auth'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { revalidateCmsCache } from '@/lib/cms-revalidation'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { toSlug } from '@/lib/slug'
import { getTemplateArgs, validateTemplate } from '@/lib/ui-strings'

/**
 * Writes interface labels into the `UI Copy` collection. One published record
 * per key keeps the public site's override map small, and clearing both fields
 * removes the record so the built-in label in `ui-strings.ts` returns.
 */
async function requireAdmin() {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized: sign in to the admin studio first.')
  return actorId
}

function readKey(formData: FormData) {
  const key = String(formData.get('key') || '').trim()
  if (!key) throw new Error('A copy key is required.')
  return key
}

export async function saveUiCopyValue(formData: FormData) {
  const userId = await requireAdmin()
  const key = readKey(formData)
  const reset = formData.get('reset') === '1'
  const value = reset ? '' : String(formData.get('value') || '').trim()
  // Generated sentences render English templates only, so they store no Korean.
  const isTemplate = getTemplateArgs(key) !== null
  const korean = reset || isTemplate ? '' : String(formData.get('korean') || '').trim()

  if (!reset) {
    const problem = validateTemplate(key, value)
    if (problem) throw new Error(problem)
  }

  const [existing] = await db
    .select({ id: cmsContent.id })
    .from(cmsContent)
    .where(
      and(
        eq(cmsContent.collection, CMS_COLLECTIONS.uiCopy),
        sql`${cmsContent.payload}->>'key' = ${key}`,
      ),
    )
    .limit(1)

  if (!value && !korean) {
    if (existing) await db.delete(cmsContent).where(eq(cmsContent.id, existing.id))
  } else {
    const payload = { key, value, ...(korean ? { korean } : {}) }
    if (existing) {
      await db
        .update(cmsContent)
        .set({ payload, status: 'published', updatedAt: new Date() })
        .where(eq(cmsContent.id, existing.id))
    } else {
      await db.insert(cmsContent).values({
        userId,
        collection: CMS_COLLECTIONS.uiCopy,
        title: key,
        slug: toSlug(key) || key,
        payload,
        status: 'published',
        sortOrder: 0,
      })
    }
  }

  revalidateCmsCache(CMS_COLLECTIONS.uiCopy)
  revalidatePath('/admin/ui-copy')
}
