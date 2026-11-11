'use client'

import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, Plus, Sparkles } from 'lucide-react'

type CmsRecord = {
  collection: string
  title: string
  payload?: Record<string, unknown> | null
  status?: string
}

interface ContentSetupGuideProps {
  records: CmsRecord[]
  galleryCount: number
  projectCount: number
  musicCount: number
  onNewRecord: (collection?: string) => void
  onNewGallery: () => void
  onNewMusic: () => void
}

const SINGLETON_GROUPS = [
  {
    title: 'Site identity & navigation',
    hint: 'The name, menu and footer every page shares.',
    collection: CMS_COLLECTIONS.siteSettings,
    items: [
      { slug: 'brand', label: 'Brand name and domain' },
      { slug: 'navigation', label: 'Navigation and social links' },
      { slug: 'footer', label: 'Footer copy and availability' },
      { slug: 'hero-section', label: 'Homepage hero' },
      { slug: 'homepage-sections', label: 'Homepage section order' },
    ],
  },
  {
    title: 'Page copy',
    hint: 'Headlines and intros for each public page.',
    collection: CMS_COLLECTIONS.pageCopy,
    items: [
      { slug: 'about', label: 'About page copy' },
      { slug: 'projects', label: 'Projects page copy' },
      { slug: 'media', label: 'Media page copy' },
      { slug: 'gallery', label: 'Gallery page copy' },
      { slug: 'contact', label: 'Contact page copy' },
    ],
  },
]

const COLLECTION_GROUPS = [
  {
    title: 'About you',
    hint: 'Biography, career and the details visitors read.',
    collection: CMS_COLLECTIONS.profile,
    items: [
      { collection: CMS_COLLECTIONS.profile, label: 'Profile & biography' },
      { collection: CMS_COLLECTIONS.education, label: CMS_COLLECTIONS.education },
      { collection: CMS_COLLECTIONS.experience, label: CMS_COLLECTIONS.experience },
      { collection: CMS_COLLECTIONS.skills, label: CMS_COLLECTIONS.skills },
      { collection: 'Interests', label: 'Interests' },
      { collection: CMS_COLLECTIONS.socialLinks, label: 'Social links' },
    ],
  },
  {
    title: 'Work & media',
    hint: 'Projects, photographs and the four media shelves.',
    collection: CMS_COLLECTIONS.projects,
    items: [
      { collection: CMS_COLLECTIONS.projects, label: 'Case studies' },
      { collection: CMS_COLLECTIONS.music, label: 'Music shelf' },
      { collection: CMS_COLLECTIONS.movies, label: 'Movies shelf' },
      { collection: CMS_COLLECTIONS.anime, label: 'Anime shelf' },
      { collection: CMS_COLLECTIONS.manga, label: 'Manga shelf' },
    ],
  },
]

function recordSlug(record: CmsRecord) {
  const key = typeof record.payload?.key === 'string' ? record.payload.key : undefined
  return (record.title || key || '').toLowerCase().replace(/\s+/g, '-')
}

/** A record counts as filled only when it has at least one non-empty payload value. */
function hasContent(record: CmsRecord | undefined) {
  if (!record) return false
  const payload = record.payload
  if (!payload || typeof payload !== 'object') return false
  return Object.entries(payload).some(([key, value]) => {
    if (key === 'key' || key === 'userId') return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    if (value && typeof value === 'object') return Object.keys(value).length > 0
    return value !== null && value !== undefined
  })
}

function StatusRow({
  filled,
  label,
  action,
  statusLabel,
}: {
  filled: boolean
  label: string
  action: React.ReactNode
  statusLabel?: string
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-xs text-slate-700">
        {filled ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
        ) : (
          <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
        )}
        <span className="truncate">{label}</span>
        {!filled && statusLabel && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {statusLabel}
          </span>
        )}
      </span>
      {!filled && action}
    </li>
  )
}

/**
 * Categorised map of everything the public site reads from the CMS. It only
 * reports real records — empty collections stay listed as missing so the owner
 * knows what to write next.
 */
export default function ContentSetupGuide({
  records,
  galleryCount,
  projectCount,
  musicCount,
  onNewRecord,
  onNewGallery,
  onNewMusic,
}: ContentSetupGuideProps) {
  const singletons = useMemo(
    () =>
      SINGLETON_GROUPS.map((group) => {
        const groupRecords = records.filter((record) => record.collection === group.collection)
        return {
          ...group,
          items: group.items.map((item) => {
            const record = groupRecords.find((candidate) => recordSlug(candidate) === item.slug)
            return { ...item, filled: hasContent(record) }
          }),
        }
      }),
    [records],
  )

  const collections = useMemo(
    () =>
      COLLECTION_GROUPS.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          filled: records.some((record) => record.collection === item.collection && hasContent(record)),
        })),
      })),
    [records],
  )

  const mediaCounts: Record<string, number> = useMemo(
    () => ({
      Gallery: galleryCount,
      Projects: projectCount,
      Music: musicCount,
    }),
    [galleryCount, projectCount, musicCount],
  )

  const allItems = [
    ...singletons.flatMap((group) => group.items),
    ...collections.flatMap((group) => group.items),
    { filled: galleryCount > 0 },
    { filled: projectCount > 0 },
    { filled: musicCount > 0 },
  ]
  const filledCount = allItems.filter((item) => item.filled).length

  const contentLink = (collection: string) => (
    <Link
      href={`/admin?section=content&collection=${encodeURIComponent(collection)}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
    >
      Edit
      <ArrowRight className="h-3 w-3" aria-hidden="true" />
    </Link>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-200/70 bg-teal-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Fill the site from here</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Everything the public pages show comes from these records. Start with the sections marked open;
              each one links straight to its editor.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-xs font-medium text-teal-800">
          {filledCount} of {allItems.length} areas filled
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {singletons.map((group) => (
          <section key={group.title} className="rounded-2xl border border-slate-200/90 bg-surface p-5">
            <h3 className="text-sm font-semibold text-slate-900">{group.title}</h3>
            <p className="mt-1 text-[11px] text-slate-500">{group.hint}</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {group.items.map((item) => (
                <StatusRow
                  key={item.slug}
                  filled={item.filled}
                  label={item.label}
                  statusLabel="Open"
                  action={contentLink(group.collection)}
                />
              ))}
            </ul>
          </section>
        ))}

        {collections.map((group) => (
          <section key={group.title} className="rounded-2xl border border-slate-200/90 bg-surface p-5">
            <h3 className="text-sm font-semibold text-slate-900">{group.title}</h3>
            <p className="mt-1 text-[11px] text-slate-500">{group.hint}</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {group.items.map((item) => {
                const count = mediaCounts[item.collection]
                const filled = count !== undefined ? count > 0 : item.filled
                const action =
                  item.collection === CMS_COLLECTIONS.projects ? (
                    <button
                      type="button"
                      onClick={() => onNewRecord(CMS_COLLECTIONS.projects)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      Add
                    </button>
                  ) : (
                    contentLink(item.collection)
                  )
                return (
                  <StatusRow
                    key={item.collection}
                    filled={filled}
                    label={item.label}
                    statusLabel={count !== undefined ? `${count} published` : 'Open'}
                    action={action}
                  />
                )
              })}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl border border-slate-200/90 bg-surface p-5">
          <h3 className="text-sm font-semibold text-slate-900">Gallery</h3>
          <p className="mt-1 text-[11px] text-slate-500">Photographs shown on the homepage and gallery page.</p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-2 text-xs text-slate-700">
              {galleryCount > 0 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              )}
              {galleryCount > 0 ? `${galleryCount} photos` : 'No photos yet'}
            </span>
            <button
              type="button"
              onClick={onNewGallery}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Upload photo
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-surface p-5">
          <h3 className="text-sm font-semibold text-slate-900">Music</h3>
          <p className="mt-1 text-[11px] text-slate-500">Tracks on the media shelf, with audio and cover art.</p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-2 text-xs text-slate-700">
              {musicCount > 0 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              )}
              {musicCount > 0 ? `${musicCount} tracks` : 'No tracks yet'}
            </span>
            <button
              type="button"
              onClick={onNewMusic}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Add track
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-surface p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Contact & integrations</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Contact details live in Site Settings; public profile handles live in Settings. API keys are
            deployment secrets, never CMS fields.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/admin?section=content&collection=Site%20Settings"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
            >
              Contact details
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <Link
              href="/admin?section=settings"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
            >
              Profile handles
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <Link
              href="/admin/account"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
            >
              Password & account
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
