import { unstable_cache } from 'next/cache'
import { db, hasDatabaseConfig, withDbRetry } from '@/lib/db'
import { profileSettings } from '@/lib/db/schema'
import {
  CMS_CACHE_TAG,
  CMS_PROFILE_SETTINGS_COLLECTION,
  CMS_REVALIDATE_SECONDS,
  cmsCollectionTag,
} from '@/lib/cms-cache'
import type { CmsResult } from '@/lib/cms-schema'

export type PublicProfileSettings = typeof profileSettings.$inferSelect

export interface GitHubRepoItem {
  id: number
  name: string
  full_name?: string
  description?: string | null
  html_url: string
  stargazers_count?: number
  forks_count?: number
  language?: string | null
  updated_at?: string
  pushed_at?: string
  fork?: boolean
  topics?: string[]
}

export interface GitHubEventItem {
  id: string
  type: string
  repo?: { name?: string }
  payload?: {
    action?: string
    ref?: string
    ref_type?: string
    number?: number
    commits?: Array<{ message?: string; sha?: string }>
    issue?: { number?: number; title?: string }
    release?: { tag_name?: string }
  }
  created_at?: string
}

export interface GitHubProfileData {
  login: string
  name?: string | null
  avatar_url?: string
  html_url?: string
  bio?: string | null
  location?: string | null
  company?: string | null
  blog?: string | null
  public_repos?: number
  followers?: number
  following?: number
}

declare global {
  var __lastKnownProfileSettings: PublicProfileSettings | null | undefined
}

async function fetchPublicProfileSettings(): Promise<PublicProfileSettings | null> {
  try {
    const rows = await withDbRetry(() => db.select().from(profileSettings).limit(1))
    const latest = rows[0] ?? null
    globalThis.__lastKnownProfileSettings = latest
    return latest
  } catch (error) {
    if (globalThis.__lastKnownProfileSettings !== undefined) {
      console.warn('[Profile] Preserving cached profile settings after transient DB error.')
      return globalThis.__lastKnownProfileSettings
    }
    throw error
  }
}

const getCachedPublicProfileSettings = unstable_cache(
  fetchPublicProfileSettings,
  ['cms-profile-settings'],
  {
    tags: [CMS_CACHE_TAG, cmsCollectionTag(CMS_PROFILE_SETTINGS_COLLECTION)],
    revalidate: CMS_REVALIDATE_SECONDS,
  },
)

/**
 * Result-aware profile settings read. Cached via Next.js ISR (`unstable_cache` +
 * `revalidateTag`) so public pages remain statically cacheable while updates
 * saved in `/admin` invalidate immediately.
 */
export async function getPublicProfileSettingsResult(): Promise<
  CmsResult<PublicProfileSettings>
> {
  if (!hasDatabaseConfig()) {
    return { status: 'empty' }
  }

  try {
    const settings = await getCachedPublicProfileSettings()
    if (!settings) return { status: 'empty' }
    return { status: 'ok', data: settings }
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
        ? ` (${(error as { code: string }).code})`
        : ''
    console.error(`[Profile] Could not read public profile settings${code}.`)
    if (process.env.NODE_ENV !== 'production') console.error(error)
    return {
      status: 'error',
      message: 'Profile settings are temporarily unavailable.',
    }
  }
}

export async function getGitHubStatus(username?: string) {
  if (!username) return null
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AshokRimal-Portfolio/1.0',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 1800, tags: [CMS_CACHE_TAG, cmsCollectionTag(CMS_PROFILE_SETTINGS_COLLECTION)] },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`, {
        headers,
        next: { revalidate: 1800, tags: [CMS_CACHE_TAG, cmsCollectionTag(CMS_PROFILE_SETTINGS_COLLECTION)] },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`, {
        headers,
        next: { revalidate: 1800, tags: [CMS_CACHE_TAG, cmsCollectionTag(CMS_PROFILE_SETTINGS_COLLECTION)] },
      }),
    ])
    if (!profileResponse.ok) return null
    const profile = (await profileResponse.json()) as GitHubProfileData
    const repos: GitHubRepoItem[] = reposResponse.ok ? await reposResponse.json() : []
    const events: GitHubEventItem[] = eventsResponse.ok ? await eventsResponse.json() : []

    const eventDays = new Set(
      events
        .map((event) => event.created_at?.slice(0, 10))
        .filter((d): d is string => Boolean(d)),
    )
    let activeStreak = 0
    for (let offset = 0; offset < 30; offset++) {
      const day = new Date()
      day.setDate(day.getDate() - offset)
      if (!eventDays.has(day.toISOString().slice(0, 10))) break
      activeStreak += 1
    }

    const daysMap = new Map<string, number>()
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      daysMap.set(d.toISOString().slice(0, 10), 0)
    }

    let total30DayCommits = 0
    for (const evt of events) {
      if (evt.type === 'PushEvent' && evt.created_at) {
        const dateKey = evt.created_at.slice(0, 10)
        const count = evt.payload?.commits?.length || 1
        if (daysMap.has(dateKey)) {
          daysMap.set(dateKey, (daysMap.get(dateKey) || 0) + count)
          total30DayCommits += count
        }
      }
    }

    const sparkline = Array.from(daysMap.entries()).map(([date, count]) => ({
      date,
      dayLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))

    const languageCounts: Record<string, number> = {}
    for (const repo of repos) {
      if (repo.language && !repo.fork) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
      }
    }
    const langTotal = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1
    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.max(1, Math.round((count / langTotal) * 100)),
      }))

    const totalStars = repos.reduce(
      (sum, repo) => sum + (repo.stargazers_count ?? 0),
      0,
    )
    const totalForks = repos.reduce(
      (sum, repo) => sum + (repo.forks_count ?? 0),
      0,
    )

    return {
      profile,
      repos,
      totalStars,
      totalForks,
      activeStreak,
      total30DayCommits,
      sparkline,
      topLanguages,
      events,
    }
  } catch {
    return null
  }
}

/** Profile settings and public GitHub data for the GitHub archive page. */
export async function getGitHubData() {
  const settingsResult = await getPublicProfileSettingsResult()
  if (settingsResult.status === 'error') {
    throw new Error(settingsResult.message)
  }

  const settings = settingsResult.status === 'ok' ? settingsResult.data : null
  const github = await getGitHubStatus(settings?.githubUsername ?? undefined)
  return { settings, github }
}
