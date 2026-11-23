import { NextRequest, NextResponse } from 'next/server'
import { isGitHubUsername, summarizeGitHubActivity } from '@/lib/github-activity'

export const revalidate = 300

/**
 * The public GitHub activity card's data.
 *
 * Read on the server so visitors never call `api.github.com` themselves: the
 * unauthenticated quota is per IP, and one visitor per address would exhaust it
 * for everyone. The route uses GITHUB_TOKEN when the deployment has one, caches
 * its own output for five minutes, and answers with the same shape the card has
 * always rendered.
 */
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.trim() ?? ''
  if (!isGitHubUsername(username)) {
    return NextResponse.json({ error: 'Add a GitHub username first.' }, { status: 400 })
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ashokrimal-portfolio-activity',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    const [profileRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=10`,
        { headers, next: { revalidate: 300 } },
      ),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
        { headers, next: { revalidate: 300 } },
      ),
    ])

    if (profileRes.status === 404) {
      return NextResponse.json({ error: `github.com/${username} was not found.` }, { status: 404 })
    }
    if (!profileRes.ok || !eventsRes.ok) {
      return NextResponse.json(
        {
          error:
            profileRes.status === 403 || eventsRes.status === 403
              ? 'GitHub is rate-limiting this deployment right now.'
              : 'GitHub did not answer with activity.',
        },
        { status: 502 },
      )
    }

    const profile = (await profileRes.json()) as { public_repos?: number }
    const repos = reposRes.ok ? ((await reposRes.json()) as unknown[]) : []
    const events = (await eventsRes.json()) as unknown[]

    const data = summarizeGitHubActivity({
      username,
      profile,
      repos: Array.isArray(repos) ? (repos as Array<{ stargazers_count?: number }>) : [],
      events: Array.isArray(events) ? (events as Parameters<typeof summarizeGitHubActivity>[0]['events']) : [],
    })

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    })
  } catch (error) {
    console.error('[github] Activity lookup failed:', (error as Error).message)
    return NextResponse.json({ error: 'GitHub could not be reached.' }, { status: 502 })
  }
}
