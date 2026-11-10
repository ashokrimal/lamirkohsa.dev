'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  GitBranch,
  Star,
  GitFork,
  Flame,
  RefreshCw,
  ExternalLink,
  Code2,
  Calendar,
  Clock,
  GitCommit,
  Sparkles,
  AlertCircle,
  FolderGit2,
  TrendingUp,
} from 'lucide-react'
import { CmsSectionCard } from '@/components/admin/ui/CmsCard'
import { CmsTabs } from '@/components/admin/ui/CmsTabs'
import { useCmsToast } from '@/components/admin/ui/CmsToast'

interface GitHubStatsProps {
  initialUsername?: string
  className?: string
}

interface SparklineDay {
  date: string
  dayLabel: string
  count: number
}

interface GitHubData {
  rateLimited?: boolean
  profile: {
    login: string
    name: string
    avatar_url: string
    html_url: string
    bio?: string
    public_repos: number
    followers: number
    following: number
  }
  totalStars: number
  totalForks: number
  activeStreak: number
  commitSparkline?: SparklineDay[]
  total30DayCommits?: number
  topLanguages: {
    language: string
    count: number
    percentage: number
  }[]
  repos: {
    id: number
    name: string
    html_url: string
    description?: string
    stargazers_count: number
    forks_count: number
    language?: string
    updated_at: string
  }[]
  events: {
    id: string
    type: string
    repoName: string
    repoUrl: string
    message: string
    createdAt: string
  }[]
  timestamp?: string
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  Rust: '#dea584',
  Go: '#00ADD8',
}

function CommitSparklineChart({
  items,
  totalCommits,
}: {
  items: SparklineDay[]
  totalCommits: number
}) {
  const [hovered, setHovered] = useState<SparklineDay | null>(null)
  const max = Math.max(...items.map((i) => i.count), 4)

  return (
    <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-teal-600" />
            30-Day Commit Frequency
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
            <TrendingUp className="w-3 h-3 text-teal-600" />
            {totalCommits} commits
          </span>
        </div>
        <div className="text-[11px] text-slate-500 min-h-[18px]">
          {hovered ? (
            <span className="font-medium text-teal-900 bg-surface px-2 py-0.5 rounded border border-slate-200">
              {hovered.dayLabel}: <strong>{hovered.count} commit{hovered.count === 1 ? '' : 's'}</strong>
            </span>
          ) : (
            <span className="text-slate-400">Hover bar for daily frequency</span>
          )}
        </div>
      </div>

      {/* SVG Bar Sparkline with responsive layout */}
      <div className="pt-1.5 pb-0.5">
        <div className="flex items-end gap-[3px] sm:gap-1 h-14 w-full">
          {items.map((day) => {
            const heightPct = Math.max((day.count / max) * 100, day.count > 0 ? 18 : 6)
            const isHovered = hovered?.date === day.date
            const isZero = day.count === 0
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer"
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-[2px] transition-all duration-150 ${
                    isHovered
                      ? 'bg-teal-600 ring-2 ring-teal-200'
                      : isZero
                      ? 'bg-slate-200/90 hover:bg-slate-300'
                      : 'bg-teal-600/80 hover:bg-teal-700'
                  }`}
                />
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-0.5 font-mono">
          <span>{items[0]?.dayLabel}</span>
          <span className="hidden sm:inline">{items[Math.floor(items.length / 2)]?.dayLabel}</span>
          <span>{items[items.length - 1]?.dayLabel}</span>
        </div>
      </div>
    </div>
  )
}

export function CmsGitHubStats({ initialUsername = 'ashokrimal', className = '' }: GitHubStatsProps) {
  const { toast } = useCmsToast()
  const [username, setUsername] = useState(initialUsername)
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'events' | 'repos'>('events')
  const [lastRefreshed, setLastRefreshed] = useState<string>('Never')

  const fetchStats = useCallback(
    async (userToFetch: string, showToastNotice = false) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/github?username=${encodeURIComponent(userToFetch)}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch GitHub statistics.')
        }

        setData(json)
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLastRefreshed(timeStr)

        if (showToastNotice) {
          toast({
            title: 'GitHub Stats Synchronized',
            description: `Live stats updated for @${json.profile?.login || userToFetch}.`,
            variant: 'success',
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error fetching GitHub stats.'
        setError(msg)
        if (showToastNotice) {
          toast({
            title: 'GitHub Sync Error',
            description: msg,
            variant: 'error',
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  useEffect(() => {
    fetchStats(username)
  }, [fetchStats, username])

  const handleManualRefresh = () => {
    fetchStats(username, true)
  }

  const tabs = [
    { id: 'events', label: 'Recent Activity', count: data?.events.length || 0, icon: <GitCommit className="w-3.5 h-3.5" /> },
    { id: 'repos', label: 'Top Repositories', count: data?.repos.length || 0, icon: <FolderGit2 className="w-3.5 h-3.5" /> },
  ]

  return (
    <CmsSectionCard
      title="Real-Time GitHub Activity"
      description="Live developer telemetry, commit logs, and repository statistics."
      action={
        <div className="flex items-center gap-2">
          {data && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400">
              Updated {lastRefreshed}
            </span>
          )}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-surface hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh GitHub stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      }
      className={className}
    >
      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-32 bg-slate-100 rounded-xl" />
        </div>
      )}

      {/* Error state */}
      {error && !data && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load GitHub stats</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchStats(username, true)}
              className="mt-2 text-rose-700 font-semibold underline"
            >
              Retry connection
            </button>
          </div>
        </div>
      )}

      {/* Content View */}
      {data && (
        <div className="space-y-5">
          {/* Profile Header & 4 Key Telemetry Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <img
                src={data.profile.avatar_url}
                alt={data.profile.name}
                className="w-10 h-10 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{data.profile.name}</span>
                  <a
                    href={data.profile.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-teal-700 hover:underline flex items-center gap-0.5 font-medium"
                  >
                    @{data.profile.login}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {data.profile.bio || 'Public software builder on GitHub'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 self-end sm:self-center">
              <span><strong>{data.profile.followers}</strong> followers</span>
              <span>·</span>
              <span><strong>{data.profile.following}</strong> following</span>
            </div>
          </div>

          {/* 4 Quick Stat Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-surface">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Repositories</span>
                <FolderGit2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1.5">{data.profile.public_repos}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Open source code</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-surface">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Stars</span>
                <Star className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1.5">{data.totalStars}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Received on projects</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-surface">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Forks</span>
                <GitFork className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1.5">{data.totalForks}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Community forks</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-surface">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Activity Streak</span>
                <Flame className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1.5">
                {data.activeStreak} <span className="text-xs font-normal text-slate-500">days</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Public contribution</p>
            </div>
          </div>

          {/* 30-Day Commit Frequency Sparkline Chart */}
          {data.commitSparkline && data.commitSparkline.length > 0 && (
            <CommitSparklineChart
              items={data.commitSparkline}
              totalCommits={data.total30DayCommits ?? data.commitSparkline.reduce((sum, item) => sum + item.count, 0)}
            />
          )}

          {/* Languages Distribution Bar */}
          {data.topLanguages.length > 0 && (
            <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-teal-600" />
                  Primary Languages
                </span>
                <span className="text-[11px] text-slate-400">From public repositories</span>
              </div>

              {/* Multi-segment bar */}
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                {data.topLanguages.map((lang, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: languageColors[lang.language] || '#94a3b8',
                    }}
                    title={`${lang.language}: ${lang.percentage}%`}
                    className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                  />
                ))}
              </div>

              {/* Language Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {data.topLanguages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface border border-slate-200 text-[11px] font-medium text-slate-700"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: languageColors[lang.language] || '#94a3b8' }}
                    />
                    {lang.language}
                    <span className="text-slate-400 font-normal">{lang.percentage}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tabbed Activity Feed & Repositories */}
          <div className="space-y-3">
            <CmsTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as 'events' | 'repos')}
              variant="pill"
            />

            {/* Tab 1: Recent Activity Events */}
            {activeTab === 'events' && (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-surface overflow-hidden">
                {data.events.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No recent public activity detected.
                  </div>
                ) : (
                  data.events.map((ev) => (
                    <div key={ev.id} className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 mt-0.5 shrink-0">
                          <GitCommit className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 leading-snug truncate">
                            {ev.message}
                          </p>
                          <a
                            href={ev.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{ev.repoName}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        </div>
                      </div>

                      <time className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-1">
                        {new Date(ev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </time>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Top Repositories */}
            {activeTab === 'repos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-surface hover:border-teal-500/50 hover:shadow-2xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-xs text-slate-900 hover:text-teal-700 hover:underline flex items-center gap-1"
                        >
                          {repo.name}
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        {repo.language && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {repo.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Star className="w-3 h-3 text-amber-500" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <GitFork className="w-3 h-3 text-slate-400" /> {repo.forks_count}
                        </span>
                      </div>
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </CmsSectionCard>
  )
}
