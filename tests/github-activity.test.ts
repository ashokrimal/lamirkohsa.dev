import test from 'node:test'
import assert from 'node:assert/strict'
import { isGitHubUsername, summarizeGitHubActivity } from '../src/lib/github-activity'

const NOW = new Date('2026-05-20T12:00:00Z')

function pushEvent(date: string, count: number, repo = 'ashokrimal/site', message = 'feat: x') {
  return {
    type: 'PushEvent',
    created_at: `${date}T09:00:00Z`,
    repo: { name: repo },
    payload: { commits: Array.from({ length: count }, () => ({ message })) },
  }
}

test('counts commits inside the 30-day window only', () => {
  const data = summarizeGitHubActivity({
    username: 'ashokrimal',
    profile: { public_repos: 12 },
    repos: [{ stargazers_count: 3 }, { stargazers_count: 4 }],
    events: [
      pushEvent('2026-05-20', 2),
      pushEvent('2026-05-19', 1),
      pushEvent('2026-01-01', 5),
    ],
    now: NOW,
  })

  assert.equal(data.publicRepos, 12)
  assert.equal(data.totalStars, 7)
  assert.equal(data.total30DayCommits, 3)
  assert.equal(data.sparkline.length, 30)
  assert.equal(data.sparkline.at(-1)?.date, '2026-05-20')
  assert.equal(data.sparkline.at(-1)?.count, 2)
})

test('a streak stops at the first empty day', () => {
  const data = summarizeGitHubActivity({
    username: 'ashokrimal',
    profile: { public_repos: 0 },
    repos: [],
    events: [
      pushEvent('2026-05-20', 1),
      pushEvent('2026-05-19', 1),
      pushEvent('2026-05-17', 1),
    ],
    now: NOW,
  })

  assert.equal(data.activeStreak, 2)
})

test('recent activity keeps three entries with trimmed messages', () => {
  const data = summarizeGitHubActivity({
    username: 'ashokrimal',
    profile: null,
    repos: [],
    events: [
      pushEvent('2026-05-20', 1, 'ashokrimal/a', 'first line\nsecond line'),
      pushEvent('2026-05-19', 1, 'ashokrimal/b'),
      pushEvent('2026-05-18', 1, 'ashokrimal/c'),
      pushEvent('2026-05-17', 1, 'ashokrimal/d'),
    ],
    now: NOW,
  })

  assert.equal(data.recentActivities.length, 3)
  assert.equal(data.recentActivities[0].message, 'first line')
  assert.equal(data.recentActivities[0].url, 'https://github.com/ashokrimal/a')
})

test('non-push events and missing payloads are ignored', () => {
  const data = summarizeGitHubActivity({
    username: 'ashokrimal',
    profile: { public_repos: 1 },
    repos: [],
    events: [
      { type: 'WatchEvent', created_at: '2026-05-20T09:00:00Z' },
      { type: 'PushEvent', created_at: '2026-05-20T09:00:00Z', payload: null },
    ],
    now: NOW,
  })

  // A push without a commit list still counts as one push.
  assert.equal(data.total30DayCommits, 1)
  assert.equal(data.recentActivities.length, 1)
  assert.equal(data.recentActivities[0].message, 'Code commit')
})

test('GitHub usernames are validated before they reach a URL', () => {
  assert.equal(isGitHubUsername('ashokrimal'), true)
  assert.equal(isGitHubUsername('a-b'), true)
  assert.equal(isGitHubUsername('a--b'), false)
  assert.equal(isGitHubUsername('-lead'), false)
  assert.equal(isGitHubUsername('trail-'), false)
  assert.equal(isGitHubUsername('../etc/passwd'), false)
  assert.equal(isGitHubUsername(''), false)
  assert.equal(isGitHubUsername(undefined), false)
})
