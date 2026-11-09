'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Disc3, Film, BookOpen, Play, Pause, Volume2, Star } from 'lucide-react'

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
      <article className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col justify-between hover:border-[var(--accent)] transition-all">
        <div className="flex items-start gap-3.5">
          {/* Cover Art Frame */}
          <div className="relative w-16 h-16 rounded-xs overflow-hidden bg-[var(--paper)] shrink-0 border border-[var(--line)]">
            {music.coverUrl ? (
              <Image
                src={music.coverUrl}
                alt={`${music.title} cover`}
                fill
                sizes="64px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                <Disc3 className="w-6 h-6 animate-spin-slow text-[var(--accent)]" />
              </div>
            )}
            {music.audioUrl && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-opacity"
                title={isPlaying ? 'Pause preview' : 'Play audio preview'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                {music.mood || 'Track'}
              </span>
              {music.audioUrl && (
                isPlaying ? (
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-[var(--accent)] animate-pulse" />
                    <span className="w-0.5 h-3 bg-[var(--accent)] animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-1.5 bg-[var(--accent)] animate-pulse [animation-delay:300ms]" />
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-[var(--muted)] flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[var(--accent)]" />
                    Preview
                  </span>
                )
              )}
            </div>
            <h4 className="text-sm font-semibold text-[var(--ink)] truncate mt-0.5">
              {music.title}
            </h4>
            <p className="text-xs text-[var(--muted)] truncate">
              {music.artist}
            </p>
            {music.album && (
              <p className="text-[10px] text-[var(--muted)]/80 font-mono truncate mt-0.5">
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
      <article className="rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden flex flex-col justify-between hover:border-[var(--accent)] transition-all">
        <div className="relative aspect-[3/4] max-h-[160px] bg-[var(--paper)] overflow-hidden">
          {anime.imageUrl ? (
            <Image
              src={anime.imageUrl}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              <Film className="w-8 h-8 text-[var(--accent)]" />
            </div>
          )}
          {anime.score && (
            <div className="absolute top-2 right-2 bg-[var(--ink)]/85 text-[var(--paper)] px-2 py-0.5 rounded-xs text-[9px] font-mono font-semibold flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              {anime.score}
            </div>
          )}
        </div>

        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[var(--muted)] mb-1">
              <span className="uppercase text-[var(--accent)] font-semibold">Anime</span>
              <span>{anime.status || 'Library'}</span>
            </div>
            <h4 className="text-xs font-semibold text-[var(--ink)] line-clamp-1">
              {anime.title}
            </h4>
            {anime.synopsis && (
              <p className="mt-1 text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                {anime.synopsis}
              </p>
            )}
          </div>

          {anime.progress && (
            <div className="pt-2 border-t border-[var(--line)]/50 text-[10px] font-mono text-[var(--muted)]">
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
    <article className="rounded-sm border border-[var(--line)] bg-[var(--surface)] overflow-hidden flex flex-col justify-between hover:border-[var(--accent)] transition-all">
      <div className="relative aspect-[3/4] max-h-[160px] bg-[var(--paper)] overflow-hidden">
        {manga.imageUrl ? (
          <Image
            src={manga.imageUrl}
            alt={manga.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
            <BookOpen className="w-8 h-8 text-[var(--accent)]" />
          </div>
        )}
        {manga.score && (
          <div className="absolute top-2 right-2 bg-[var(--ink)]/85 text-[var(--paper)] px-2 py-0.5 rounded-xs text-[9px] font-mono font-semibold flex items-center gap-1">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            {manga.score}
          </div>
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[9px] font-mono text-[var(--muted)] mb-1">
            <span className="uppercase text-[var(--accent)] font-semibold">
              {manga.kind || 'Manga'}
            </span>
            <span>{manga.status || 'Reading'}</span>
          </div>
          <h4 className="text-xs font-semibold text-[var(--ink)] line-clamp-1">
            {manga.title}
          </h4>
          {manga.synopsis && (
            <p className="mt-1 text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
              {manga.synopsis}
            </p>
          )}
        </div>

        {manga.progress && (
          <div className="pt-2 border-t border-[var(--line)]/50 text-[10px] font-mono text-[var(--muted)]">
            {manga.progress}
          </div>
        )}
      </div>
    </article>
  )
}
