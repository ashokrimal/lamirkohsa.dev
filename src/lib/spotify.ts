/**
 * Spotify API Integration
 * Authenticates using Spotify Client ID & Client Secret
 */

const client_id = process.env.SPOTIFY_CLIENT_ID || 'a51414db0a554697854fa411bce8a0d4'
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || 'a6c1ffd5f6ef418b9ae68038fcb141cb'
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN || ''

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'

/**
 * Get an App Access Token via Client Credentials flow
 */
export async function getSpotifyAppToken(): Promise<string | null> {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      next: { revalidate: 3500 },
    })

    if (!response.ok) return null
    const data = await response.json()
    return data.access_token as string
  } catch (err) {
    console.warn('[Spotify] Failed to get app token:', err)
    return null
  }
}

/**
 * Get User Access Token using Refresh Token (if configured)
 */
export async function getSpotifyUserAccessToken(): Promise<string | null> {
  if (!refresh_token) return null
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      cache: 'no-store',
    })

    if (!response.ok) return null
    const data = await response.json()
    return data.access_token as string
  } catch {
    return null
  }
}

export interface SpotifyTrackPayload {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  songUrl: string
  previewUrl: string | null
  progressMs?: number
  durationMs?: number
}

/**
 * Fetch currently playing song or fallback to curated rotation
 */
export async function getSpotifyCurrentTrack(): Promise<SpotifyTrackPayload> {
  // 1. Try real-time currently-playing if user token is active
  const userToken = await getSpotifyUserAccessToken()
  if (userToken) {
    try {
      const res = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: { Authorization: `Bearer ${userToken}` },
        cache: 'no-store',
      })

      if (res.status === 200) {
        const song = await res.json()
        if (song.item) {
          return {
            isPlaying: song.is_playing ?? true,
            title: song.item.name,
            artist: song.item.artists?.map((a: { name: string }) => a.name).join(', ') ?? 'Unknown Artist',
            album: song.item.album?.name ?? '',
            albumArt: song.item.album?.images?.[0]?.url ?? '/images/hero-ashok.png',
            songUrl: song.item.external_urls?.spotify ?? 'https://open.spotify.com',
            previewUrl: song.item.preview_url ?? null,
            progressMs: song.progress_ms,
            durationMs: song.item.duration_ms,
          }
        }
      }
    } catch (err) {
      console.warn('[Spotify] Currently playing check failed:', err)
    }
  }

  // 2. Fetch curated track details using Spotify Client Credentials
  const appToken = await getSpotifyAppToken()
  if (appToken) {
    try {
      // Query Spotify for Ashok's signature favorite: Mac DeMarco - Chamber of Reflection
      const searchRes = await fetch(
        'https://api.spotify.com/v1/search?q=Mac+DeMarco+Chamber+of+Reflection&type=track&limit=1',
        {
          headers: { Authorization: `Bearer ${appToken}` },
          next: { revalidate: 3600 },
        }
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const track = searchData.tracks?.items?.[0]
        if (track) {
          return {
            isPlaying: false,
            title: track.name,
            artist: track.artists?.map((a: { name: string }) => a.name).join(', '),
            album: track.album?.name,
            albumArt: track.album?.images?.[0]?.url,
            songUrl: track.external_urls?.spotify,
            previewUrl: track.preview_url ?? 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
          }
        }
      }
    } catch (err) {
      console.warn('[Spotify] Fallback search error:', err)
    }
  }

  // 3. Resilient Default
  return {
    isPlaying: false,
    title: 'Chamber of Reflection',
    artist: 'Mac DeMarco',
    album: 'Salad Days',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    songUrl: 'https://open.spotify.com/track/1daDRI9ahMMg6FamV0Ysoo',
    previewUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
  }
}
