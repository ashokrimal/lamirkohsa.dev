'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react'
import {
  createPage,
  savePageMeta,
  savePageSections,
  type SaveSectionInput,
} from '@/app/actions/studio'
import {
  SECTION_DEFINITIONS,
  SECTION_KEYS,
  isSectionKey,
  type SectionContent,
  type SectionFieldDefinition,
} from '@/lib/studio/sections'

interface AdminSection {
  id: number | null
  sectionKey: string
  sortOrder: number
  isEnabled: boolean
  content: Record<string, unknown>
}

interface AdminPage {
  page: {
    id: number | null
    slug: string
    title: string
    metaDescription: string
    isPublished: boolean
  }
  sections: AdminSection[]
}

type DraftRow = { sectionKey: string; isEnabled: boolean; content: Record<string, unknown> }

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-400'

function readField(content: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[part]
  }, content)
}

function writeField(content: Record<string, unknown>, key: string, value: unknown) {
  const parts = key.split('.')
  const next = { ...content }
  let cursor: Record<string, unknown> = next
  for (const part of parts.slice(0, -1)) {
    const existing = cursor[part]
    cursor[part] = existing && typeof existing === 'object' ? { ...(existing as object) } : {}
    cursor = cursor[part] as Record<string, unknown>
  }
  cursor[parts[parts.length - 1]] = value
  return next
}

/** Typed editor for one section payload — no raw JSON is ever shown. */
function SectionFields({
  sectionKey,
  content,
  onChange,
}: {
  sectionKey: string
  content: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}) {
  if (!isSectionKey(sectionKey)) {
    return <p className="text-[11px] text-rose-600">Unknown section type: {sectionKey}</p>
  }
  const fields: readonly SectionFieldDefinition[] = SECTION_DEFINITIONS[sectionKey].fields

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {fields.map((field) => {
        const raw = readField(content, field.key)
        if (field.type === 'checkbox') {
          return (
            <label key={field.key} className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={raw !== false}
                onChange={(event) => onChange(writeField(content, field.key, event.target.checked))}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              {field.label}
            </label>
          )
        }
        if (field.type === 'select') {
          return (
            <label key={field.key} className="block text-xs text-slate-700">
              {field.label}
              <select
                value={typeof raw === 'string' ? raw : field.options?.[0] ?? ''}
                onChange={(event) => onChange(writeField(content, field.key, event.target.value))}
                className={inputClass}
              >
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {field.hint && <span className="mt-0.5 block text-[10px] text-slate-400">{field.hint}</span>}
            </label>
          )
        }
        if (field.type === 'number') {
          return (
            <label key={field.key} className="block text-xs text-slate-700">
              {field.label}
              <input
                type="number"
                step={field.key.endsWith('intensity') ? 0.1 : 1}
                min={0}
                value={typeof raw === 'number' ? raw : ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value)
                  onChange(writeField(content, field.key, value))
                }}
                className={inputClass}
              />
            </label>
          )
        }
        if (field.type === 'textarea') {
          return (
            <label key={field.key} className="block text-xs text-slate-700 sm:col-span-2">
              {field.label}
              <textarea
                rows={2}
                value={typeof raw === 'string' ? raw : ''}
                onChange={(event) => onChange(writeField(content, field.key, event.target.value))}
                className={inputClass}
              />
            </label>
          )
        }
        return (
          <label key={field.key} className="block text-xs text-slate-700">
            {field.label}
            <input
              type={field.type === 'url' ? 'text' : 'text'}
              placeholder={field.placeholder}
              value={typeof raw === 'string' ? raw : ''}
              onChange={(event) => onChange(writeField(content, field.key, event.target.value))}
              className={inputClass}
            />
          </label>
        )
      })}
    </div>
  )
}

export default function PagesManager({ pages }: { pages: AdminPage[] }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<number | null>(pages[0]?.page.id ?? null)
  const [rows, setRows] = useState<DraftRow[]>(() => toDraft(pages[0]))
  const [title, setTitle] = useState(pages[0]?.page.title ?? '')
  const [metaDescription, setMetaDescription] = useState(pages[0]?.page.metaDescription ?? '')
  const [isPublished, setIsPublished] = useState(pages[0]?.page.isPublished ?? true)
  const [addKey, setAddKey] = useState<string>(SECTION_KEYS[0])
  const [newSlug, setNewSlug] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = pages.find((entry) => entry.page.id === selectedId)
  const slug = selected?.page.slug ?? '/'

  function toDraft(page: AdminPage | undefined): DraftRow[] {
    return (page?.sections ?? []).map((section) => ({
      sectionKey: section.sectionKey,
      isEnabled: section.isEnabled,
      content: section.content,
    }))
  }

  const choosePage = (id: number) => {
    const page = pages.find((entry) => entry.page.id === id)
    if (!page) return
    setSelectedId(id)
    setRows(toDraft(page))
    setTitle(page.page.title)
    setMetaDescription(page.page.metaDescription)
    setIsPublished(page.page.isPublished)
    setStatus(null)
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    setRows((current) => {
      const next = [...current]
      const [row] = next.splice(index, 1)
      next.splice(target, 0, row)
      return next
    })
  }

  const addSection = () => {
    if (!isSectionKey(addKey)) return
    if (rows.some((row) => row.sectionKey === addKey)) {
      setStatus(`${SECTION_DEFINITIONS[addKey].label} is already on this page.`)
      return
    }
    const defaults = SECTION_DEFINITIONS[addKey].defaults as SectionContent
    setRows((current) => [
      ...current,
      { sectionKey: addKey, isEnabled: true, content: defaults as Record<string, unknown> },
    ])
    setStatus(null)
  }

  const updateContent = (index: number, content: Record<string, unknown>) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, content } : row)))
  }

  const save = async () => {
    if (!selected?.page.id) return
    setSaving(true)
    setStatus(null)
    try {
      await savePageMeta({
        id: selected.page.id,
        slug,
        title,
        metaDescription,
        isPublished,
      })
      const sections: SaveSectionInput[] = rows.map((row, index) => ({
        sectionKey: row.sectionKey,
        sortOrder: index,
        isEnabled: row.isEnabled,
        content: row.content,
      }))
      await savePageSections({ pageId: selected.page.id, slug, sections })
      setStatus('Page published. The public route now reflects this.')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save this page.')
    } finally {
      setSaving(false)
    }
  }

  const addPage = async () => {
    if (!newSlug.trim()) return
    setSaving(true)
    try {
      await createPage({ slug: newSlug, title: newSlug })
      setNewSlug('')
      setStatus('Page created. Reload to edit its sections.')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create the page.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-surface p-4">
        <label className="text-xs text-slate-700">
          Page
          <select
            value={selectedId ?? ''}
            onChange={(event) => choosePage(Number(event.target.value))}
            className={inputClass}
          >
            {pages.map((entry) => (
              <option key={entry.page.id} value={entry.page.id ?? ''}>
                {entry.page.slug} — {entry.page.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-700">
          New page slug
          <input
            value={newSlug}
            onChange={(event) => setNewSlug(event.target.value)}
            placeholder="/studio"
            className={inputClass}
          />
        </label>
        <button
          type="button"
          onClick={addPage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add page
        </button>
      </div>

      {!selected?.page.id ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
          No pages in the studio yet. Run the seed (<code>pnpm studio:seed</code>) or add one above.
        </p>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-surface p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Page metadata</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-xs text-slate-700">
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-xs text-slate-700">
                Route
                <input value={slug} readOnly className={`${inputClass} bg-slate-50`} />
              </label>
              <label className="block text-xs text-slate-700 sm:col-span-2">
                Meta description
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />
                Published
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-surface p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Sections</h2>
              <div className="flex items-center gap-2">
                <select value={addKey} onChange={(e) => setAddKey(e.target.value)} className={inputClass}>
                  {SECTION_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {SECTION_DEFINITIONS[key].label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add section
                </button>
              </div>
            </div>

            {rows.length === 0 && (
              <p className="text-xs text-slate-500">This page has no sections yet.</p>
            )}

            {rows.map((row, index) => (
              <details
                key={`${row.sectionKey}-${index}`}
                className={`rounded-xl border p-3 ${
                  row.isEnabled ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50'
                }`}
              >
                <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
                  <span className="font-mono text-[11px] text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {isSectionKey(row.sectionKey) ? SECTION_DEFINITIONS[row.sectionKey].label : row.sectionKey}
                  {!row.isEnabled && <span className="text-[10px] text-slate-400">(hidden)</span>}
                </summary>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-slate-200 p-1 text-slate-500 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    className="rounded-md border border-slate-200 p-1 text-slate-500 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRows((current) =>
                        current.map((entry, i) =>
                          i === index ? { ...entry, isEnabled: !entry.isEnabled } : entry,
                        ),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700"
                  >
                    {row.isEnabled ? (
                      <EyeOff className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3 w-3" aria-hidden="true" />
                    )}
                    {row.isEnabled ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-600"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" /> Remove
                  </button>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <SectionFields
                    sectionKey={row.sectionKey}
                    content={row.content}
                    onChange={(content) => updateContent(index, content)}
                  />
                </div>
              </details>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {saving ? 'Publishing…' : 'Publish page'}
            </button>
            {status && (
              <span className="text-[11px] font-medium text-slate-600" role="status">
                {status}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
