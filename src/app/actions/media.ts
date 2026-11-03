import { db } from '@/lib/db'
import { profileSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getPublicProfileSettings() { const rows = await db.select().from(profileSettings).limit(1); return rows[0] ?? null }

export async function getListenBrainz(username?: string) {
  if (!username) return null
  try { const response = await fetch(`https://api.listenbrainz.org/1/user/${encodeURIComponent(username)}/playing-now`, { next: { revalidate: 60 } }); if (!response.ok) return null; const data = await response.json(); return data.payload?.listens?.[0]?.track_metadata ?? null } catch { return null }
}

export async function getRecentListenBrainz(username?: string) {
  if (!username) return []
  try { const response = await fetch(`https://api.listenbrainz.org/1/user/${encodeURIComponent(username)}/listens?count=8`, { next: { revalidate: 300 } }); if (!response.ok) return []; const data = await response.json(); return data.payload?.listens ?? [] } catch { return [] }
}

export async function getGitHubStatus(username?: string) { if (!username) return null; try { const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { next: { revalidate: 300 } }); return response.ok ? response.json() : null } catch { return null } }

export async function getMalStatus(username?: string) { if (!username) return null; try { const response = await fetch(`https://api.jikan.moe/v4/users/${encodeURIComponent(username)}/full`, { next: { revalidate: 900 } }); if (!response.ok) return null; const data = await response.json(); return data.data ?? null } catch { return null } }

export async function getMediaData() { const settings = await getPublicProfileSettings(); const [nowPlaying, recent, github, mal] = await Promise.all([getListenBrainz(settings?.listenbrainzUsername ?? undefined), getRecentListenBrainz(settings?.listenbrainzUsername ?? undefined), getGitHubStatus(settings?.githubUsername ?? undefined), getMalStatus(settings?.malUsername ?? undefined)]); return { settings, nowPlaying, recent, github, mal } }
