'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Github,
  GitCommit,
  GitBranch,
  Flame,
  Star,
  ExternalLink,
  FolderGit2,
  RotateCcw,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { sensoryAudio } from '@/lib/sensory-audio'
import type { GitHubActivityData, SparklineDay } from '@/lib/github-activity'

export type { GitHubActivityData }

interface GitHubActivitySparklineProps {
  username?: string
  className?: string
  showRecentCommits?: boolean
  initialData?: GitHubActivityData | null
}

type SparklineStatus = 'loading' | 'ready' | 'missing-username' | 'unavailable'

export function GitHubActivitySparkline({
  username,
  className = '',
  showRecentCommits = true,
  initialData = null,
}: GitHubActivitySparklineProps) {
  const cleanUsername = username?.trim() || ''
  const [data, setData] = useState<GitHubActivityData | null>(initialData)
  const [status, setStatus] = useState<SparklineStatus>(
    initialData ? 'ready' : cleanUsername ? 'loading' : 'missing-username',
  )
  const [attempt, setAttempt] = useState(0)
  const [hoveredDay, setHoveredDay] = useState<SparklineDay | null>(null)

  const handleRetry = useCallback(() => {
    sensoryAudio.playClick()
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    if (initialData) {
      setData(initialData)
      setStatus('ready')
      return
    }
    if (!cleanUsername) {
      setData(null)
      setStatus('missing-username')
      return
    }

    let mounted = true
    setStatus('loading')

    // The site's own route does the GitHub calls and caches the result, so a
    // visitor never spends the deployment's anonymous GitHub quota.
    const fetchGitHub = async () => {
      try {
        const response = await fetch(
          `/api/github/activity?username=${encodeURIComponent(cleanUsername)}`,
        )
        if (!response.ok) {
          if (mounted) {
            setData(null)
            setStatus('unavailable')
          }
          return
        }

        const payload = (await response.json()) as GitHubActivityData
        if (!mounted) return
        if (!Array.isArray(payload.sparkline) || payload.username !== cleanUsername) {
          setData(null)
          setStatus('unavailable')
          return
        }
        setData(payload)
        setStatus('ready')
      } catch {
        if (mounted) {
          setData(null)
          setStatus('unavailable')
        }
      }
    }

    fetchGitHub()
    return () => {
      mounted = false
    }
  }, [cleanUsername, initialData, attempt])

  if (status === 'missing-username') {
    const empty = CMS_SCHEMA.sections.home.github.emptyState
    return (
      <EmptyState
        eyebrow="GitHub Activity"
        icon={Github}
        message={empty.message}
        hint={empty.hint}
        className={className}
      />
    )
  }

  if (status === 'loading') {
    return (
      <div
        className={`apple-card p-6 md:p-7 space-y-5 animate-pulse ${className}`}
        aria-label={`Loading GitHub activity for ${cleanUsername}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-line-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-overlay-faint" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-overlay-faint" />
              <div className="h-3 w-28 rounded bg-overlay-faint" />
            </div>
          </div>
          <div className="h-6 w-32 rounded-full bg-overlay-faint" />
        </div>
        <div className="h-24 w-full rounded-2xl bg-overlay-faint" />
      </div>
    )
  }

  if (status === 'unavailable' || !data) {
    return (
      <EmptyState
        eyebrow={`GitHub API · @${cleanUsername}`}
        icon={GitCommit}
        message={`Could not load live activity for @${cleanUsername}.`}
        hint="Live GitHub activity could not be read just now. The card retries on its own; the profile link still works."
        className={className}
        footer={
          <>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-4 py-2 text-xs font-medium text-ink-secondary shadow-xs transition-colors hover:border-line-medium hover:text-accent cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry sync
            </button>
            <a
              href={`https://github.com/${encodeURIComponent(cleanUsername)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-4 py-2 text-xs font-medium text-ink-secondary shadow-xs transition-colors hover:border-line-medium hover:text-accent"
            >
              <span>Open github.com/{cleanUsername}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </>
        }
      />
    )
  }

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
