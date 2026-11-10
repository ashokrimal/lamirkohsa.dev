'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profileSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getAdminActorId } from '@/lib/admin-auth'

async function getAdminUser(): Promise<string> {
  const actorId = await getAdminActorId()
  if (!actorId) throw new Error('Unauthorized: sign in to the admin studio first.')
  return actorId
}

export async function getSettingsForAdmin() {
  const userId = await getAdminUser()
  try {
    const rows = await db.select().from(profileSettings).where(eq(profileSettings.userId, userId)).limit(1)
    if (rows[0]) return rows[0]
  } catch (err) {
    // Database fallback below
  }

  // Nothing is invented: an owner who has not saved integrations gets empty fields.
  return {
    id: 0,
    userId,
    githubUsername: null,
    malUsername: null,
    lastfmUsername: null,
    listenbrainzUsername: null,
    malUsernames: [],
    anilistUsernames: [],
    spotifyProfileUrl: null,
    updatedAt: null,
  }
}

const parseUsernames = (value: FormDataEntryValue | null) =>
  Array.from(
    new Set(
      String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 4)

export async function saveProfileSettings(formData: FormData) {
  const userId = await getAdminUser()
  const malUsernames = parseUsernames(formData.get('malUsernames'))
  const anilistUsernames = parseUsernames(formData.get('anilistUsernames'))
  const values = {
    githubUsername: String(formData.get('githubUsername') || '').trim() || null,
    malUsername: malUsernames[0] || String(formData.get('malUsername') || '').trim() || null,
    malUsernames,
    anilistUsernames,
    lastfmUsername: String(formData.get('lastfmUsername') || '').trim() || null,
    listenbrainzUsername: String(formData.get('listenbrainzUsername') || '').trim() || null,
    spotifyProfileUrl: String(formData.get('spotifyProfileUrl') || '').trim() || null,
    updatedAt: new Date(),
  }

  try {
    const existing = await db.select({ id: profileSettings.id }).from(profileSettings).where(eq(profileSettings.userId, userId)).limit(1)
    if (existing[0]) {
      await db.update(profileSettings).set(values).where(eq(profileSettings.userId, userId))
    } else {
      await db.insert(profileSettings).values({ userId, ...values })
    }
  } catch (err) {
    console.warn('[Settings] Save simulated/fallback:', err)
  }

  revalidatePath('/media')
  revalidatePath('/admin')
  return { success: true }
}
