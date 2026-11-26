import { getMediaCollections } from '@/lib/site-content'
import { getMediaSections } from '@/lib/media-content'
import { getPublicProfileSettingsResult } from '@/app/actions/media'
import { summarizeGitHubActivity } from '@/lib/github-activity'

/**
 * The "currently" row: one line of what is on the desk right now.
 *
 * Everything here already exists elsewhere on the site — the newest published
 * item in each media collection and the latest public push on GitHub. Nothing is
 * invented, and a source with no data simply leaves its column out.
 */

export interface CurrentlyEntry {
  key: string
  label: string
  value: string
  meta?: string
  href?: string
}

const GITHUB_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'ashokrimal-portfolio-currently',
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

    return {
      key: 'commit',
      label: 'Last commit',
      value: latest.message || latest.repo || 'A push to GitHub',
      meta: latest.repo || undefined,
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

  const entries: CurrentlyEntry[] = []
  for (const section of sections) {
    const item = section.items[0]
    if (!item) continue
    entries.push({
      key: section.kind,
      label: labels[section.kind] ?? section.label,
      value: item.title,
      meta: item.subtitle,
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
