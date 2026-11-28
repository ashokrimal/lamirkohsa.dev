import { getMediaCollections } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'
import { getPublicProfileSettingsResult } from '@/lib/profile-content'
import { summarizeGitHubActivity } from '@/lib/github-activity'

/**
 * The "currently" deck: one card per activity — what is playing, being watched,
 * being read, and the latest public commit.
 *
 * Everything here already exists elsewhere on the site — the newest published
 * item in each media collection and the latest public push on GitHub. Nothing is
 * invented, and a source with no data simply leaves its card out.
 */

export interface CurrentlyEntry {
  key: string
  label: string
  value: string
  meta?: string
  imageUrl?: string
  /** "Last listened 2 days ago", and so on. */
  timeLabel?: string
  href?: string
}

const GITHUB_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'ashokrimal-portfolio-currently',
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Human-friendly elapsed time, e.g. "2 days ago". Falls back to the date. */
function relativeTime(value?: string | Date): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  const elapsed = Date.now() - date.getTime()
  if (elapsed < 60_000) return 'just now'

  const minutes = Math.round(elapsed / 60_000)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(elapsed / (60 * 60_000))
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`

  const days = Math.round(elapsed / DAY_MS)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`

  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`

  const months = Math.round(days / 30)
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`

  const years = Math.round(days / 365)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

async function latestCommit(username: string): Promise<CurrentlyEntry | null> {
  try {
    const headers = { ...GITHUB_HEADERS }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=10`,
      { headers, next: { revalidate: 300 } },
    )
    if (!response.ok) return null

    const events = (await response.json()) as unknown[]
    const summary = summarizeGitHubActivity({
      username,
      profile: null,
      repos: [],
      events: events as Parameters<typeof summarizeGitHubActivity>[0]['events'],
      recentLimit: 1,
    })
    const latest = summary.recentActivities[0]
    if (!latest) return null

    const elapsed = relativeTime(latest.date)
    return {
      key: 'commit',
      label: 'Last commit',
      value: latest.message || latest.repo || 'A push to GitHub',
      meta: latest.repo || undefined,
      imageUrl: `https://github.com/${encodeURIComponent(username)}.png?size=200`,
      timeLabel: elapsed ? `Committed ${elapsed}` : undefined,
      href: latest.url,
    }
  } catch {
    return null
  }
}

export async function getCurrentlyEntries(): Promise<CurrentlyEntry[]> {
  const [collectionsResult, settingsResult] = await Promise.all([
    getMediaCollections(),
    getPublicProfileSettingsResult(),
  ])

  const collections = collectionsResult.status === 'ok' ? collectionsResult.data : []
  const sections = await getMediaSections(collections)
  const labels: Record<string, string> = {
    music: 'Now playing',
    movies: 'Now watching',
    anime: 'Now watching',
    manga: 'Now reading',
  }
  const timeVerbs: Record<string, string> = {
    music: 'Last listened',
    movies: 'Last watched',
    anime: 'Last watched',
    manga: 'Last read',
  }

  const entries: CurrentlyEntry[] = []
  for (const section of sections) {
    const item = section.items[0]
    if (!item) continue
    const elapsed = relativeTime(item.date)
    const verb = timeVerbs[section.kind]
    entries.push({
      key: section.kind,
      label: labels[section.kind] ?? section.label,
      value: item.title,
      meta: item.subtitle,
      imageUrl: item.imageUrl,
      timeLabel: elapsed && verb ? `${verb} ${elapsed}` : undefined,
      href: item.href ?? section.href,
    })
  }

  const username =
    settingsResult.status === 'ok' ? settingsResult.data?.githubUsername?.trim() : ''
  if (username) {
    const commit = await latestCommit(username)
    if (commit) entries.push(commit)
  }

  return entries
}
