'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, Disc3, Film, Sparkles } from 'lucide-react'
import { MediaCard, type MusicItemData, type AnimeItemData, type MangaItemData } from '@/components/ui/MediaCard'
import { SpotifyWidget } from '@/components/ui/SpotifyWidget'
import { sensoryAudio } from '@/lib/sensory-audio'

type MediaTabKey = 'all' | 'music' | 'anime' | 'manga'

interface FilterableMediaShelfProps {
  music: MusicItemData[]
  anime: AnimeItemData[]
  manga: MangaItemData[]
}

export function FilterableMediaShelf({ music, anime, manga }: FilterableMediaShelfProps) {
  const [activeTab, setActiveTab] = useState<MediaTabKey>('all')

  const handleTabChange = (tab: MediaTabKey) => {
    sensoryAudio.playToggle()
    setActiveTab(tab)
  }

  const tabConfigs: Array<{
    key: MediaTabKey
    label: string
    kr: string
    count: number
    icon: React.ComponentType<{ className?: string }>
    href: string
  }> = [
    { key: 'all', label: 'All Media', kr: '전체', count: music.length + anime.length + manga.length, icon: Sparkles, href: '/media' },
    { key: 'music', label: 'Music & Spotify', kr: '음악', count: music.length, icon: Disc3, href: '/media/music' },
    { key: 'anime', label: 'Anime', kr: '애니', count: anime.length, icon: Film, href: '/media/anime' },
    { key: 'manga', label: 'Manga / Manhwa', kr: '만화', count: manga.length, icon: BookOpen, href: '/media/manga' },
  ]

  const currentTabConfig = tabConfigs.find((t) => t.key === activeTab) || tabConfigs[0]

  return (
    <div className="space-y-6">
      {/* Apple-style Segmented Capsule Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/[0.06]">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-black/[0.04] border border-black/[0.04] backdrop-blur-xl">
          {tabConfigs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0071e3]' : ''}`} />
                <span>{tab.label}</span>
                <span className="font-korean text-[10px] opacity-75">{tab.kr}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-black/[0.05] text-[#1d1d1f]' : 'bg-black/[0.03] text-[#86868b]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <Link
          href={currentTabConfig.href}
          className="apple-btn-secondary !py-2 !px-4 text-xs shrink-0"
        >
          <span>Explore {currentTabConfig.label}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#86868b]" />
        </Link>
      </div>

      {/* Content for TAB 1: ALL MEDIA */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Music Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] text-xs text-[#86868b]">
              <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Spotify Rotation</span>
              </span>
              <button
                type="button"
                onClick={() => handleTabChange('music')}
                className="text-[#0071e3] hover:underline text-[11px] font-medium"
              >
                View all →
              </button>
            </div>
            <SpotifyWidget />
            {music.slice(0, 1).map((item) => (
              <MediaCard key={item.id || item.title} type="music" item={item} />
            ))}
          </div>

          {/* Anime Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] text-xs text-[#86868b]">
              <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Anime Watchlist</span>
              </span>
              <button
                type="button"
                onClick={() => handleTabChange('anime')}
                className="text-[#0071e3] hover:underline text-[11px] font-medium"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {anime.slice(0, 2).map((item) => (
                <MediaCard key={item.id || item.title} type="anime" item={item} />
              ))}
            </div>
          </div>

          {/* Manga Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] text-xs text-[#86868b]">
              <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Manga &amp; Manhwa</span>
              </span>
              <button
                type="button"
                onClick={() => handleTabChange('manga')}
                className="text-[#0071e3] hover:underline text-[11px] font-medium"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {manga.slice(0, 2).map((item) => (
                <MediaCard key={item.id || item.title} type="manga" item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 2: MUSIC & SPOTIFY */}
      {activeTab === 'music' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.9fr] gap-6 items-start">
            <SpotifyWidget />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {music.map((item) => (
                <MediaCard key={item.id || item.title} type="music" item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 3: ANIME */}
      {activeTab === 'anime' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {anime.map((item) => (
            <MediaCard key={item.id || item.title} type="anime" item={item} />
          ))}
        </div>
      )}

      {/* Content for TAB 4: MANGA / MANHWA */}
      {activeTab === 'manga' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {manga.map((item) => (
            <MediaCard key={item.id || item.title} type="manga" item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
