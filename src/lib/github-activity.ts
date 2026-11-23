/**
 * Turns GitHub's public REST responses into the numbers the activity card shows.
 *
 * This used to run in the browser, where every visitor spent the deployment's
 * 60-requests-per-hour anonymous quota on `api.github.com` — enough for a few
 * page views before the card showed an error. It runs on the server now, behind
 * one cached route, so the token (when configured) is used and the quota is
 * shared instead of burned per visitor.
 *
 * The function is pure: no fetch, no clock of its own, so the counts are testable.
 */

export interface SparklineDay {
  date: string
  dayLabel: string
  count: number
}

export interface GitHubRecentActivity {
  repo: string
  message: string
  date: string
  url: string
}

export interface GitHubActivityData {
  username: string
  publicRepos: number
  totalStars: number
  activeStreak: number
  total30DayCommits: number
  sparkline: SparklineDay[]
  recentActivities: GitHubRecentActivity[]
}

type GitHubEvent = {
  type?: string
  created_at?: string
  repo?: { name?: string } | null
  payload?: { commits?: Array<{ message?: string }> | null } | null
}

type GitHubRepo = { stargazers_count?: number }

const DAY_MS = 24 * 60 * 60 * 1000

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function summarizeGitHubActivity({
  username,
  profile,
  repos,
  events,
  now = new Date(),
  days = 30,
  recentLimit = 3,
}: {
  username: string
  profile: { public_repos?: number; total_private_repos?: number } | null
  repos: GitHubRepo[]
  events: GitHubEvent[]
  now?: Date
  days?: number
  recentLimit?: number
}): GitHubActivityData {
  const windowDays = Math.max(1, Math.min(days, 90))
  const counts = new Map<string, number>()
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    counts.set(isoDay(new Date(now.getTime() - offset * DAY_MS)), 0)
  }

  let total30DayCommits = 0
  const recentActivities: GitHubRecentActivity[] = []

  for (const event of events) {
    if (event?.type !== 'PushEvent' || typeof event.created_at !== 'string') continue
    const date = event.created_at.slice(0, 10)
    if (!counts.has(date)) continue

    const commits = Array.isArray(event.payload?.commits) ? event.payload!.commits! : []
    const count = commits.length || 1
    counts.set(date, (counts.get(date) ?? 0) + count)
    total30DayCommits += count

    if (recentActivities.length < recentLimit) {
      const firstMessage = commits[0]?.message || 'Code commit'
      recentActivities.push({
        repo: event.repo?.name || '',
        message: firstMessage.split('\n')[0].slice(0, 70),
        date,
        url: `https://github.com/${event.repo?.name || username}`,
      })
    }
  }

  const sparkline: SparklineDay[] = [...counts.entries()].map(([date, count]) => ({
    date,
    dayLabel: dayLabel(date),
    count,
  }))

  // A streak is consecutive days with commits, counted back from today. A day
  // with no commits ends it, including today, so the number never overstates.
  let activeStreak = 0
  for (let index = sparkline.length - 1; index >= 0; index -= 1) {
    if (sparkline[index].count <= 0) break
    activeStreak += 1
  }

  const totalStars = repos.reduce(
    (sum, repo) => sum + (Number(repo?.stargazers_count) || 0),
    0,
  )

  return {
    username,
    publicRepos: Number(profile?.public_repos) || 0,
    totalStars,
    activeStreak,
    total30DayCommits,
    sparkline,
    recentActivities,
  }
}

/** GitHub logins are alphanumeric with single hyphens, up to 39 characters. */
export function isGitHubUsername(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(value)
}
