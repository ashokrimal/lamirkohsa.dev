'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profileSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getSettingsForAdmin() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) throw new Error('Unauthorized'); const rows = await db.select().from(profileSettings).where(eq(profileSettings.userId, session.user.id)).limit(1); return rows[0] ?? null }
const parseUsernames = (value: FormDataEntryValue | null) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4)

export async function saveProfileSettings(formData: FormData) { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) throw new Error('Unauthorized'); const malUsernames = parseUsernames(formData.get('malUsernames')); const anilistUsernames = parseUsernames(formData.get('anilistUsernames')); const values = { githubUsername: String(formData.get('githubUsername') || '').trim() || null, malUsername: malUsernames[0] || String(formData.get('malUsername') || '').trim() || null, malUsernames, anilistUsernames, lastfmUsername: String(formData.get('lastfmUsername') || '').trim() || null, listenbrainzUsername: String(formData.get('listenbrainzUsername') || '').trim() || null, spotifyProfileUrl: String(formData.get('spotifyProfileUrl') || '').trim() || null, updatedAt: new Date() }; const existing = await db.select({ id: profileSettings.id }).from(profileSettings).where(eq(profileSettings.userId, session.user.id)).limit(1); if (existing[0]) await db.update(profileSettings).set(values).where(eq(profileSettings.userId, session.user.id)); else await db.insert(profileSettings).values({ userId: session.user.id, ...values }); revalidatePath('/media'); revalidatePath('/admin') }
