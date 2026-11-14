'use client'

import { useRef, useState } from 'react'
import { Loader2, Music2, Upload, X } from 'lucide-react'

export default function AudioUploadField({
  label,
  value,
  onChange,
  hint = 'Upload an audio file or paste a stream URL.',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.set('file', file)
      const response = await fetch('/api/admin/upload', { method: 'POST', body })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.url) throw new Error(result.error || `Upload failed (${response.status}).`)
      onChange(result.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Audio upload failed.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600"
          >
            <X className="h-3 w-3" aria-hidden="true" /> Remove
          </button>
        )}
      </div>

      {value ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
          <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-600">
            <Music2 className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
            <span className="truncate">{value}</span>
          </div>
          <audio src={value} controls preload="metadata" className="h-9 w-full" />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-1 text-[11px] font-medium text-teal-700 hover:underline"
          >
            Replace audio
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-500 hover:text-teal-700 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" /> Upload audio from device
            </>
          )}
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        className="hidden"
        onChange={(event) => upload(event.target.files?.[0])}
      />
      <input
        type="text"
        inputMode="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://…"
        aria-label={`${label} URL`}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
      />
      <p className="text-[11px] text-slate-500">{error ?? hint}</p>
    </div>
  )
}
