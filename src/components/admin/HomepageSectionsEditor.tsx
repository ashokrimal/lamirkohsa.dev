'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react'
import { updateHomepageSectionsOrder } from '@/app/actions/content-cms'
import { SECTIONS } from '@/lib/cms-schema'

interface HomepageSectionsConfig {
  order?: string[]
  enabled?: Record<string, boolean>
}

interface SectionRow {
  id: string
  enabled: boolean
}

const REGISTRY_IDS = SECTIONS.map((section) => section.id)

/**
 * Builds the editor rows: the configured order first (ignoring ids the code no
 * longer registers), then any registered section the record has not mentioned.
 * A section is visible unless the CMS explicitly disabled it.
 */
function initialRows(config?: HomepageSectionsConfig): SectionRow[] {
  const configured = Array.isArray(config?.order)
    ? config.order.filter((id, index, list) => REGISTRY_IDS.includes(id) && list.indexOf(id) === index)
    : []
  const ids = [...configured, ...REGISTRY_IDS.filter((id) => !configured.includes(id))]
  return ids.map((id) => ({ id, enabled: config?.enabled?.[id] !== false }))
}

/**
 * Show/hide and reorder the homepage sections. The section registry lives in
 * code; this editor only writes the order and visibility flags the homepage
 * reads, so a saved section can never point at a route the site does not own.
 */
export default function HomepageSectionsEditor({ config }: { config?: HomepageSectionsConfig }) {
  const router = useRouter()
  const [rows, setRows] = useState<SectionRow[]>(() => initialRows(config))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const definition = (id: string) => SECTIONS.find((section) => section.id === id)
  const visibleCount = rows.filter((row) => row.enabled).length

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    setRows((current) => {
      const next = [...current]
      const [row] = next.splice(index, 1)
      next.splice(target, 0, row)
      return next
    })
    setStatus(null)
  }

  const toggle = (id: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, enabled: !row.enabled } : row)),
    )
    setStatus(null)
  }

  const save = async () => {
    setSaving(true)
    setStatus(null)
    try {
      await updateHomepageSectionsOrder(
        rows.map((row) => row.id),
        Object.fromEntries(rows.map((row) => [row.id, row.enabled])),
      )
      setStatus('Homepage sections published.')
      router.refresh()
    } catch {
      setStatus('Could not save the homepage sections. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Sections on the homepage</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              {visibleCount} of {rows.length} shown. Hidden sections keep their content and can be
              added back at any time.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            CMS controlled
          </span>
        </div>

        <ol className="mt-4 space-y-2">
          {rows.map((row, index) => {
            const section = definition(row.id)
            if (!section) return null
            return (
              <li
                key={row.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  row.enabled ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/70'
                }`}
              >
                <span className="w-6 text-center font-mono text-[11px] text-slate-400">
                  {row.enabled ? String(index + 1).padStart(2, '0') : '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-xs font-semibold ${row.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                    {section.label}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {section.collection} · {section.route}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    aria-label={`Move ${section.label} up`}
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    aria-label={`Move ${section.label} down`}
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(row.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      row.enabled
                        ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    {row.enabled ? (
                      <EyeOff className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3 w-3" aria-hidden="true" />
                    )}
                    {row.enabled ? 'Hide' : 'Add to homepage'}
                  </button>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? 'Publishing…' : 'Publish homepage order'}
          </button>
          {status && (
            <span className="text-[11px] font-medium text-slate-600" role="status">
              {status}
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        The introduction reads its copy and biography from the About page record, and the project
        grid reads from the Projects collection, so editing those pages updates the homepage too.
        Hide the introduction here to leave it off the homepage only — the About page keeps it.
      </p>
    </div>
  )
}
