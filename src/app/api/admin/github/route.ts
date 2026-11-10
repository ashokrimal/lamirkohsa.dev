import { NextRequest, NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')?.trim() || ''
  if (!username) return NextResponse.json({ error: 'Add a GitHub username in Settings first.' }, { status: 400 })

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AshokRimal-Portfolio-CMS/1.0',
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 60 },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`, {
        headers,
        next: { revalidate: 60 },
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`, {
        headers,
        next: { revalidate: 60 },
      }),
    ])

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ error: `GitHub user "${username}" was not found.` }, { status: 404 })
      }
            return NextResponse.json({ error: 'Failed to fetch data from GitHub API.' }, { status: userRes.status })

    }

    const profile = await userRes.json()
    const repos = reposRes.ok ? await reposRes.json() : []
    const events = eventsRes.ok ? await eventsRes.json() : []

    // Calculate aggregated statistics
    const totalStars = repos.reduce(
      (sum: number, r: { stargazers_count?: number }) => sum + (r.stargazers_count || 0),
      0
    )
    const totalForks = repos.reduce(
      (sum: number, r: { forks_count?: number }) => sum + (r.forks_count || 0),
      0
    )

    // Language statistics
    const languageCounts: Record<string, number> = {}
    repos.forEach((r: { language?: string | null }) => {
      if (r.language) {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1
      }
    })

    const totalLangRepos = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1
    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({
        language: lang,
        count,
        percentage: Math.round((count / totalLangRepos) * 100),
      }))

    // 30-day commit frequency calculation
    const dailyCommitsMap: Record<string, number> = {}
    events.forEach((event: any) => {
      if (event.type === 'PushEvent' && event.created_at) {
        const dateKey = event.created_at.slice(0, 10)
        const commitCount = event.payload?.commits?.length || 1
        dailyCommitsMap[dateKey] = (dailyCommitsMap[dateKey] || 0) + commitCount
      }
    })

    const commitSparkline = []
    let total30DayCommits = 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      const actualCount = dailyCommitsMap[dateStr] || 0
      const count = actualCount
      total30DayCommits += count
      commitSparkline.push({
        date: dateStr,
        dayLabel,
        count,
      })
    }

    // Calculate streak
    const eventDays = new Set(
      events.map((event: { created_at?: string }) => event.created_at?.slice(0, 10)).filter(Boolean)
    )
    let activeStreak = 0
    for (let offset = 0; offset < 30; offset++) {
      const day = new Date()
      day.setDate(day.getDate() - offset)
      if (!eventDays.has(day.toISOString().slice(0, 10))) break
      activeStreak += 1
    }

    // Format events
    const formattedEvents = events.slice(0, 8).map((e: any) => {
      let message = 'Repository activity'
      if (e.type === 'PushEvent') {
        const commits = e.payload?.commits
        message = commits?.[0]?.message || `Pushed ${commits?.length || 1} commit(s)`
      } else if (e.type === 'CreateEvent') {
        message = `Created ${e.payload?.ref_type || 'resource'} ${e.payload?.ref || ''}`.trim()
      } else if (e.type === 'WatchEvent') {
        message = 'Starred repository'
      } else if (e.type === 'PullRequestEvent') {
        message = `${e.payload?.action || 'Opened'} pull request #${e.payload?.number || ''}`.trim()
      } else if (e.type === 'IssuesEvent') {
        message = `${e.payload?.action || 'Opened'} issue #${e.payload?.issue?.number || ''}`.trim()
      }

      return {
        id: e.id,
        type: e.type,
        repoName: e.repo?.name || '',
        repoUrl: `https://github.com/${e.repo?.name || ''}`,
        message,
        createdAt: e.created_at,
      }
    })

    // Sorted top repositories
    const topRepos = [...repos]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6)
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        html_url: r.html_url,
        description: r.description,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        language: r.language,
        updated_at: r.updated_at,
      }))

    return NextResponse.json({
      rateLimited: false,
      profile: {
        login: profile.login,
        name: profile.name || profile.login,
        avatar_url: profile.avatar_url,
        html_url: profile.html_url,
        bio: profile.bio,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      },
      totalStars,
      totalForks,
      activeStreak,
      commitSparkline,
      total30DayCommits,
      topLanguages,
      repos: topRepos,
      events: formattedEvents,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('GitHub API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to GitHub. Please check your network or try again.' },
      { status: 500 }
    )
  }
}
