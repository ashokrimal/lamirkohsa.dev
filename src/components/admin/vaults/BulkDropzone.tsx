'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react'
import { createCmsContent } from '@/app/actions/content-cms'
import { useCmsToast } from '@/components/admin/ui/CmsToast'
import type { VaultRecord } from '@/lib/admin-vaults'

interface UploadPreview {
  name: string
  url: string
}

export default function BulkDropzone({
  domain,
  collection,
  category,
  onCreated,
}: {
  domain: 'gallery' | 'media'
  collection: string
  category?: string
  onCreated: (record: VaultRecord) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useCmsToast()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [previews, setPreviews] = useState<UploadPreview[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/')).slice(0, 12)
    if (!files.length) return

    setError(null)
    setUploading(true)
    const localPreviews = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    setPreviews(localPreviews)

    let completed = 0
    for (const file of files) {
      setProgress(`Uploading ${completed + 1} of ${files.length}…`)
      try {
        const body = new FormData()
        body.set('file', file)
        const response = await fetch('/api/admin/upload', { method: 'POST', body })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || !result.url) throw new Error(result.error || `Upload failed (${response.status}).`)

        const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Untitled frame'
        const payload =
          domain === 'gallery'
            ? {
                imageUrl: result.url,
                category: category || 'Experiments',
                location: 'Gallery grid',
                altText: title,
                featured: false,
              }
            : {
                coverUrl: result.url,
                category: category || 'Watchlist',
                featured: false,
              }

        const record = new FormData()
        record.set('collection', collection)
        record.set('title', title)
        record.set('payload', JSON.stringify(payload))
        record.set('status', 'draft')
        await createCmsContent(record)

        onCreated({
          id: -Date.now() - completed,
          collection,
          title,
          status: 'draft',
          payload,
        })
        completed += 1
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
        break
      }
    }

    setUploading(false)
    setProgress('')
    if (completed > 0) {
      toast({
        title: `${completed} ${completed === 1 ? 'draft' : 'drafts'} created`,
        description: `Uploaded to the ${domain === 'gallery' ? 'gallery' : 'media'} vault. Review and publish when ready.`,
      })
      router.refresh()
    }
    if (input.current) input.current.value = ''
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void handleFiles(event.dataTransfer.files)
        }}
        onClick={() => !uploading && input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') input.current?.click()
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors sm:flex-row sm:text-left ${
          dragging
            ? 'border-teal-500 bg-teal-50/70'
            : 'border-slate-300 bg-slate-50/60 hover:border-teal-400 hover:bg-teal-50/40'
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-xs">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800">
            {uploading ? progress : 'Drop images here to upload'}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {uploading
              ? 'Thumbnails are generated from each upload.'
              : `Creates draft ${domain === 'gallery' ? 'frames' : 'titles'} with automatic thumbnails.`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700">
          <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" /> Choose files
        </span>
      </div>

      {previews.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {previews.map((preview) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={preview.url}
              src={preview.url}
              alt={preview.name}
              className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-[11px] font-medium text-rose-600">{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
    </div>
  )
}
