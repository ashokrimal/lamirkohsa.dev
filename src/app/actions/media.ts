import { db } from '@/lib/db'
import { musicTrack, profileSettings } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'

export async function getPublicProfileSettings() { const rows = await db.select().from(profileSettings).limit(1); return rows[0] ?? null }

export async function getListenBrainz(username?: string) {
  if (!username) return null
  try { const response = await fetch(`https://api.listenbrainz.org/1/user/${encodeURIComponent(username)}/playing-now`, { next: { revalidate: 60 } }); if (!response.ok) return null; const data = await response.json(); return data.payload?.listens?.[0]?.track_metadata ?? null } catch { return null }
}

export async function getSpotifyNowPlaying() { const token = process.env.SPOTIFY_ACCESS_TOKEN; if (!token) return null; try { const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }); if (response.status === 204 || !response.ok) return null; const data = await response.json(); return data.item ?? null } catch { return null } }
export async function getLastFmRecent(username?: string) { const key = process.env.LASTFM_API_KEY; if (!username || !key) return []; try { const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=8`, { next: { revalidate: 300 } }); if (!response.ok) return []; const data = await response.json(); return data.recenttracks?.track ?? [] } catch { return [] } }

export async function getRecentListenBrainz(username?: string) {
  if (!username) return []
  try { const response = await fetch(`https://api.listenbrainz.org/1/user/${encodeURIComponent(username)}/listens?count=8`, { next: { revalidate: 300 } }); if (!response.ok) return []; const data = await response.json(); return data.payload?.listens ?? [] } catch { return [] }
}

export async function getGitHubStatus(username?: string) { if (!username) return null; try { const [profileResponse, reposResponse, eventsResponse] = await Promise.all([fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { next: { revalidate: 300 } }), fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, { next: { revalidate: 300 } }), fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=8`, { next: { revalidate: 300 } })]); if (!profileResponse.ok) return null; return { profile: await profileResponse.json(), repos: reposResponse.ok ? await reposResponse.json() : [], events: eventsResponse.ok ? await eventsResponse.json() : [] } } catch { return null } }

const malStatuses = ['watching', 'completed', 'onhold', 'dropped', 'plantowatch'] as const
const mangaStatuses = ['reading', 'completed', 'onhold', 'dropped', 'plantoread'] as const
async function getMalList(username: string, kind: 'anime' | 'manga', status: string) { const response = await fetch(`https://api.jikan.moe/v4/users/${encodeURIComponent(username)}/${kind}list?status=${status}&limit=5`, { next: { revalidate: 900 } }); if (!response.ok) return []; const data = await response.json(); return data.data ?? [] }
export async function getMalStatus(username?: string) { if (!username) return null; try { const response = await fetch(`https://api.jikan.moe/v4/users/${encodeURIComponent(username)}/full`, { next: { revalidate: 900 } }); if (!response.ok) return null; const data = await response.json(); const [animeLists, mangaLists] = await Promise.all([Promise.all(malStatuses.map(async (status) => [status, await getMalList(username, 'anime', status)] as const)), Promise.all(mangaStatuses.map(async (status) => [status, await getMalList(username, 'manga', status)] as const))]); return { ...data.data, animeLists: Object.fromEntries(animeLists), mangaLists: Object.fromEntries(mangaLists) } } catch { return null } }

export async function getMediaData() { const settings = await getPublicProfileSettings(); const tracks = await db.select().from(musicTrack).where(eq(musicTrack.published, true)).orderBy(asc(musicTrack.sortOrder)); const [nowPlaying, recent, github, mal, spotifyNowPlaying, lastfmRecent] = await Promise.all([getListenBrainz(settings?.listenbrainzUsername ?? undefined), getRecentListenBrainz(settings?.listenbrainzUsername ?? undefined), getGitHubStatus(settings?.githubUsername ?? undefined), getMalStatus(settings?.malUsername ?? undefined), getSpotifyNowPlaying(), getLastFmRecent(settings?.lastfmUsername ?? undefined)]); return { settings, tracks, nowPlaying, recent, github, mal, spotifyNowPlaying, lastfmRecent } }
