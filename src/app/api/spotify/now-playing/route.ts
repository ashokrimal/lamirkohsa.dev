import { NextResponse } from 'next/server'
import { getSpotifyCurrentTrack } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getSpotifyCurrentTrack()
    return NextResponse.json(data)
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
