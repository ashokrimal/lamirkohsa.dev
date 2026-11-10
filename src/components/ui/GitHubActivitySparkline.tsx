'use client'

import React, { useState, useEffect } from 'react'
import {
  Github,
  GitCommit,
  GitBranch,
  Flame,
  Star,
  ExternalLink,
  FolderGit2,
} from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'

interface SparklineDay {
  date: string
  dayLabel: string
  count: number
}

interface GitHubActivityData {
  username: string
  publicRepos: number
  totalStars: number
  activeStreak: number
  total30DayCommits: number
  sparkline: SparklineDay[]
  recentActivities: {
    repo: string
    message: string
    date: string
    url: string
  }[]
}

interface GitHubActivitySparklineProps {
  username?: string
  className?: string
  showRecentCommits?: boolean
}

export function GitHubActivitySparkline({
  username,
  className = '',
  showRecentCommits = true,
}: GitHubActivitySparklineProps) {
  const [data, setData] = useState<GitHubActivityData | null>(null)
  const [hoveredDay, setHoveredDay] = useState<SparklineDay | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchGitHub = async () => {
      try {
        if (!username) return
        const [profileRes, reposRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`),
          fetch(`https://api.github.com/users/${username}/events/public?per_page=30`),
        ])

        if (profileRes.ok && eventsRes.ok) {
          const profile = await profileRes.json()
          const events = await eventsRes.json()
          const repos = reposRes.ok ? await reposRes.json() : []

          const daysMap = new Map<string, number>()
          const now = new Date()
          for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(now.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            daysMap.set(key, 0)
          }

          let totalCommits = 0
          const pushEvents: Array<{ repo: string; message: string; date: string; url: string }> = []

          if (Array.isArray(events)) {
            events.forEach((evt) => {
              if (evt.type === 'PushEvent' && evt.created_at) {
                const dateKey = evt.created_at.slice(0, 10)
                const count = evt.payload?.commits?.length || 1
                if (daysMap.has(dateKey)) {
                  daysMap.set(dateKey, (daysMap.get(dateKey) || 0) + count)
                  totalCommits += count
                }
                const firstMsg = evt.payload?.commits?.[0]?.message || 'Code commit'
                if (pushEvents.length < 3) {
                  pushEvents.push({
                    repo: evt.repo?.name || '',
                    message: firstMsg.split('\n')[0].slice(0, 70),
                    date: dateKey,
                    url: `https://github.com/${evt.repo?.name || username}`,
                  })
                }
              }
            })
          }

          const sparklineList: SparklineDay[] = Array.from(daysMap.entries()).map(([date, count]) => {
            const d = new Date(date)
            const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return { date, dayLabel, count }
          })

          const stars = Array.isArray(repos)
            ? repos.reduce((sum: number, r: { stargazers_count?: number }) => sum + (r.stargazers_count || 0), 0)
            : 0

          // Streak: consecutive days with commits, counting back from today.
          let streak = 0
          for (let i = sparklineList.length - 1; i >= 0; i--) {
            if (sparklineList[i].count > 0) streak += 1
            else break
          }

          if (mounted) {
            setData({
              username,
              publicRepos: profile.public_repos ?? 0,
              totalStars: stars,
              total30DayCommits: totalCommits,
              activeStreak: streak,
              sparkline: sparklineList,
              recentActivities: pushEvents,
            })
          }
        }
      } catch {}
    }

    fetchGitHub()
    return () => {
      mounted = false
    }
  }, [username])

  if (!data) return null

  const maxCommitDay = Math.max(...data.sparkline.map((d) => d.count), 1)

  const handleHoverDay = (day: SparklineDay | null) => {
    if (day && day !== hoveredDay) {
      sensoryAudio.playClick()
    }
    setHoveredDay(day)
  }

  return (
    <div
      className={`apple-card p-6 md:p-7 space-y-5 hover:border-line-medium ${className}`}
    >
      {/* Top Header Row with Korean Tenztan Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-subtle text-xs">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-overlay text-accent border border-line-faint flex items-center justify-center shrink-0">
            <Github className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-ink tracking-tight">
                github.com/{data.username}
              </span>
              <a
                href={`https://github.com/${data.username}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-accent"
                title="View GitHub profile"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
              <span>Open-source activity &amp; commit cadence</span>
              <span lang="ko" className="font-korean text-[10px] text-muted">· 깃허브 기록</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Apple Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay text-accent font-medium border border-line-hairline">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{data.activeStreak}d Streak</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay text-ink font-medium border border-line-hairline">
            <FolderGit2 className="w-3.5 h-3.5 text-muted" />
            <span>{data.publicRepos} Repos</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay text-ink font-medium border border-line-hairline">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{data.totalStars}</span>
          </span>
        </div>
      </div>

      {/* 30-Day Commit Sparkline Visualizer */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted font-medium flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-accent" />
              <span>30-Day Activity Heat</span>
            </span>
            <span className="text-xs font-medium text-accent px-2.5 py-0.5 rounded-full bg-accent/10">
              {data.total30DayCommits} Commits
            </span>
          </div>

          <div className="text-xs text-muted min-h-[20px]">
            {hoveredDay ? (
              <span className="text-ink font-medium bg-surface px-2.5 py-1 rounded-full shadow-xs border border-line-subtle">
                {hoveredDay.dayLabel}: <strong>{hoveredDay.count} commit{hoveredDay.count === 1 ? '' : 's'}</strong>
              </span>
            ) : (
              <span className="hidden sm:inline text-muted">Hover bars to inspect daily commits</span>
            )}
          </div>
        </div>

        {/* Bar Matrix with Smooth Squircle Container */}
        <div className="p-4 rounded-2xl bg-overlay-faint border border-line-faint">
          <div className="flex items-end gap-[3px] sm:gap-2 h-16 w-full">
            {data.sparkline.map((day) => {
              const heightPct = Math.max((day.count / maxCommitDay) * 100, day.count > 0 ? 20 : 8)
              const isHovered = hoveredDay?.date === day.date
              const hasActivity = day.count > 0

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => handleHoverDay(day)}
                  onMouseLeave={() => handleHoverDay(null)}
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-full transition-all duration-300 ${
                      isHovered
                        ? 'bg-accent scale-y-110 shadow-sm'
                        : hasActivity
                        ? 'bg-accent/80 group-hover:bg-accent'
                        : 'bg-overlay-medium group-hover:bg-overlay-heavy'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-line-faint text-[10px] text-muted">
            <span>{data.sparkline[0]?.dayLabel || '30 days ago'}</span>
            <span lang="ko" className="text-accent font-medium font-korean">기여도 활동 (Commit Activity)</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Recent Open-Source Commits */}
      {showRecentCommits && data.recentActivities.length > 0 && (
        <div className="pt-3 border-t border-line-subtle space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xs uppercase tracking-wide text-muted font-medium">
              Recent Open-Source Dispatches
            </span>
            <span lang="ko" className="font-korean text-[10px] text-muted">최근 커밋</span>
          </div>
          <div className="space-y-2 text-xs">
            {data.recentActivities.map((act, i) => (
              <a
                key={i}
                href={act.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-surface/70 border border-line-soft hover:border-line-strong transition-all shadow-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GitBranch className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-semibold text-xs text-ink group-hover:text-accent transition-colors truncate">
                    {act.repo.split('/').pop()}
                  </span>
                  <span className="text-xs text-muted truncate max-w-xs hidden sm:inline">
                    · {act.message}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-accent shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
