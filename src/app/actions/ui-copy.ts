'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getAdminActorId } from '@/lib/admin-auth'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { revalidateCmsCache } from '@/lib/cms-revalidation'
import { db } from '@/lib/db'
import { cmsContent } from '@/lib/db/schema'
import { toSlug } from '@/lib/slug'
import { planUiCopyWrite } from '@/lib/ui-copy-write'

/**
 * Writes interface labels into the `UI Copy` collection. One published record
 * per key keeps the public site's override map small, and clearing both fields
 * removes the record so the built-in label in `ui-strings.ts` returns. The
 * decision itself lives in `planUiCopyWrite` so it can be tested without a
 * database.
 */
async function requireAdmin() {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized: sign in to the admin studio first.')
  return actorId
}

export async function saveUiCopyValue(formData: FormData) {
  const userId = await requireAdmin()
  const plan = planUiCopyWrite({
    key: String(formData.get('key') || ''),
    value: String(formData.get('value') || ''),
    korean: String(formData.get('korean') || ''),
    reset: formData.get('reset') === '1',
  })
  const key = plan.action === 'upsert' ? plan.payload.key : String(formData.get('key') || '').trim()

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

  if (plan.action === 'delete') {
    if (existing) await db.delete(cmsContent).where(eq(cmsContent.id, existing.id))
  } else if (existing) {
    await db
      .update(cmsContent)
      .set({ payload: plan.payload, status: 'published', updatedAt: new Date() })
      .where(eq(cmsContent.id, existing.id))
  } else {
    await db.insert(cmsContent).values({
      userId,
      collection: CMS_COLLECTIONS.uiCopy,
      title: plan.payload.key,
      slug: toSlug(plan.payload.key) || plan.payload.key,
      payload: plan.payload,
      status: 'published',
      sortOrder: 0,
    })
  }

  revalidateCmsCache(CMS_COLLECTIONS.uiCopy)
  revalidatePath('/admin/ui-copy')
}
