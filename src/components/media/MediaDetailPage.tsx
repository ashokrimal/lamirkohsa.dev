import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  BookMarked,
  Code2,
  Flame,
  FolderGit2,
  GitBranch,
  GitCommit,
  GitFork,
  Github,
  MapPin,
  Star,
  Users,
} from 'lucide-react'
import { getGitHubData, type GitHubEventItem, type GitHubRepoItem } from '@/app/actions/media'
import { CmsErrorState } from '@/components/ui/CmsState'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  GitHubActivitySparkline,
  type GitHubActivityData,
} from '@/components/ui/GitHubActivitySparkline'
import { PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { getPageCopy, type PageCopy } from '@/lib/site-content'

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-sky-500',
  JavaScript: 'bg-amber-400',
  Python: 'bg-emerald-500',
  CSS: 'bg-indigo-500',
  HTML: 'bg-orange-500',
  Dart: 'bg-teal-500',
  Java: 'bg-rose-500',
  Shell: 'bg-zinc-500',
}

function formatShortDate(raw?: string): string {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatDispatchDate(raw?: string): string {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function describeGitHubEvent(event: GitHubEventItem): {
  kind: string
  summary: string
} {
  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload?.commits ?? []
      const firstMessage = commits[0]?.message?.split('\n')[0]?.trim()
      return {
        kind: commits.length > 1 ? `Push (${commits.length} commits)` : 'Push',
        summary: firstMessage || 'Pushed updates to repository branch',
      }
    }
    case 'CreateEvent': {
      const refType = event.payload?.ref_type || 'branch'
      const ref = event.payload?.ref ? ` ${event.payload.ref}` : ''
      return {
        kind: 'Create',
        summary: `Initialized ${refType}${ref}`,
      }
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action || 'Updated'
      const num = event.payload?.number ? ` #${event.payload.number}` : ''
      return {
        kind: 'Pull Request',
        summary: `${action.charAt(0).toUpperCase() + action.slice(1)} pull request${num}`,
      }
    }
    case 'IssuesEvent': {
      const action = event.payload?.action || 'Updated'
      const title = event.payload?.issue?.title
      return {
        kind: 'Issue',
        summary: title || `${action.charAt(0).toUpperCase() + action.slice(1)} issue #${event.payload?.number || ''}`.trim(),
      }
    }
    case 'ReleaseEvent':
      return {
        kind: 'Release',
        summary: event.payload?.release?.tag_name
          ? `Published release ${event.payload.release.tag_name}`
          : 'Published repository release',
      }
    case 'WatchEvent':
      return {
        kind: 'Starred',
        summary: 'Bookmarked open-source repository',
      }
    case 'ForkEvent':
      return {
        kind: 'Fork',
        summary: 'Forked repository for exploration',
      }
    default:
      return {
        kind: event.type.replace('Event', ''),
        summary: 'Public GitHub contribution event',
      }
  }
}

function DetailShell({
  copy,
  meta,
  actions,
  children,
}: {
  copy?: PageCopy
  meta?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <PageShell>
      <PageHero
        eyebrow={copy?.eyebrow || 'Open Source & Commits'}
        krEyebrow={copy?.krEyebrow || '깃허브'}
        title={copy?.title || 'GitHub'}
        accent={copy?.accent || 'activity.'}
        description={
          copy?.description ||
          'Live repositories, commit cadence, primary languages, and recent open-source dispatches.'
        }
        meta={meta}
        actions={actions}
      />
      <div className="mt-8 md:mt-10">{children}</div>
      <PageNav backHref="/about" backLabel="Back to about" />
    </PageShell>
  )
}

export default async function GitHubPage() {
  let data: Awaited<ReturnType<typeof getGitHubData>>
  try {
    data = await getGitHubData()
  } catch (error) {
    console.error('[Media] Could not read GitHub data', error)
    return (
      <PageShell>
        <CmsErrorState message="GitHub activity is temporarily unavailable." className="mt-12" />
        <PageNav backHref="/about" backLabel="Back to about" />
      </PageShell>
    )
  }

  const pagesResult = await getPageCopy()
  const copy = pagesResult.status === 'ok' ? pagesResult.data['media-github'] : undefined
  const configuredUsername = data.settings?.githubUsername?.trim() || ''
  const profile = data.github?.profile
  const username = configuredUsername || profile?.login

  if (!username) {
    const empty = CMS_SCHEMA.sections.home.github.emptyState
    return (
      <DetailShell copy={copy}>
        <EmptyState
          eyebrow="GitHub Integration"
          icon={Github}
          message={empty.message}
          hint={empty.hint}
        />
      </DetailShell>
    )
  }

  if (!profile) {
    return (
      <DetailShell copy={copy}>
        <EmptyState
          eyebrow={`GitHub API · @${username}`}
          icon={Github}
          message={`GitHub profile @${username} could not be loaded right now.`}
          hint="GitHub's public REST API returned no profile data or rate limits are temporarily active."
          footer={
            <a
              href={`https://github.com/${encodeURIComponent(username)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface/80 px-4 py-2 text-xs font-medium text-ink-secondary shadow-xs transition-colors hover:border-line-medium hover:text-accent"
            >
              <span>Open github.com/{username}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          }
        />
      </DetailShell>
    )
  }

  const repos = (data.github?.repos ?? []) as GitHubRepoItem[]
  const events = (data.github?.events ?? []) as GitHubEventItem[]
  const topLanguages = data.github?.topLanguages ?? []
  const totalStars = data.github?.totalStars ?? 0
  const totalForks = data.github?.totalForks ?? 0
  const activeStreak = data.github?.activeStreak ?? 0
  const total30DayCommits = data.github?.total30DayCommits ?? 0

  // Select top non-fork repositories sorted by stars first, then most recently pushed
  const featuredRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      const starDiff = (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
      if (starDiff !== 0) return starDiff
      return new Date(b.pushed_at || b.updated_at || 0).getTime() -
        new Date(a.pushed_at || a.updated_at || 0).getTime()
    })
    .slice(0, 6)

  const recentDispatches = events.slice(0, 8).map((event) => {
    const repoName = event.repo?.name || `${username}`
    const parsed = describeGitHubEvent(event)
    return {
      id: event.id,
      kind: parsed.kind,
      summary: parsed.summary,
      repoName,
      shortRepo: repoName.split('/').pop() || repoName,
      repoUrl: `https://github.com/${repoName}`,
      date: formatDispatchDate(event.created_at),
    }
  })

  const initialSparklineData: GitHubActivityData = {
    username,
    publicRepos: profile.public_repos ?? repos.length,
    totalStars,
    activeStreak,
    total30DayCommits,
    sparkline: data.github?.sparkline ?? [],
    recentActivities: [],
  }

  const profileUrl = profile.html_url || `https://github.com/${username}`
  const metaParts = [
    `@${profile.login}`,
    profile.location || undefined,
    profile.bio || undefined,
  ].filter(Boolean)

  return (
    <DetailShell
      copy={copy}
      meta={
        metaParts.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
            <span className="font-mono text-ink-secondary">@{profile.login}</span>
            {profile.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-accent" aria-hidden="true" />
                  <span>{profile.location}</span>
                </span>
              </>
            )}
            {profile.bio && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-ink-secondary">{profile.bio}</span>
              </>
            )}
          </div>
        ) : undefined
      }
      actions={
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="apple-btn-secondary"
        >
          <Github className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          <span>Open GitHub profile</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        </a>
      }
    >
      {/* Editorial KPI Specification Strip */}
      <section
        aria-label="GitHub profile metrics"
        className="border-y border-line grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line"
      >
        <div className="py-5 pr-4 sm:pr-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <FolderGit2 className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Public repositories</span>
          </div>
          <p className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
            {profile.public_repos ?? repos.length}
          </p>
          <p className="text-xs text-muted">Active source archives</p>
        </div>

        <div className="py-5 pl-4 sm:px-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Star className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Stars &amp; forks</span>
          </div>
          <p className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
            {totalStars}
          </p>
          <p className="text-xs text-muted tabular-nums">
            Across {totalForks} repository {totalForks === 1 ? 'fork' : 'forks'}
          </p>
        </div>

        <div className="py-5 pr-4 sm:px-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Users className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Community network</span>
          </div>
          <p className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
            {profile.followers ?? 0}
          </p>
          <p className="text-xs text-muted tabular-nums">
            Followers · {profile.following ?? 0} following
          </p>
        </div>

        <div className="py-5 pl-4 sm:pl-6 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Flame className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>30-day cadence</span>
          </div>
          <p className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
            {total30DayCommits}
          </p>
          <p className="text-xs text-muted tabular-nums">
            Commits · {activeStreak}d active streak
          </p>
        </div>
      </section>

      {/* Interactive 30-Day Sparkline & Language Composition */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <GitHubActivitySparkline
            username={username}
            initialData={initialSparklineData}
            showRecentCommits={false}
            className="h-full"
          />
        </div>

        <aside className="lg:col-span-4 apple-card p-6 md:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted">
              Primary Stack
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Repository languages
            </h2>
          </div>

          {topLanguages.length > 0 ? (
            <>
              <div className="space-y-3.5">
                {topLanguages.map((item) => {
                  const dotClass = LANG_COLORS[item.language] || 'bg-accent'
                  return (
                    <div key={item.language} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-2 font-medium text-ink">
                          <span
                            className={`h-2 w-2 rounded-full ${dotClass}`}
                            aria-hidden="true"
                          />
                          {item.language}
                        </span>
                        <span className="font-mono text-[11px] text-muted tabular-nums">
                          {item.percentage}% ({item.count})
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-overlay">
                        <div
                          className={`h-full rounded-full ${dotClass}`}
                          style={{ width: `${Math.max(4, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[11px] text-muted border-t border-line-hairline pt-3">
                Computed across original non-fork public repositories.
              </p>
            </>
          ) : (
            <EmptyState
              eyebrow={`Repository Languages · @${username}`}
              icon={Code2}
              message="No language breakdown available yet."
              hint="Original non-fork public repositories with detected source code will populate this breakdown."
            />
          )}
        </aside>
      </div>

      {/* 01. FEATURED PUBLIC REPOSITORIES */}
      <PageSection
        number={0}
        eyebrow="Repositories"
        title="Highlighted source"
        accent="archives."
        description="Original public repositories ordered by community stars and recent push cadence."
        linkHref={`${profileUrl}?tab=repositories`}
        linkLabel="All repositories"
      >
        {featuredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredRepos.map((repo) => {
              const langColor = repo.language ? LANG_COLORS[repo.language] || 'bg-accent' : ''
              const updatedLabel = formatShortDate(repo.pushed_at || repo.updated_at)

              return (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="apple-card group p-5 md:p-6 flex flex-col justify-between gap-4 transition-colors hover:border-line-strong"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookMarked
                          className="h-4 w-4 text-accent shrink-0"
                          aria-hidden="true"
                        />
                        <h3 className="text-base font-semibold tracking-tight text-ink group-hover:text-accent transition-colors truncate">
                          {repo.name}
                        </h3>
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 text-muted shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="text-xs md:text-sm text-muted leading-relaxed line-clamp-2">
                      {repo.description || 'Open-source repository published on GitHub.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-line-hairline text-[11px] text-muted tabular-nums">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5 text-ink-secondary font-medium">
                        <span
                          className={`h-2 w-2 rounded-full ${langColor}`}
                          aria-hidden="true"
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-accent" aria-hidden="true" />
                      {repo.stargazers_count ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="h-3 w-3 text-muted" aria-hidden="true" />
                      {repo.forks_count ?? 0}
                    </span>
                    {updatedLabel && <span className="ml-auto font-mono">{updatedLabel}</span>}
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <EmptyState
            eyebrow={`Public Repositories · @${username}`}
            icon={FolderGit2}
            message={`No original public repositories found for @${username}.`}
            hint="Non-fork public repositories pushed to GitHub will appear here automatically."
          />
        )}
      </PageSection>

      {/* 02. RECENT DISPATCHES TIMELINE */}
      <PageSection
        number={1}
        eyebrow="Dispatches"
        title="Recent commit"
        accent="stream."
        description="Latest public pushes, repository creations, and pull requests synced from GitHub."
      >
        {recentDispatches.length > 0 ? (
          <div className="apple-card divide-y divide-line-hairline">
            {recentDispatches.map((item) => (
              <a
                key={item.id}
                href={item.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start justify-between gap-4 p-4 sm:p-5 transition-colors hover:bg-overlay-faint"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line-subtle bg-overlay-faint text-accent">
                    {item.kind.startsWith('Push') ? (
                      <GitCommit className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span className="font-semibold text-ink group-hover:text-accent transition-colors truncate">
                        {item.shortRepo}
                      </span>
                      <span aria-hidden="true" className="text-muted">·</span>
                      <span className="font-mono text-[11px] text-muted">{item.kind}</span>
                    </div>
                    <p className="text-xs md:text-sm text-ink-secondary leading-snug line-clamp-1">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-muted tabular-nums">
                  {item.date && <span className="hidden sm:inline">{item.date}</span>}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState
            eyebrow={`Commit Stream · @${username}`}
            icon={GitCommit}
            message={`No recent public commit events found for @${username}.`}
            hint="Public pushes, pull requests, and release dispatches within GitHub's activity window appear here."
          />
        )}
      </PageSection>
    </DetailShell>
  )
}
