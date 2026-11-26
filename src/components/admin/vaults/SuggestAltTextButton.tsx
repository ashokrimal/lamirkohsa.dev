'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { suggestAltText } from '@/app/actions/alt-text'

/**
 * Asks the server for one alt-text sentence and hands it to the editor. The
 * value stays editable and is only stored when the record is saved.
 */
export function SuggestAltTextButton({
  imageUrl,
  title,
  onApply,
}: {
  imageUrl: string
  title: string
  onApply: (text: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggest = async () => {
    setBusy(true)
    setError(null)
    try {
      const result = await suggestAltText({ imageUrl, title })
      if (result.ok) onApply(result.text)
      else setError(result.error)
    } catch {
      setError('The suggestion could not be generated.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => void suggest()}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
      >
        <Sparkles className={`h-3 w-3 ${busy ? 'animate-pulse' : ''}`} aria-hidden="true" />
        {busy ? 'Describing…' : 'Suggest alt text'}
      </button>
      {error && <p className="mt-1 text-[10px] text-rose-600">{error}</p>}
    </div>
  )
}
