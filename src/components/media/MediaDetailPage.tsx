import type { ReactNode } from 'react'
import { Github } from 'lucide-react'
import { getGitHubData } from '@/app/actions/media'
import { CmsErrorState } from '@/components/ui/CmsState'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHero, PageNav, PageShell } from '@/components/ui/PageChrome'
import { CMS_SCHEMA } from '@/lib/cms-schema'
import { getPageCopy, type PageCopy } from '@/lib/site-content'

function DetailShell({
  copy,
  children,
}: {
  copy?: PageCopy
  children: ReactNode
}) {
  return (
    <PageShell>
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? ''}
        accent={copy?.accent}
        description={copy?.description}
      />
      <div className="mt-8 md:mt-10">{children}</div>
      <PageNav />
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
        <CmsErrorState message="This media library is temporarily unavailable." className="mt-12" />
        <PageNav backHref="/media" />
      </PageShell>
    )
  }

  const pagesResult = await getPageCopy()
  const copy = pagesResult.status === 'ok' ? pagesResult.data['media-github'] : undefined
  const profile = data.github?.profile
  const events = data.github?.events?.slice(0, 5) ?? []
  const stars =
    data.github?.repos?.reduce(
      (total: number, repo: { stargazers_count?: number }) => total + (repo.stargazers_count ?? 0),
      0,
    ) ?? 0

  if (!profile) {
    const empty = CMS_SCHEMA.sections.home.github.emptyState
    return (
      <DetailShell copy={copy}>
        <EmptyState
          icon={Github}
          message={empty.message}
          hint={empty.hint}
          actionLabel={empty.actionLabel}
          actionHref={empty.actionHref}
        />
      </DetailShell>
    )
  }

  return (
    <DetailShell copy={copy}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: profile?.public_repos ?? 0, label: 'repositories' },
          { value: stars, label: 'stars received' },
          { value: events.length, label: 'recent activities' },
          { value: data.github?.activeStreak ?? 0, label: 'day streak' },
        ].map((stat) => (
          <div key={stat.label} className="apple-card p-5">
            <strong className="block text-2xl font-semibold tracking-[-0.04em] text-ink">
              {stat.value}
            </strong>
            <span className="text-[11px] text-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2.5">
        {events.map((event: { id: string; type: string }) => (
          <article key={event.id} className="apple-card p-4 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
            <div>
              <strong className="text-xs font-semibold text-ink">
                {event.type.replace('Event', '')}
              </strong>
              <p className="text-[11px] text-muted">Public GitHub activity</p>
            </div>
          </article>
        ))}
      </div>
    </DetailShell>
  )
}
