'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** When provided, the current value is posted with the surrounding form. */
  name?: string
  hint?: string
  accept?: string
}

/**
 * Image field with two ways in: upload a file from the device (stored in Blob
 * storage through /api/admin/upload) or paste an existing URL. Nothing is
 * prefilled, so an empty CMS stays empty.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  name,
  hint = 'Upload from your device or paste an image URL.',
  accept = 'image/*',
}: ImageUploadFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setIsUploading(true)
    try {
      const body = new FormData()
      body.set('file', file)
      const response = await fetch('/api/admin/upload', { method: 'POST', body })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.url) {
        throw new Error(result.error || `Upload failed (${response.status}).`)
      }
      onChange(result.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
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
            <X className="h-3 w-3" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Selected upload preview"
            className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-slate-600">{value}</p>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="mt-1 text-[11px] font-medium text-teal-700 hover:underline"
            >
              Replace file
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-500 hover:text-teal-700 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload from device
            </>
          )}
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <input
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://…"
        aria-label={`${label} URL`}
        className="w-full rounded-xl border border-line-subtle bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      />
      {name && <input type="hidden" name={name} value={value} />}
      <p className="text-[11px] text-slate-500">{error ?? hint}</p>
    </div>
  )
}
