'use client'

import { useRef, useState } from 'react'
import { Bold, Eye, Heading2, Link2, List, Pencil } from 'lucide-react'

function Preview({ value }: { value: string }) {
  const lines = value.split('\n')
  return (
    <div className="min-h-40 space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-700">
      {!value.trim() && <p className="text-slate-400">Nothing to preview yet.</p>}
      {lines.map((line, index) => {
        if (line.startsWith('## ')) {
          return (
            <h4 key={index} className="text-sm font-semibold text-slate-900">
              {line.slice(3)}
            </h4>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h3 key={index} className="text-base font-bold text-slate-900">
              {line.slice(2)}
            </h3>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <p key={index} className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>{line.slice(2)}</span>
            </p>
          )
        }
        if (!line.trim()) return <div key={index} className="h-1" />
        return <p key={index}>{line}</p>
      })}
    </div>
  )
}

export default function MarkdownField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [preview, setPreview] = useState(false)
  const textarea = useRef<HTMLTextAreaElement>(null)

  const insert = (before: string, after = before) => {
    const element = textarea.current
    if (!element) return
    const start = element.selectionStart
    const end = element.selectionEnd
    const selected = value.slice(start, end) || 'text'
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    onChange(next)
    requestAnimationFrame(() => {
      element.focus()
      element.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-400 hover:text-teal-700"
        >
          {preview ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {preview ? 'Write' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <Preview value={value} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-teal-500">
          <div className="flex items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
            {[
              { icon: Bold, label: 'Bold', before: '**', after: '**' },
              { icon: Heading2, label: 'Heading', before: '## ', after: '' },
              { icon: Link2, label: 'Link', before: '[', after: '](https://)' },
              { icon: List, label: 'List', before: '- ', after: '' },
            ].map((tool) => (
              <button
                key={tool.label}
                type="button"
                aria-label={tool.label}
                title={tool.label}
                onClick={() => insert(tool.before, tool.after)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-teal-700"
              >
                <tool.icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="ml-auto pr-1 text-[10px] text-slate-400">Markdown</span>
          </div>
          <textarea
            ref={textarea}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={9}
            placeholder="Write with Markdown…"
            className="block w-full resize-y bg-transparent p-3 text-xs text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      )}
    </div>
  )
}
