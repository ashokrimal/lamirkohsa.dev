import { NextResponse } from 'next/server'
import { getSpotifyCurrentTrack } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getSpotifyCurrentTrack()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      {
        isPlaying: false,
        title: 'Chamber of Reflection',
        artist: 'Mac DeMarco',
        album: 'Salad Days',
        albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        songUrl: 'https://open.spotify.com/track/1daDRI9ahMMg6FamV0Ysoo',
        previewUrl: null,
      },
      { status: 200 }
    )
  }
}
