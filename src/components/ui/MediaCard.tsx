'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Disc3, Film, BookOpen, Play, Pause, Star } from 'lucide-react'

export interface MusicItemData {
  id?: number | string
  title: string
  artist: string
  album?: string
  coverUrl?: string
  audioUrl?: string
  mood?: string
}

export interface AnimeItemData {
  id?: number | string
  title: string
  score?: string
  status?: string
  progress?: string
  imageUrl?: string
  synopsis?: string
}

export interface MangaItemData {
  id?: number | string
  title: string
  kind?: string
  score?: string
  status?: string
  progress?: string
  imageUrl?: string
  synopsis?: string
}

interface MediaCardProps {
  type: 'music' | 'anime' | 'manga'
  item: MusicItemData | AnimeItemData | MangaItemData
}

export function MediaCard({ type, item }: MediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  // --- 1. MUSIC VARIANT ---
  if (type === 'music') {
    const music = item as MusicItemData
    return (
      <article className="apple-card p-4 flex flex-col justify-between hover:border-line-medium transition-all group">
        <div className="flex items-start gap-3.5">
          {/* Cover Art Frame */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-overlay shrink-0 border border-line-soft shadow-xs">
            {music.coverUrl ? (
              <Image
                src={music.coverUrl}
                alt={`${music.title} cover`}
                fill
                sizes="64px"
                referrerPolicy="no-referrer"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <Disc3 className="w-6 h-6 text-accent animate-spin-slow" />
              </div>
            )}
            {music.audioUrl && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 bg-scrim/40 hover:bg-scrim/60 flex items-center justify-center text-inverse transition-opacity"
                title={isPlaying ? 'Pause preview' : 'Play audio preview'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
                {music.mood || 'Track'}
              </span>
              {music.audioUrl && (
                isPlaying ? (
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-accent animate-pulse" />
                    <span className="w-0.5 h-3 bg-accent animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-accent animate-pulse delay-150" />
                  </span>
                ) : null
              )}
            </div>

            <h4 className="text-sm font-semibold text-ink tracking-tight truncate mt-0.5">
              {music.title}
            </h4>
            <p className="text-xs text-muted truncate mt-0.5 font-normal">
              {music.artist}
            </p>
            {music.album && (
              <p className="text-[11px] text-muted/75 truncate mt-0.5 font-normal">
                {music.album}
              </p>
            )}
          </div>
        </div>

        {music.audioUrl && (
          <audio
            ref={audioRef}
            src={music.audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </article>
    )
  }

  // --- 2. ANIME VARIANT ---
  if (type === 'anime') {
    const anime = item as AnimeItemData
    return (
      <article className="apple-card overflow-hidden flex flex-col justify-between hover:border-line-medium transition-all group">
        <div className="relative aspect-[3/4] max-h-[170px] bg-overlay-hairline overflow-hidden">
          {anime.imageUrl ? (
            <Image
              src={anime.imageUrl}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              referrerPolicy="no-referrer"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Film className="w-8 h-8 text-accent" />
            </div>
          )}
          {anime.score && (
            <div className="absolute top-2.5 right-2.5 bg-surface/90 backdrop-blur-md text-ink px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border border-line-subtle shadow-xs">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              {anime.score}
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] text-muted mb-1 font-medium">
              <span className="uppercase text-accent tracking-wide">Anime</span>
              <span>{anime.status || 'Library'}</span>
            </div>
            <h4 className="text-xs font-semibold text-ink line-clamp-1 tracking-tight">
              {anime.title}
            </h4>
            {anime.synopsis && (
              <p className="mt-1 text-[11px] text-muted line-clamp-2 leading-relaxed">
                {anime.synopsis}
              </p>
            )}
          </div>

          {anime.progress && (
            <div className="pt-2 border-t border-line-faint text-[10px] text-muted">
              {anime.progress}
            </div>
          )}
        </div>
      </article>
    )
  }

  // --- 3. MANGA / MANHWA VARIANT ---
  const manga = item as MangaItemData
  return (
    <article className="apple-card overflow-hidden flex flex-col justify-between hover:border-line-medium transition-all group">
      <div className="relative aspect-[3/4] max-h-[170px] bg-overlay-hairline overflow-hidden">
        {manga.imageUrl ? (
          <Image
            src={manga.imageUrl}
            alt={manga.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            referrerPolicy="no-referrer"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
        )}
        {manga.score && (
          <div className="absolute top-2.5 right-2.5 bg-surface/90 backdrop-blur-md text-ink px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border border-line-subtle shadow-xs">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            {manga.score}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] text-muted mb-1 font-medium">
            <span className="uppercase text-accent tracking-wide">
              {manga.kind || 'Manga'}
            </span>
            <span>{manga.status || 'Reading'}</span>
          </div>
          <h4 className="text-xs font-semibold text-ink line-clamp-1 tracking-tight">
            {manga.title}
          </h4>
          {manga.synopsis && (
            <p className="mt-1 text-[11px] text-muted line-clamp-2 leading-relaxed">
              {manga.synopsis}
            </p>
          )}
        </div>

        {manga.progress && (
          <div className="pt-2 border-t border-line-faint text-[10px] text-muted">
            {manga.progress}
          </div>
        )}
      </div>
    </article>
  )
}
