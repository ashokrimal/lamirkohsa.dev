'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Film,
  FolderKanban,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  AlertTriangle,
  Link2,
  Loader2,
  Music2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { CmsModal } from '@/components/admin/ui/CmsModal'
import { CmsToastProvider, useCmsToast } from '@/components/admin/ui/CmsToast'
import {
  deleteCmsContent,
  resetCmsContent,
  toggleCmsStatus,
  type BulkResetMode,
} from '@/app/actions/content-cms'
import {
  fieldsForTab,
  publicPathForCollection,
  tabForCollection,
  type VaultDefinition,
  type VaultIconName,
  type VaultRecord,
} from '@/lib/admin-vaults'
import AudioPreview from '@/components/admin/vaults/AudioPreview'
import BulkDropzone from '@/components/admin/vaults/BulkDropzone'
import VaultEditor from '@/components/admin/vaults/VaultEditor'

const ICONS: Record<VaultIconName, typeof Music2> = {
  music: Music2,
  image: ImageIcon,
  film: Film,
  file: FileText,
  folder: FolderKanban,
  graduation: GraduationCap,
  globe: Globe2,
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function imageFor(record: VaultRecord) {
  return (
    text(record.payload.imageUrl) ||
    text(record.payload.coverUrl) ||
    text(record.payload.avatarUrl) ||
    text(record.payload.ogImage)
  )
}

function dateLabel(value: unknown) {
  const raw = text(value)
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function CardMeta({ record, vault }: { record: VaultRecord; vault: VaultDefinition }) {
  const payload = record.payload
  const rows: { label: string; value: string; href?: string }[] = []

  switch (vault.id) {
    case 'music': {
      const artist = text(payload.artist)
      const album = text(payload.subtitle)
      if (artist) rows.push({ label: 'Artist', value: artist })
      if (album) rows.push({ label: 'Release', value: album })
      break
    }
    case 'gallery':
      if (text(payload.category)) rows.push({ label: 'Category', value: text(payload.category) })
      if (text(payload.location)) rows.push({ label: 'Placement', value: text(payload.location) })
      break
    case 'media':
      if (text(payload.creator)) rows.push({ label: 'Creator', value: text(payload.creator) })
      if (text(payload.year)) rows.push({ label: 'Year', value: text(payload.year) })
      if (payload.rating !== undefined && payload.rating !== '') rows.push({ label: 'Rating', value: `★ ${String(payload.rating)}/10` })
      if (text(payload.category)) rows.push({ label: 'Watch status', value: text(payload.category) })
      break
    case 'blogs':
      if (text(payload.category)) rows.push({ label: 'Category', value: text(payload.category) })
      if (text(payload.publishAt)) rows.push({ label: 'Schedule', value: dateLabel(payload.publishAt) })
      break
    case 'projects':
      if (text(payload.category)) rows.push({ label: 'Type', value: text(payload.category) })
      if (text(payload.liveUrl)) rows.push({ label: 'Live', value: 'Open demo', href: text(payload.liveUrl) })
      if (text(payload.githubUrl)) rows.push({ label: 'Code', value: 'Repository', href: text(payload.githubUrl) })
      break
    case 'career':
      if (text(payload.organization)) rows.push({ label: 'Organisation', value: text(payload.organization) })
      if (text(payload.period)) rows.push({ label: 'Period', value: text(payload.period) })
      if (text(payload.location)) rows.push({ label: 'Location', value: text(payload.location) })
      break
    case 'meta':
      rows.push({ label: 'Collection', value: record.collection })
      if (text(payload.key)) rows.push({ label: 'Key', value: text(payload.key) })
      if (text(payload.headline)) rows.push({ label: 'Headline', value: text(payload.headline) })
      if (text(payload.seoTitle)) rows.push({ label: 'SEO title', value: text(payload.seoTitle) })
      break
  }

  if (!rows.length) return null

  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
      {rows.slice(0, 4).map((row) => (
        <div key={`${row.label}-${row.value}`} className="min-w-0">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">{row.label}</dt>
          <dd className="truncate text-[11px] font-medium text-slate-700">
            {row.href ? (
              <a href={row.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:underline">
                {row.value} <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function VaultCard({
  record,
  vault,
  featured,
  pending,
  onEdit,
  onToggle,
  onDelete,
}: {
  record: VaultRecord
  vault: VaultDefinition
  featured: boolean
  pending: boolean
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const Icon = ICONS[vault.icon]
  const image = imageFor(record)
  const tags = [...list(record.payload.tags), ...list(record.payload.techStack), ...list(record.payload.skills)].slice(0, 4)
  const published = record.status === 'published'
  const path = publicPathForCollection(record.collection)
  const category = text(record.payload.category) || text(record.payload.playlist)
  const platform = text(record.payload.platform)
  const platformUrl = text(record.payload.platformUrl)
  const audioUrl = vault.id === 'music' ? text(record.payload.externalUrl) : ''
  const scheduled = vault.id === 'blogs' && text(record.payload.publishAt) && new Date(text(record.payload.publishAt)).getTime() > Date.now()

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={text(record.payload.altText) || record.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-teal-50">
            <Icon className="h-10 w-10 text-slate-300" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
              {record.collection}
            </span>
            {category && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-slate-700 backdrop-blur">
                {category}
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur ${
              published ? 'bg-emerald-500/90 text-white' : scheduled ? 'bg-amber-400/95 text-amber-950' : 'bg-white/90 text-slate-600'
            }`}
          >
            {scheduled ? <Clock3 className="h-2.5 w-2.5" /> : published ? <CheckCircle2 className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
            {scheduled ? 'Scheduled' : published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-snug text-slate-900">{record.title}</h3>
          {pending && <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-teal-600" />}
        </div>

        {text(record.payload.excerpt) || text(record.payload.summary) || text(record.payload.description) ? (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
            {text(record.payload.excerpt) || text(record.payload.summary) || text(record.payload.description)}
          </p>
        ) : null}

        <CardMeta record={record} vault={vault} />

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {vault.id === 'music' && (
          <>
            <AudioPreview src={audioUrl} title={record.title} />
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
              {platformUrl ? (
                <a href={platformUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline">
                  <Link2 className="h-3 w-3" /> {platform || 'Platform'} linked
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Link2 className="h-3 w-3" /> No platform link
                </span>
              )}
            </div>
          </>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <a
            href={path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-teal-700"
            title={published ? `Live on ${path}` : `Draft targeted at ${path}`}
          >
            <Globe2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{published ? `Live · ${path}` : `Draft · ${path}`}</span>
          </a>
          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={onEdit} aria-label={`Edit ${record.title}`} title="Edit" className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={onToggle} aria-label={published ? `Unpublish ${record.title}` : `Publish ${record.title}`} title={published ? 'Unpublish' : 'Publish'} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-700">
              {published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={onDelete} aria-label={`Delete ${record.title}`} title="Delete" className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function VaultWorkspaceInner({ vault, records, storageReady }: { vault: VaultDefinition; records: VaultRecord[]; storageReady: boolean }) {
  const router = useRouter()
  const { toast } = useCmsToast()
  const [items, setItems] = useState(records)
  const [activeTabId, setActiveTabId] = useState(vault.tabs[0].id)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [editor, setEditor] = useState<{ record?: VaultRecord; collection: string } | null>(null)
  const [deleting, setDeleting] = useState<VaultRecord | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetScope, setResetScope] = useState<'tab' | 'vault'>('tab')
  const [resetMode, setResetMode] = useState<BulkResetMode>('draft')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetBusy, setResetBusy] = useState(false)
  const [pending, setPending] = useState<Set<number>>(new Set())

  useEffect(() => setItems(records), [records])

  const activeTab = vault.tabs.find((tab) => tab.id === activeTabId) ?? vault.tabs[0]
  const tabRecords = useMemo(
    () => items.filter((record) => activeTab.collections.includes(record.collection)),
    [items, activeTab],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tabRecords.filter((record) => {
      if (category !== 'all' && vault.filterKey) {
        const value = text(record.payload[vault.filterKey])
        if (value.toLowerCase() !== category.toLowerCase()) return false
      }
      if (!needle) return true
      const haystack = [
        record.title,
        record.collection,
        ...Object.values(record.payload).flatMap((value) => (Array.isArray(value) ? value : [value])),
      ]
        .filter((value) => typeof value === 'string')
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [tabRecords, query, category, vault.filterKey])

  const liveCount = items.filter((record) => record.status === 'published').length
  const defaultCollection = activeTab.collections[0]
  const resetCollections =
    resetScope === 'tab'
      ? activeTab.collections
      : Array.from(new Set(vault.tabs.flatMap((tab) => tab.collections)))
  const resetCollectionSet = new Set(resetCollections)
  const resetCount = items.filter((record) => resetCollectionSet.has(record.collection)).length
  const resetReady = resetConfirm.trim().toUpperCase() === 'RESET'

  const markPending = (id: number) =>
    setPending((current) => new Set(current).add(id))
  const clearPending = (id: number) =>
    setPending((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })

  const handleSaved = (saved: VaultRecord) => {
    setItems((current) => {
      const existing = current.some((record) => record.id === saved.id)
      return existing ? current.map((record) => (record.id === saved.id ? saved : record)) : [saved, ...current]
    })
    setActiveTabId(tabForCollection(vault, saved.collection).id)
    toast({
      title: saved.id < 0 ? 'Draft created' : 'Changes saved',
      description: `${saved.title} is now in the ${vault.title.toLowerCase()}.`,
    })
    router.refresh()
  }

  const handleCreated = (created: VaultRecord) => {
    setItems((current) => [created, ...current])
  }

  const handleToggle = async (record: VaultRecord) => {
    const nextStatus = record.status === 'published' ? 'draft' : 'published'
    markPending(record.id)
    setItems((current) =>
      current.map((item) => (item.id === record.id ? { ...item, status: nextStatus } : item)),
    )
    try {
      await toggleCmsStatus(record.id)
      toast({
        title: nextStatus === 'published' ? 'Published live' : 'Moved to drafts',
        description: `${record.title} was updated.`,
        variant: nextStatus === 'published' ? 'success' : 'info',
      })
      router.refresh()
    } catch (error) {
      setItems((current) =>
        current.map((item) => (item.id === record.id ? { ...item, status: record.status } : item)),
      )
      toast({
        title: 'Status update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
      })
    } finally {
      clearPending(record.id)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await deleteCmsContent(deleting.id)
      setItems((current) => current.filter((item) => item.id !== deleting.id))
      toast({ title: 'Item deleted', description: `${deleting.title} was removed from the vault.`, variant: 'info' })
      setDeleting(null)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
      })
    } finally {
      setDeletingBusy(false)
    }
  }

  const handleBulkReset = async () => {
    if (!resetReady || resetCount === 0) return
    setResetBusy(true)
    try {
      const result = await resetCmsContent(resetCollections, resetMode)
      setItems((current) =>
        resetMode === 'delete'
          ? current.filter((record) => !resetCollectionSet.has(record.collection))
          : current.map((record) =>
              resetCollectionSet.has(record.collection) ? { ...record, status: 'draft' } : record,
            ),
      )
      toast({
        title: resetMode === 'delete' ? 'Vault content deleted' : 'Vault content reset to drafts',
        description: `${result.count} ${result.count === 1 ? 'record' : 'records'} affected in ${resetScope === 'tab' ? activeTab.label : vault.title}.`,
        variant: resetMode === 'delete' ? 'info' : 'success',
      })
      setResetOpen(false)
      setResetConfirm('')
      setResetMode('draft')
      setResetScope('tab')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Bulk reset failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
      })
    } finally {
      setResetBusy(false)
    }
  }

  const categories = vault.categories ?? []
  const Icon = ICONS[vault.icon]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-5 py-5 text-white shadow-lg sm:px-6 sm:py-6">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-teal-300 ring-1 ring-white/10">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-300">{vault.eyebrow}</p>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{vault.title}</h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-[13px]">{vault.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {vault.syncLabel}
              </span>
              {vault.storageSensitive && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                  {storageReady ? 'Blob storage ready' : 'URL-only uploads'}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                {liveCount} live
              </span>
            </div>
          </div>

          <div className="flex items-end gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
              <p className="text-xl font-bold tabular-nums">{items.length}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{vault.itemNoun}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditor({ collection: defaultCollection })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-400 px-3.5 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition-colors hover:bg-teal-300"
            >
              <Plus className="h-3.5 w-3.5" /> {vault.addLabel}
            </button>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 lg:pb-0">
            {vault.tabs.map((tab) => {
              const count = items.filter((record) => tab.collections.includes(record.collection)).length
              const active = tab.id === activeTab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTabId(tab.id)
                    setCategory('all')
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 text-[9px] ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative min-w-0 flex-1 lg:w-60">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${vault.itemNoun}…`}
                aria-label={`Search ${vault.itemNoun}`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setResetConfirm('')
                setResetMode('draft')
                setResetScope('tab')
                setResetOpen(true)
              }}
              title="Bulk content reset"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bulk reset</span>
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-2 flex gap-1 overflow-x-auto border-t border-slate-100 pt-2">
            {['all', ...categories].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  category === option
                    ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {option === 'all' ? 'All categories' : option}
              </button>
            ))}
          </div>
        )}
      </div>

      {vault.allowBulkUpload && (
        <BulkDropzone
          domain={vault.id === 'gallery' ? 'gallery' : 'media'}
          collection={activeTab.collections[0]}
          category={category === 'all' ? undefined : category}
          onCreated={handleCreated}
        />
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record, index) => (
            <VaultCard
              key={record.id}
              record={record}
              vault={vault}
              featured={index === 0 && filtered.length > 2}
              pending={pending.has(record.id)}
              onEdit={() => setEditor({ record, collection: record.collection })}
              onToggle={() => void handleToggle(record)}
              onDelete={() => setDeleting(record)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-sm font-semibold text-slate-800">
            {query || category !== 'all'
              ? `No ${vault.itemNoun} match this view`
              : vault.id === 'meta'
                ? 'Nothing in About & Meta yet'
                : `The ${vault.title.toLowerCase()} is empty`}
          </h2>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {query || category !== 'all'
              ? 'Clear the search or category filter to see the rest of the vault.'
              : vault.allowBulkUpload
                ? 'Drop images above to create drafts, or add one item manually with full metadata.'
                : vault.id === 'meta'
                  ? 'Add your profile, social links, or page settings to shape the public site.'
                  : `Add the first ${vault.itemNoun.replace(/s$/, '')} and it will show up on the public site once published.`}
          </p>
          {query || category !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCategory('all')
              }}
              className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditor({ collection: defaultCollection })}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" /> {vault.addLabel}
            </button>
          )}
        </div>
      )}

      {editor && (
        <VaultEditor
          key={`${editor.record?.id ?? 'new'}-${editor.collection}`}
          vault={vault}
          fields={fieldsForTab(vault, tabForCollection(vault, editor.collection).id)}
          record={editor.record}
          collection={editor.collection}
          keyed={tabForCollection(vault, editor.collection).keyed}
          onClose={() => setEditor(null)}
          onSaved={handleSaved}
        />
      )}

      <CmsModal
        isOpen={resetOpen}
        onClose={() => !resetBusy && setResetOpen(false)}
        title="Bulk content reset"
        description={`Reset records in ${vault.title}. This affects the CMS immediately; published pages revalidate.`}
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              disabled={resetBusy}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleBulkReset()}
              disabled={resetBusy || !resetReady || resetCount === 0}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white disabled:pointer-events-none disabled:opacity-40 ${
                resetMode === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {resetBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {resetBusy ? 'Resetting…' : resetMode === 'delete' ? 'Delete permanently' : 'Move to drafts'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              This is a bulk operation. Choose the scope and what happens to the records, then type{' '}
              <strong className="font-bold">RESET</strong> to confirm. Search and category filters do not
              narrow a bulk reset.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Scope</legend>
            {[
              {
                id: 'tab' as const,
                label: `Current tab · ${activeTab.label}`,
                detail: `${items.filter((record) => activeTab.collections.includes(record.collection)).length} records in this tab`,
              },
              {
                id: 'vault' as const,
                label: `Entire vault · ${vault.title}`,
                detail: `${items.length} records across ${vault.tabs.length} tab${vault.tabs.length === 1 ? '' : 's'}`,
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${
                  resetScope === option.id ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reset-scope"
                  value={option.id}
                  checked={resetScope === option.id}
                  onChange={() => setResetScope(option.id)}
                  className="mt-0.5 accent-teal-600"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-800">{option.label}</span>
                  <span className="block text-[11px] text-slate-500">{option.detail}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Result</legend>
            <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${resetMode === 'draft' ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input
                type="radio"
                name="reset-mode"
                value="draft"
                checked={resetMode === 'draft'}
                onChange={() => setResetMode('draft')}
                className="mt-0.5 accent-teal-600"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-800">Move everything to drafts</span>
                <span className="block text-[11px] text-slate-500">Safe and reversible. Content leaves the public site but stays in the vault.</span>
              </span>
            </label>
            <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${resetMode === 'delete' ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input
                type="radio"
                name="reset-mode"
                value="delete"
                checked={resetMode === 'delete'}
                onChange={() => setResetMode('delete')}
                className="mt-0.5 accent-rose-600"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-800">Delete records permanently</span>
                <span className="block text-[11px] text-slate-500">Removes every selected record from the CMS. This cannot be undone.</span>
              </span>
            </label>
          </fieldset>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <label className="text-[11px] font-semibold text-slate-700" htmlFor="reset-confirmation">
              Type <code className="rounded bg-white px-1 py-0.5 font-mono text-[10px] text-rose-700">RESET</code> to confirm {resetCount} affected {resetCount === 1 ? 'record' : 'records'}
            </label>
            <input
              id="reset-confirmation"
              value={resetConfirm}
              onChange={(event) => setResetConfirm(event.target.value)}
              placeholder="RESET"
              autoComplete="off"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-900 outline-none focus:border-rose-400"
            />
          </div>
        </div>
      </CmsModal>

      <CmsModal
        isOpen={Boolean(deleting)}
        onClose={() => !deletingBusy && setDeleting(null)}
        title="Delete this item?"
        description={deleting ? `“${deleting.title}” will be removed from the CMS. This cannot be undone.` : undefined}
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              disabled={deletingBusy}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Keep item
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deletingBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> {deletingBusy ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-slate-600">
          Published content disappears from the public site immediately. Drafts only leave the vault.
        </p>
      </CmsModal>
    </div>
  )
}

export default function VaultWorkspace(props: {
  vault: VaultDefinition
  records: VaultRecord[]
  storageReady: boolean
}) {
  return (
    <CmsToastProvider>
      <VaultWorkspaceInner {...props} />
    </CmsToastProvider>
  )
}
