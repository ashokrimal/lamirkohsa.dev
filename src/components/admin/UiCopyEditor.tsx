'use client'

import { useMemo, useState } from 'react'
import { RotateCcw, Save, Search } from 'lucide-react'
import { saveUiCopyValue } from '@/app/actions/ui-copy'
import type { UiCopyEntry, UiCopyOverrides } from '@/lib/ui-strings'

/**
 * Edits every interface label the public site renders. A row without an override
 * saves the built-in text, and clearing both fields deletes the override.
 */
export function UiCopyEditor({
  entries,
  overrides,
}: {
  entries: UiCopyEntry[]
  overrides: UiCopyOverrides
}) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const visible = needle
      ? entries.filter(
          (entry) =>
            entry.key.toLowerCase().includes(needle) ||
            entry.en.toLowerCase().includes(needle),
        )
      : entries
    const map = new Map<string, UiCopyEntry[]>()
    for (const entry of visible) {
      const group = entry.key.split('.')[0] || 'general'
      map.set(group, [...(map.get(group) ?? []), entry])
    }
    return Array.from(map.entries())
  }, [entries, query])

  const customized = Object.keys(overrides).length

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Site copy</p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">UI copy</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Every button, label and system message the site renders. Leave a field empty to keep
          the built-in text, or clear both fields to reset a label. Templates use{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">{'{name}'}</code>{' '}
          for values and{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">{'{name:one|many}'}</code>{' '}
          to pick a singular or plural form.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search labels or keys…"
            className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="Search interface copy"
          />
        </label>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
          {entries.length} labels · {customized} overridden
        </span>
      </div>

      <div className="space-y-6">
        {groups.map(([group, items]) => (
          <section key={group} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{group}</h3>
              <span className="text-[11px] text-slate-400">{items.length}</span>
            </header>
            <div className="divide-y divide-slate-100">
              {items.map((entry) => {
                const override = overrides[entry.key]
                const isTemplate = entry.template === true
                return (
                  <form
                    key={entry.key}
                    action={saveUiCopyValue}
                    className={`grid gap-2 px-4 py-3 sm:items-center ${
                      isTemplate
                        ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'
                        : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_auto]'
                    }`}
                  >
                    <input type="hidden" name="key" value={entry.key} />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11px] text-slate-500">{entry.key}</p>
                      {override ? (
                        <span className="mt-0.5 inline-flex rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                          Overridden
                        </span>
                      ) : (
                        <span className="mt-0.5 inline-flex text-[10px] text-slate-400">Default</span>
                      )}
                    </div>
                    <label className="min-w-0 text-[11px] font-medium text-slate-500">
                      <span className="sr-only">English text for {entry.key}</span>
                      <input
                        name="value"
                        defaultValue={override?.en ?? entry.en}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                      />
                    </label>
                    {!isTemplate && (
                      <label className="min-w-0 text-[11px] font-medium text-slate-500">
                        <span className="sr-only">Korean text for {entry.key}</span>
                        <input
                          name="korean"
                          defaultValue={override?.kr ?? entry.kr ?? ''}
                          placeholder="Korean (optional)"
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 placeholder:text-slate-400"
                        />
                      </label>
                    )}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-teal-700"
                      >
                        <Save className="h-3 w-3" aria-hidden="true" />
                        Save
                      </button>
                      {override && (
                        <button
                          type="submit"
                          name="reset"
                          value="1"
                          title="Reset to the built-in text"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          Reset
                        </button>
                      )}
                    </div>
                  </form>
                )
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
            No labels match “{query}”.
          </p>
        )}
      </div>
    </div>
  )
}
