'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, ExternalLink, Music2 } from 'lucide-react'
import { DitherEqualizer } from '@/components/ui/DitherKit'
import { sensoryAudio } from '@/lib/sensory-audio'

interface TrackData {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  songUrl: string
  previewUrl: string | null
}

export function SpotifyWidget({ className = '' }: { className?: string }) {
  const [track, setTrack] = useState<TrackData | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing')
        if (res.ok) {
          const data = await res.json()
          if (mounted) setTrack(data)
        }
      } catch {
        if (mounted) {
          setTrack({
            isPlaying: false,
            title: 'Chamber of Reflection',
            artist: 'Mac DeMarco',
            album: 'Salad Days',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
            songUrl: 'https://open.spotify.com/track/1daDRI9ahMMg6FamV0Ysoo',
            previewUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
          })
        }
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 60000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const togglePlay = () => {
    sensoryAudio.playClick()
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {})
    }
  }

  if (!track) return null

  return (
    <div
      className={`apple-card p-4 transition-all hover:border-line-medium ${className}`}
    >
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-line-subtle text-xs">
        <div className="flex items-center gap-2 text-accent">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306a.75.75 0 01-1.031.25c-2.825-1.727-6.38-2.118-10.567-1.162a.75.75 0 01-.336-1.462c4.582-1.047 8.528-.602 11.684 1.343.344.21.45.66.25 1.031zm1.468-3.262a.938.938 0 01-1.288.312c-3.235-1.99-8.167-2.564-11.993-1.402a.938.938 0 01-.548-1.794c4.373-1.328 9.805-.688 13.517 1.596.398.245.52.766.312 1.288zm.126-3.396c-3.878-2.303-10.28-2.516-13.987-1.391a1.125 1.125 0 11-.655-2.155c4.258-1.293 11.332-1.046 15.801 1.606a1.125 1.125 0 01-1.159 1.94z" />
          </svg>
          <span className="font-semibold tracking-tight text-ink">
            {track.isPlaying ? 'Listening on Spotify' : 'Soundtrack Rotation'}
          </span>
          <span className="font-korean text-[10px] text-muted font-normal">스포티파이</span>
        </div>

        <DitherEqualizer isPlaying={isPlayingAudio || track.isPlaying} />
      </div>

      <div className="flex items-center gap-3.5">
        {/* Album Artwork Frame */}
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-overlay shrink-0 border border-line-soft shadow-xs group">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.title}
              fill
              sizes="56px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Music2 className="w-6 h-6 text-accent" />
            </div>
          )}

          {track.previewUrl && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 bg-scrim/40 hover:bg-scrim/60 flex items-center justify-center text-inverse transition-opacity"
              title={isPlayingAudio ? 'Pause preview' : 'Play preview'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          )}
        </div>

        {/* Track Details */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-semibold text-ink tracking-tight truncate">
              {track.title}
            </h4>
            <a
              href={track.songUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-accent shrink-0 p-1"
              title="Open track on Spotify"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-muted truncate font-medium">
            {track.artist}
          </p>
        </div>
      </div>

      {track.previewUrl && (
        <audio
          ref={audioRef}
          src={track.previewUrl}
          onEnded={() => setIsPlayingAudio(false)}
          onPause={() => setIsPlayingAudio(false)}
          className="hidden"
        />
      )}
    </div>
  )
}
