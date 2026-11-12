import { db } from '@/lib/db'
import { profileSettings } from '@/lib/db/schema'
import type { CmsResult } from '@/lib/cms-schema'

export type PublicProfileSettings = typeof profileSettings.$inferSelect

/**
 * Result-aware profile settings read. The public media pages need to tell an
 * unconfigured profile apart from a database failure.
 */
export async function getPublicProfileSettingsResult(): Promise<
  CmsResult<PublicProfileSettings>
> {
  try {
    const rows = await db.select().from(profileSettings).limit(1)
    return { status: 'ok', data: rows[0] ?? null }
  } catch (error) {
    console.error('[Profile] Could not read public profile settings', error)
    return {
      status: 'error',
      message: 'Profile settings are temporarily unavailable.',
    }
  }
}

export async function getGitHubStatus(username?: string) {
  if (!username) return null
  try {
    const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        next: { revalidate: 1800 },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`, {
        next: { revalidate: 1800 },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=5`, {
        next: { revalidate: 1800 },
      }),
    ])
    if (!profileResponse.ok) return null
    const profile = await profileResponse.json()
    const repos = reposResponse.ok ? await reposResponse.json() : []
    const events = eventsResponse.ok ? await eventsResponse.json() : []
    const eventDays = new Set(
      events
        .map((event: { created_at?: string }) => event.created_at?.slice(0, 10))
        .filter(Boolean),
    )
    let activeStreak = 0
    for (let offset = 0; offset < 30; offset++) {
      const day = new Date()
      day.setDate(day.getDate() - offset)
      if (!eventDays.has(day.toISOString().slice(0, 10))) break
      activeStreak += 1
    }
    return {
      profile,
      repos,
      totalStars: repos.reduce(
        (sum: number, repo: { stargazers_count?: number }) =>
          sum + (repo.stargazers_count ?? 0),
        0,
      ),
      activeStreak,
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
